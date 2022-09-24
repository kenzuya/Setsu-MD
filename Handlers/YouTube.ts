import { Client, Video } from "youtubei";
import { getBuffer, fmtMSS, jmlTayang, downloadv2, merge, youtube_parser, createSessionUUID, secondsToMinutes, useSessionUUID } from "../Library/Modules";
import { YouTube } from "../Plugins/youtube";
import { custom_msg } from "../Library/Fakes";
import yts from "yt-search";
import crypto from "crypto";
import * as global from "../Config/Config.json";
import { readFileSync, statSync, unlinkSync } from "fs";
import { WAMethods } from "../Library/Functions";
import { MessageSerializer } from "../Library/Serialize";
import { AnyMessageContent, proto } from "@adiwajshing/baileys";
import path from "path";
const handler = async (setsu: WAMethods, m: MessageSerializer) => {
    if (m.command === "yt") HandleYTPreview(setsu, m);
    else if (m.command === "ytv") HandleYTVideo(setsu, m);
    else if (m.command === "yta") HandleYTAudio(setsu, m);
    else if (m.command === "yts") HandleYTSearch(setsu, m);
    else if (m.command === "ytadvres") HandleYTAdvancedResolution(setsu, m);
    else if (m.command === "__ytcombine") HandleYTCombine(setsu, m);
    else if (m.command === "ytp") HandleYTPlaylist(setsu, m);
    else HandleYTPreview(setsu, m);
};
handler.command = ["yt", "ytv", "yta", "ytp", "yts", "__ytcombine", "ytadvres"];
export default handler;

enum Message {
    NO_LINK_ON_YTSEARCH = "Kirim Perintah *.yts <teksnya>*",
    NO_LINK_ON_YTVIDEO = "Kirim Perintah *.yt <teksnya>*",
    NO_LINK_ON_YTAUDIO = "Kirim Perintah *.yta <teksnya>*",
    ERROR_SENDING_AUDIO = "```[ ! ] Error Saat Mengirim Audio```",
    ERROR_SEARCHING_VIDEO = "```[ ! ] Error Saat Mencari Video```",
    ERROR_DOWNLOADING_VIDEO = "```[ ! ] Error Saat Mendownload Video```",
    ERROR_MERGING_VIDEO = "```[ ! ] Error Saat Menggabungkan Video```",
    ERROR_GETTING_METADATA = "```[ ! ] Error Saat Mendapatkan Informasi Link```",
    ERROR_GETTING_VIDEO_METADATA = "```[ ! ] Error Saat Mendapatkan Informasi Video```",
    ERROR_GETTING_PLAYLIST_METADATA = "```[ ! ] Error Saat Mendapatkan Informasi Playlist```",
    ERROR_GETTING_VIDEO_AND_AUDIO_URL = "```[ ! ] Error Saat Mendapatkan URL Video Dan Audio```",
    ERROR_GETTING_VIDEO_URL = "```[ ! ] Error Saat Mendapatkan URL Video```",
    ERROR_GETTING_AUDIO_URL = "```[ ! ] Error Saat Mendapatkan URL Audio```",
    INVALID_URL = "```[ ! ] Ini Bukan Link YouTube```",
    CANNOT_USE_PLAYLIST_URL = "```[ ! ] Tidak Bisa Menggunakan Playlist Link```",
    CANNOT_USE_VIDEO_URL = "```[ ! ] Tidak Bisa Menggunakan Video Link```",
    CANNOT_PARSING_PLAYLIST_ID = "```[ ! ] Gagal Memisahkan Playlist ID```",
    CANNOT_PARSING_VIDEO_ID = "```[ ! ] Gagal Memisahkan Video ID```",
    CANNOT_USE_SHORT_LINKS = "```[ ! ] Untuk Saat Ini YouTube Short Belum Support```",
}

