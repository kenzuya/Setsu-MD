import ytdl from "ytdl-core";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { Client, VideoCompact } from "youtubei";
interface FormDataObject {
    type?: "youtube";
    _id?: string;
    v_id?: string;
    ajax?: "1" | 1;
    token?: string;
    ftype?: "mp3";
    fquality?: number;
    url?: string;
    q_auto?: number;
}
type PlaylistID = string;
export namespace YouTube {
    export class Get {
        readonly ytIdRegex: RegExp;
        constructor() {
            this.ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\\-nocookie|)\.com\/(?:watch\?.*(?:|\\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
        }
        public static async AudioOnly(url: string) {
            const ytb = await ytdl.getInfo(url);
            const audio = ytdl.filterFormats(ytb.formats, "audioonly");
            return audio.find((x) => x.audioQuality === "AUDIO_QUALITY_MEDIUM" && x.audioCodec?.includes("mp4"));
        }
        public static async VideoOnly(url: string) {
            const ytb = await ytdl.getInfo(url);
            const video = ytdl.filterFormats(ytb.formats, "videoonly");
            return video.filter((x) => x.videoCodec?.includes("avc1"));
        }
        public static async Video(url: string) {
            const ytb = await ytdl.getInfo(url);
            const video_and_audio = ytdl.filterFormats(ytb.formats, "videoandaudio");
            return video_and_audio;
        }
        public static Audio(URL: string): Promise<IAudioResult> {
            const instance = new Get();
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            return new Promise((resolve, reject) => {
                if (instance.ytIdRegex.test(URL)) {
                    const ytId = instance.ytIdRegex.exec(URL);
                    const url = "https://youtu.be/" + ytId![1];
                    instance
                        .post("https://www.y2mate.com/mates/en60/analyze/ajax", {
                            url,
                            q_auto: 0,
                            ajax: 1,
                        })
                        .then((res) => res.json())
                        .then((res) => {
                            const document = new JSDOM(res.result).window.document;
                            const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ["", ""];
                            const thumb = document.querySelector("img")!.src;
                            const title = document.querySelector("b")!.innerHTML;

                            instance
                                .post("https://www.y2mate.com/mates/en60/convert", {
                                    type: "youtube",
                                    _id: id![1],
                                    v_id: ytId![1],
                                    ajax: "1",
                                    token: "",
                                    ftype: "mp3",
                                    fquality: 128,
                                })
                                .then((res) => res.json())
                                .then((res) => {
                                    resolve({
                                        dl_link: /<a.+?href="(.+?)"/.exec(res.result)![1],
                                        thumb,
                                        title,
                                    });
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else reject("URL INVALID");
            });
        }
        public static async Playlist(id: PlaylistID) {
            const yt = new Client();
            const Playlist = await yt.getPlaylist(id);
            // @ts-ignore
            return Playlist?.videos.items as VideoCompact[];
        }
        private post(url: string, formdata: FormDataObject) {
            return fetch(url, {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
                body: Object.keys(formdata)
                    .map((key: keyof FormDataObject | string) => `${key}=${encodeURIComponent(formdata[key as keyof FormDataObject]!)}`)
                    .join("&"),
            });
        }
    }
    export class Match {
        private RegExpYTLink: RegExp;
        private RegExpYTVideo: RegExp;
        private RegExpYTPlaylist: RegExp;
        private RegExpYTPlaylistID: RegExp;
        private RegExpYTVideoAndPlaylist: RegExp;
        private url: string;
        constructor(url: string) {
            this.url = url;
            this.RegExpYTLink = /(http:|https:)?\/\/(www\.)?(youtube.com|youtu.be)\/(watch|playlist)?(\?v=|\?list=)?(\S+)?/;
            this.RegExpYTVideo = /watch?(\?v=)?(\S+)?/;
            this.RegExpYTPlaylist = /playlist?(\?list=)?(\S+)?/;
            this.RegExpYTPlaylistID = /[&|\?]list=([a-zA-Z0-9_-]+)/gi;
            this.RegExpYTVideoAndPlaylist =
                /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>\"']*)[\?|&](list=)(.*)\&/gm;
        }
        public URL_Link() {
            return this.RegExpYTLink.test(this.url);
        }
        public Video_Link() {
            return this.RegExpYTVideo.test(this.url);
        }
        public Playlist_Link() {
            return this.RegExpYTPlaylist.test(this.url);
        }
        public Playlist_ID() {
            return this.RegExpYTPlaylistID.exec(this.url);
        }
        public Video_and_Playlist() {
            return this.RegExpYTVideoAndPlaylist.exec(this.url);
        }
    }
}

interface IAudioResult {
    dl_link: string;
    thumb: string;
    title: string;
}
