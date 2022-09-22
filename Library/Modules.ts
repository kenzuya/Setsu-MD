import fetch from "node-fetch";
import https from "https";
import http from "http";
import axios, { AxiosRequestConfig } from "axios";
import Ffmpeg from "fluent-ffmpeg";
import EasyDL from "easydl";
import moment from "moment-timezone";
import { FileExtension } from "file-type";
import Jimp from "jimp";
import { GroupMetadata } from "@adiwajshing/baileys";
import chalk from "chalk";
import { join, parse } from "path";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { readdir } from "fs/promises";
import { WAMethods } from "./Functions";
import { MessageSerializer } from "./Serialize";
import Logger from "./Logger";
import { exec } from "child_process";
import { randomUUID } from "crypto";
export async function getBuffer(url: string) {
    try {
        const buffer = await (await fetch(url)).buffer();
        return buffer;
    } catch (error) {
        console.error(error);
    }
}

export function getSizeFromURL(url: string) {
    return new Promise((res, rej) => {
        const req = url.startsWith("https://") ? https.get(url) : http.get(url);
        req.once("response", (r) => {
            req.abort();
            const c = typeof r.headers["content-length"] === "string" ? parseInt(r.headers["content-length"]) : res(r.headers["content-length"]);
            if (!c) rej("Couldn't get file size");
        });
        req.once("error", (e) => rej(e));
    });
}
export function jmlTayang(num: number, digits = 1): string {
    const si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "jt" },
        { value: 1e9, symbol: "M" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
export function youtube_parser(url: string) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
}
export function makeid(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
export function ytlink(link: string) {
    return link.match(new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/));
}
export async function getBase64(url: string) {
    const image = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(image.data).toString("base64");
    return base64;
}
export function convertMP3(source: string, output: string): Promise<string> {
    return new Promise((resolve, reject) => {
        Ffmpeg({ source: source })
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve("Done Converting MP3"))
            .save(output);
    });
}
export function merge(source: string, input: string, output: string) {
    return new Promise((resolve, reject) => {
        const options = [];
        options.push(`[1]volume=1.0[a1]`);
        options.push("[a1]amix=inputs=1[a]");
        Ffmpeg({ source: source }) // './Trash/video.mp4'
            .input(input) // './Trash/audio.mp4'
            .complexFilter(options)
            .addOptions(["-map 0:v", "-map [a]", "-c:v copy"])
            .format("mp4")
            .on("error", (err) => reject("There is a error" + err))
            .on("end", () => resolve("Merging finished!"))
            .save(output); //'./Trash/output.mp4'
    });
}
export async function downloadv2(url: string, path: string) {
    const dl = await new EasyDL(url, path, {
        connections: 20,
        maxRetry: 5,
    })
        .setMaxListeners(25)
        .wait();
    return dl;
}
export function ucapanWaktu(timezone = "Asia/Jakarta") {
    const jam = moment().tz(timezone).locale("id").hours();
    if (jam >= 0 && jam < 4) return "Tidur Woy";
    if (jam >= 4 && jam < 11) return "Good Morning🌅";
    if (jam >= 11 && jam < 15) return "Good Aternoon☀️";
    if (jam >= 15 && jam < 18) return "Good Evening🌄";
    if (jam >= 18) return "Good Night🌃";
}
export function fmtMSS(s: number): string {
    return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
}
export function secondsToMinutes(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const second = seconds % 60;
    const padTo2Digits = (number: number) => {
        return number.toString().padStart(2, "0");
    };
    return `${padTo2Digits(minutes)}:${padTo2Digits(second).split(".")[0]}`;
}
export const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

export function generateMessageTag(epoch: number) {
    let tag = unixTimestampSeconds().toString();
    if (epoch) tag += ".--" + epoch; // attach epoch if provided
    return tag;
}
// function processTime(timestamp: number, now: number) {
//     const mins = moment(timestamp * 1000)
//     return moment.duration(now - mins).asSeconds();
// }

export function getRandom(ext: FileExtension) {
    return `${Math.floor(Math.random() * 10000)}.${ext}`;
}
export async function fetchJson(url: string, options?: AxiosRequestConfig): Promise<object | undefined> {
    try {
        options ? options : {};
        const res = await axios({
            method: "GET",
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
            },
            ...options,
        });
        return res.data;
    } catch (err) {
        console.error(err);
    }
}
export function runtime(seconds: number) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d == 1 ? " day - " : " days - ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour - " : " hours - ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute - " : " minutes - ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
export function clockString(seconds: number) {
    const h = isNaN(seconds) ? "--" : Math.floor((seconds % (3600 * 24)) / 3600);
    const m = isNaN(seconds) ? "--" : Math.floor((seconds % 3600) / 60);
    const s = isNaN(seconds) ? "--" : Math.floor(seconds % 60);
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function isUrl(url: string) {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, "gi"));
}
export function getTime(date: Date, format: string) {
    if (date) {
        return moment(date).locale("id").format(format);
    } else {
        return moment.tz("Asia/Jakarta").locale("id").format(format);
    }
}
export function formatDate(n: Date, locale = "id") {
    const d = new Date(n);
    return d.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });
}
export function tanggal(numer: number | string | Date = Date.now()) {
    const myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
    const tgl = new Date(numer);
    const day = tgl.getDate();
    const bulan = tgl.getMonth();
    const thisDay = myDays[tgl.getDay()];
    const yy = tgl.getFullYear();
    const year = yy < 1000 ? yy + 1900 : yy;
    return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
}
export function jsonformat(obj: object) {
    return JSON.stringify(obj, null, 2);
}
export async function generateProfilePicture(buffer: Buffer) {
    const jimp_1 = await Jimp.read(buffer);
    const min = jimp_1.getWidth();
    const max = jimp_1.getHeight();
    const cropped = jimp_1.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    };
}
export function parseMention(text = "") {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");
}
export function getGroupAdmins(participantes: GroupMetadata): string[] {
    const admins: string[] = [];
    if (!participantes) return admins;
    for (const i of participantes.participants) {
        if (i.admin === "superadmin") admins.push(i.id);
        else if (i.admin === "admin") admins.push(i.id);
    }
    return admins;
}