async function HandleYTVideo(setsu: WAMethods, m: MessageSerializer): Promise<any> {
    if ((m.args?.length as number) < 1) m.reply(Message.NO_LINK_ON_YTVIDEO);
    if (m.quoted) await m.quoted.delete();
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isYouTubePlaylistURL = new YouTube.Match(m.args![0]).Playlist_Link();
    if (!isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isYouTubePlaylistURL) return m.reply(Message.CANNOT_USE_PLAYLIST_URL);
    if (m.args![0].includes("shorts")) return m.reply(Message.CANNOT_USE_SHORT_LINKS);
    m.reply(global.mess.wait);
    try {
        const butvideoResults = await YouTube.Get.Video(m.args![0]);
        const durationms = parseInt(butvideoResults[0].approxDurationMs as string);
        if (durationms > 1200000) return m.reply(`${m.bold}[ ! ] Video melebihi 20 menit tidak diizinkan${m.bold}`);
        const Rows: proto.Message.ListMessage.IRow[] = butvideoResults.map((vid) => {
            const uuid = createSessionUUID(vid.url);
            return { title: `Resolution ${vid.qualityLabel}`, rowId: `${m.prefix}__directsendfromurl ${uuid}` };
        });
        const ListVideoSections = [
            { title: "Select Resolution", rows: Rows },
            { title: "Other", rows: [{ title: "All Resolution", rowId: `${m.prefix}ytadvres ${m.args![0]}` }] },
        ];
        const ListVideoText = `
Pilih Resolution dibawah!
`;
        const ListVideoContext: AnyMessageContent = {
            text: ListVideoText,
            footer: m.footer,
            title: `${m.bold}Pilih${m.bold}`,
            buttonText: "Select Resolution!",
            sections: ListVideoSections,
        };
        setsu.sendMessage(m.chat, ListVideoContext);
    } catch (err) {
        return m.reply(Message.ERROR_DOWNLOADING_VIDEO);
    }
}

async function HandleYTAudio(setsu: WAMethods, m: MessageSerializer) {
    if (!m.query) return m.reply(Message.NO_LINK_ON_YTAUDIO);
    if (m.quoted) await setsu.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.id } });
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isYouTubePlaylistURL = new YouTube.Match(m.args![0]).Playlist_Link();
    if (!isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isYouTubePlaylistURL) return m.reply(Message.CANNOT_USE_PLAYLIST_URL);
    if (m.args![0].includes("shorts")) return m.reply(Message.CANNOT_USE_SHORT_LINKS);
    m.reply(global.mess.wait);
    await setsu.typing(m.chat);
    try {
        const YTAudio = await YouTube.Get.Audio(m.args![0]);
        const AudioBuffer = await getBuffer(YTAudio.dl_link);
        return setsu.sendMessage(m.chat, { audio: AudioBuffer!, mimetype: "audio/mp4" }, m.device !== "web" ? { quoted: custom_msg(YTAudio.title) } : undefined);
    } catch (err) {
        m.reply(Message.ERROR_SENDING_AUDIO);
    }
}

async function HandleYTSearch(setsu: WAMethods, m: MessageSerializer) {
    try {
        if (!m.query) {
            return m.reply(Message.NO_LINK_ON_YTSEARCH);
        } else {
            m.reply(global.mess.wait);
            const search = await yts(m.query);
            const filtered = search.all.filter((search) => search.type === "video") as yts.VideoSearchResult[];
            const Rows: proto.Message.ListMessage.IRow[] = filtered.map((video) => {
                return { title: video.title, rowId: `${m.prefix}yt ${video.url}`, description: `Durasi: ${video.timestamp}` };
            });
            const ListSearchText = `
Ditemukan ${m.italic}${filtered.length}${m.italic} video
${m.italic}Pilih Video di List!${m.italic}
            `;
            const ListVideoSections: proto.Message.ListMessage.ISection[] = [{ title: "Select Video", rows: Rows }];
            const ListSearchContext: AnyMessageContent = {
                text: ListSearchText,
                footer: m.footer,
                buttonText: "Select Video",
                sections: ListVideoSections,
            };
            return setsu.sendMessage(m.chat, ListSearchContext);
        }
    } catch (error) {
        return m.reply(Message.ERROR_SEARCHING_VIDEO);
    }
}

