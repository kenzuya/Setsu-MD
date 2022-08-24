import { downloadv2, convertMP3, createSessionUUID } from "../Library/Modules";
import { isUrl } from "../Library/Modules";
import { ttsave } from "../Plugins/Scraper";
import crypto from "crypto";
import { readFileSync, rm, rmSync } from "fs";
import * as global from "../Config/Config.json";
import { WAMethods } from "../Library/Functions";
import { MessageSerializer } from "../Library/Serialize";
import { AnyMessageContent, proto } from "@adiwajshing/baileys";
/**
 *
 * @param {import('@adiwajshing/baileys').WASocket} setsu
 * @param {import('../Library/Serialize')} m
 */
const handler = async (setsu: WAMethods, m: MessageSerializer) => {
    try {
        if (m.command === "ttnowm") {
            if (!m.query) return m.reply(`Tempel linknya!\n\nAtau bisa ketik ${m.bold}${m.italic}.tt <Linknya>${m.italic}${m.bold}`);
            if (!isUrl(m.args![0]) && !m.args![0].includes("tiktok.com")) return m.reply("*Ini Bukan Link Tiktok tod!*");
            m.reply(global.mess.wait);
            setTimeout(() => {
                setsu.sendPresenceUpdate("recording", m.chat);
            }, 1000);
            const tiktok = await ttsave(m.query);
            setsu.sendMessage(m.chat, { video: { url: tiktok.link.nowm }, caption: global.mess.done, mimetype: "video/mp4" }, {});
        } else if (m.command === "ttwm") {
            if (!m.query) return m.reply(`Tempel linknya!\n\nAtau bisa ketik ${m.bold}${m.italic}.tt <Linknya>${m.italic}${m.bold}`);
            if (!isUrl(m.args![0]) && !m.args![0].includes("tiktok.com")) return m.reply("*Ini Bukan Link Tiktok tod!*");
            m.reply(global.mess.wait);
            setTimeout(() => {
                setsu.sendPresenceUpdate("recording", m.chat);
            }, 1000);
            const tiktok = await ttsave(m.args![0]);
            setsu.sendVideo(m.chat, tiktok.link.wm, global.mess.done);
        } else if (m.command === "ttmp3") {
            if (!m.query) return m.reply(`Tempel linknya!\n\nAtau bisa ketik ${m.bold}${m.italic}.tt <Linknya>${m.italic}${m.bold}`);
            if (!isUrl(m.args![0]) && !m.args![0].includes("tiktok.com")) return m.reply("*Ini Bukan Link Tiktok tod!*");
            // if (m.quoted) await setsu.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.id, participant: m.quoted.sender } });
            m.reply(global.mess.wait);
            setTimeout(() => {
                setsu.sendPresenceUpdate("recording", m.chat);
            }, 1000);
            const tiktok = await ttsave(m.args![0]);
            const file = `./Data/Temp/${crypto.randomBytes(10).toString("hex")}`;
            await downloadv2(tiktok.link.nowm, file + ".mp4");
            await convertMP3(file + ".mp4", file + ".mp3");
            // setsu.sendAudio(m.chat, file + ".mp3", "Done ya kak");
            await setsu.sendMessage(m.chat, { audio: readFileSync(`${file}.mp3`), caption: "Done ya kak", mimetype: "audio/mpeg" });
            rmSync(file + ".mp4");
            rmSync(file + ".mp3");
        } else {
            if (m.command) {
                if (!m.args![0]) return m.reply(`Tempel linknya!\n\nAtau bisa ketik ${m.bold}${m.italic}.tt <Linknya>${m.italic}${m.bold}`);
                else if (!isUrl(m.args![0]) && !m.args![0].includes("tiktok.com")) return m.reply("*Ini Bukan Link Tiktok tod!*");
            }
            m.reply(global.mess.wait);
            setTimeout(() => {
                setsu.sendPresenceUpdate("recording", m.chat);
            }, 1000);
            const tiktok = await ttsave(m.args![0] || m.body!);
            const caption = `
📌Username: ${tiktok.profile.username}
🤡Name: ${tiktok.profile.name}

📺Views: ${m.bold}${m.italic}${tiktok.views}${m.italic}${m.bold}
🪄Likes: ${m.bold}${m.italic}${tiktok.likes}${m.italic}${m.bold}
💬Comments: ${m.bold}${m.italic}${tiktok.comments}${m.italic}${m.bold}
📤Share: ${m.bold}${m.italic}${tiktok.share}${m.italic}${m.bold}
✏️Caption: ${tiktok.caption}
                `;
            // const secti = [
            //     { index: 1, urlButton: { displayText: "Open Profile", url: tiktok.profile.url } },
            //     { index: 2, quickReplyButton: { displayText: "No Watermark", id: `${m.prefix}directsendfromurl ${tiktok.link.nowm}` } },
            //     { index: 3, quickReplyButton: { displayText: "Watermark", id: `${m.prefix}directsendfromurl ${tiktok.link.nowm}` } },
            //     { index: 4, quickReplyButton: { displayText: "Convert to MP3", id: `${m.prefix}ttmp3 ${m.args[0] || m.body}` } },
            // ];
            const nowmUUID = createSessionUUID(tiktok.link.nowm);
            const wmUUID = createSessionUUID(tiktok.link.wm);
            const Buttons: proto.Message.ButtonsMessage.IButton[] = [
                { buttonId: `${m.prefix}__directsendfromurl ${nowmUUID}`, buttonText: { displayText: "No Watermark" }, type: 1 },
                { buttonId: `${m.prefix}__directsendfromurl ${wmUUID}`, buttonText: { displayText: "Watermark" }, type: 1 },
                { buttonId: `${m.prefix}ttmp3 ${m.args![0] || m.body}`, buttonText: { displayText: "Convert to MP3" }, type: 1 },
            ];
            const options: AnyMessageContent = {
                image: { url: tiktok.link.thumbnail },
                caption: caption,
                mimetype: "image/jpeg",
                footer: m.footer,
                buttons: Buttons,
            };
            setsu.sendMessage(m.chat, options);
        }
    } catch (e) {
        console.log(e);
        m.reply("Terjadi error, coba ulangi lagi");
    }
};
handler.title = "📥 TikTok Downloader";
handler.command = ["tt", "ttwm", "ttnowm", "ttmp3"];
export default handler;