export function merun(seconds: number): string {
    function pad(s: number) {
        return (s < 10 ? "0" : "") + s;
    }
    const jam = Math.floor(seconds / (60 * 60));
    const menit = Math.floor((seconds % (60 * 60)) / 60);
    const detik = Math.floor(seconds % 60);
    return `${pad(jam)} Jam - ${pad(menit)} Menit - ${pad(detik)} Detik`;
}
export function convertBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
export function color(text: string, color: string) {
    return !color ? chalk.green(text) : color.startsWith("#") ? chalk.hex(color)(text) : chalk.keyword(color)(text);
}
type PromiseListCommands = Promise<{ command: string; main: (setsu: WAMethods, m: MessageSerializer) => void & { command: string[] }; file: string }[]>;
export type ListCommands = Awaited<PromiseListCommands>;
// type Commands = { default: {command: string[]} & Function<> };
export async function getListCommands(): PromiseListCommands {
    Logger.warn("Checking System Commands...", "#ff2424");
    const command: ListCommands = new Array();
    const directory = await readdir("./Handlers");
    return new Promise((resolve, reject) => {
        directory.forEach((file, index) => {
            if (file.endsWith(".d.ts")) return;
            if (file.endsWith(".js.map")) return;
            const mdl = (module: any) => {
                Array.isArray(module.default.command);
                if (typeof module.default.command !== "object") {
                    Logger.warn(`command in file ${file} will be disabled because not typed in Array`, "#ebdb34");
                    return;
                } else if (module.default.command.length < 1) {
                    Logger.warn(`command in file ${file} will be disabled because no command in there`, "#ebdb34");
                    return;
                } else {
                    !!command.push({ command: module.default.command, main: module.default, file: file });
                    if (directory.length - 1 === index) Logger.warn("Completed...", "#6dff24");
                    resolve(command);
                }
            };
            import("../Handlers/"! + file).then(mdl);
        });
    });
}

export async function checkUpdates() {
    const directory = await readdir("./");
    return new Promise((resolve, reject) => {
        if (directory.includes("update.js")) {
            Logger.warn(`Updating Bot...`, "#c9c71e");
            exec("node update.js", (err, stdout, stderr) => {
                if (err) {
                    Logger.warn(`Error on update: ${err}`, "#ff2424");
                    return;
                }
                if (stderr) {
                    Logger.warn(`Error on update: ${stderr}`, "#ff2424");
                    return;
                }
                Logger.warn(`Update completed...`, "#6dff24");
                process.exit();
            });
        } else resolve("No update found");
    });
}

export function createSessionUUID(string: string): string {
    existsSync("./Data/UserDataSession.json") ? undefined : writeFileSync("./Data/UserDataSession.json", jsonformat([]));
    const uuid = randomUUID();
    const data = readFileSync("./Data/UserDataSession.json").toString();
    const parsed: SessionUUID = JSON.parse(data);
    const encoded = textToBinary(string);
    const json = {
        [uuid]: encoded,
    };
    parsed.push(json);
    writeFileSync("./Data/UserDataSession.json", jsonformat(parsed));
    return uuid;
}

type SessionUUID = { [_: string]: string }[];
export function useSessionUUID(uuid: string, cb: (result: string | undefined) => void): void {
    existsSync("./Data/UserDataSession.json") ? undefined : writeFileSync("./Data/UserDataSession.json", jsonformat([]));
    const data = readFileSync("./Data/UserDataSession.json").toString();
    const parsed: SessionUUID = JSON.parse(data);
    const value = parsed.find((x) => {
        return x[uuid];
    });
    if (value) {
        const decoded = binaryToText(value[uuid]);
        cb(decoded);
        const index = parsed.indexOf(value);
        if (index > -1) {
            parsed.splice(index, 1);
            writeFileSync("./Data/UserDataSession.json", jsonformat(parsed));
        }
    } else cb(undefined);
    return;
}

export function textToBinary(string: string) {
    return string
        .split("")
        .map(function (char) {
            return char.charCodeAt(0).toString(2);
        })
        .join(" ");
}

export function binaryToText(binary: string) {
    const bin = binary.split(" ");
    return bin.map((elem) => String.fromCharCode(parseInt(elem, 2))).join("");
}