async function HandleYTAdvancedResolution(setsu: WAMethods, m: MessageSerializer) {
    if (!m.query) return m.reply(global.mess.nolink);
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isYouTubePlaylistURL = new YouTube.Match(m.args![0]).Playlist_Link();
    if (!isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isYouTubePlaylistURL) return m.reply(Message.CANNOT_USE_PLAYLIST_URL);
    if (m.args![0].includes("shorts")) return m.reply(Message.CANNOT_USE_SHORT_LINKS);
    m.reply(global.mess.waitM);
    try {
        const VideoData = await YouTube.Get.VideoOnly(m.args![0]);
        const AudioData = await YouTube.Get.AudioOnly(m.args![0]);
        const Rows: proto.Message.ListMessage.IRow[] = VideoData.map((video) => {
            return { title: `Resolution ${video.qualityLabel}`, rowId: `${m.prefix}__ytcombine ${video.url} ${AudioData?.url}` };
        });
        const Sections: proto.Message.ListMessage.ISection[] = [{ title: `List of Available Resolution`, rows: Rows }];
        const Text = `${m.italic}Pilih Resolution di List${m.italic}`;
        const ContextInfo: AnyMessageContent = {
            text: Text,
            footer: m.footer,
            buttonText: "Select Resolution!",
            sections: Sections,
        };
        return setsu.sendMessage(m.chat, ContextInfo);
    } catch (err) {
        return m.reply(Message.ERROR_GETTING_VIDEO_METADATA);
    }
}

async function HandleYTCombine(setsu: WAMethods, m: MessageSerializer) {
    if (!m.args![0] && !m.args![1]) return m.reply(global.mess.invalid);
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isYouTubeURLOnArgs1 = new YouTube.Match(m.args![1]).URL_Link();
    if (isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isYouTubeURLOnArgs1) return m.reply(Message.INVALID_URL);
    m.reply(global.mess.waitM);
    const VideoPath = path.resolve(process.cwd(), "Data", "Temp", crypto.randomBytes(10).toString("hex") + ".mp4");
    const AudioPath = path.resolve(process.cwd(), "Data", "Temp", crypto.randomBytes(10).toString("hex") + ".mp4");
    const MergedPath = path.resolve(process.cwd(), "Data", "Temp", crypto.randomBytes(10).toString("hex") + ".mp4");
    try {
        await downloadv2(m.args![0], VideoPath);
        await downloadv2(m.args![1], AudioPath);
        await merge(VideoPath, AudioPath, MergedPath);
        const stats = statSync(MergedPath);
        if (stats.size > 104857600)
            return await setsu.sendMessage(m.chat, { document: readFileSync(MergedPath), mimetype: "video/mp4", fileName: `video.mp4`, caption: `${m.italic}Done ya kak...${m.italic}` });
        else return await setsu.sendMessage(m.chat, { video: readFileSync(MergedPath), caption: "Done ya kak..." });
    } catch (err) {
        return m.reply(Message.ERROR_MERGING_VIDEO);
    } finally {
        try {
            unlinkSync(VideoPath);
            unlinkSync(AudioPath);
            unlinkSync(MergedPath);
        } catch {
            return;
        }
    }
}

async function HandleYTPlaylist(setsu: WAMethods, m: MessageSerializer) {
    if ((m.args?.length as number) < 1) return m.reply(Message.CANNOT_USE_VIDEO_URL);
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isYouTubeVideoURL = new YouTube.Match(m.args![0]).Video_Link();
    if (!isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isYouTubeVideoURL) return m.reply(Message.CANNOT_USE_VIDEO_URL);
    if (m.args![0].includes("shorts")) return m.reply(Message.CANNOT_USE_SHORT_LINKS);
    m.reply(global.mess.wait);
    try {
        const Parsed = new YouTube.Match(m.args![0]).Playlist_ID();
        const isParsed = Parsed ? true : false;
        if (!isParsed) return m.reply(Message.CANNOT_PARSING_PLAYLIST_ID);
        const Playlist = await YouTube.Get.Playlist(Parsed![1]);
        const Rows: proto.Message.ListMessage.IRow[] = Playlist.map((video) => {
            return { title: video.title, description: `Durasi: ${secondsToMinutes(video.duration!)}`, rowId: `${m.prefix}yt https://youtu.be/${video.id}` };
        });
        const PlaylistSections: proto.Message.ListMessage.ISection[] = [{ title: "List Playlist", rows: Rows }];
        const PlaylistContextInfo: AnyMessageContent = {
            text: `${m.bold}Ditemukan ${Playlist.length} video, silahkan pilih video di List...${m.bold}`,
            footer: m.footer,
            buttonText: "Select Video",
            sections: PlaylistSections,
        };
        return setsu.sendMessage(m.chat, PlaylistContextInfo);
    } catch (err) {
        return m.reply(Message.ERROR_GETTING_PLAYLIST_METADATA);
    }
}

async function HandleYTPreview(setsu: WAMethods, m: MessageSerializer) {
    if (m.isCmd) {
        if (!m.query) return m.reply(Message.NO_LINK_ON_YTVIDEO);
    }
    const isYouTubeURL = new YouTube.Match(m.args![0]).URL_Link();
    const isPlaylistURL = new YouTube.Match(m.args![0]).Playlist_Link();
    if (!isYouTubeURL) return m.reply(Message.INVALID_URL);
    if (isPlaylistURL) return HandleYTPlaylist(setsu, m);
    if (m.args![0].includes("shorts")) return m.reply(Message.CANNOT_USE_SHORT_LINKS);
    if (m.args?.includes("--direct")) return HandleYTVideo(setsu, m);
    if (m.quoted) await m.quoted.delete();
    try {
        m.reply(global.mess.wait);
        const videoId = youtube_parser(m.args![0]);
        if (!videoId) return m.reply(Message.CANNOT_PARSING_VIDEO_ID);
        const yt = new Client();
        const ytb = (await yt.getVideo(videoId as string)) as Video;
        const Caption = `ＹＯＵＴＵＢＥ　ＶＩＤＥＯ 📽️

•💬 Judul : ${ytb?.title}
•▶️ Durasi : ${fmtMSS(ytb.duration)}
•👁️️ Views : ${jmlTayang(ytb.viewCount as number, 1)}
•🪄 Likes : ${jmlTayang(ytb.likeCount as number, 1)}
•⏰️ Diupload Pada : ${ytb.uploadDate}
•🎥 ID Video : ${ytb.id}
•🎎 Author : ${ytb.channel.name}
•🎉 Subscriber : ${ytb.channel.subscriberCount || "Hidden"}
`;

        const Buttons: proto.Message.ButtonsMessage.IButton[] = [
            { buttonId: `${m.prefix}ytv https://www.youtube.com/watch?v=${ytb.id}`, buttonText: { displayText: "🎥 VIDEO" }, type: 1 },
            { buttonId: `${m.prefix}yta https://www.youtube.com/watch?v=${ytb.id}`, buttonText: { displayText: "🎵 AUDIO" }, type: 1 },
        ];
        const ContextInfo: AnyMessageContent = {
            image: { url: ytb.thumbnails.slice(-1)[0].url },
            caption: Caption,
            footer: m.footer,
            buttons: Buttons,
        };
        return setsu.sendMessage(m.chat, ContextInfo);
    } catch (error) {
        return m.reply(Message.ERROR_GETTING_METADATA);
    }
}
