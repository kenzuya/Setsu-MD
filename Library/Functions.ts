import { WASocket, jidDecode, proto, MiscMessageGenerationOptions, AnyMessageContent, FullJid, WACallEvent } from "@adiwajshing/baileys";
import { randomBytes } from "crypto";
import { fromBuffer } from "file-type";
import { existsSync, readFileSync } from "fs";
import jimp from "jimp";
import { RequestInfo, Response } from "node-fetch";
import { Metadata } from "./Exif";
const fetch = (url: RequestInfo, init?: Blob): Promise<Response> => import("node-fetch").then((module) => module.default(url, init));

type SendVideoStickerOptions = Metadata & MiscMessageGenerationOptions;
type getFileResults = {
    ext: string;
    mime: string;
    data: Buffer;
};
export type WAMethods = ReturnType<typeof Functions & WASocket>;
const Functions = (setsu: WASocket) => {
    const resize = async (image: Buffer, width = 300, height = 300): Promise<Buffer> => {
        const img = await jimp.read(image);
        const buffer = img.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
        return buffer;
    };
    // Object.assign(resize, setsu)
    const decodeJid = (jid: string) => {
        if (typeof jid !== "string") return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode: FullJid = jidDecode(jid) || Object.create({});
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };
    const setBio = (bio: string) => {
        setsu.query({
            tag: "iq",
            attrs: {
                to: "@s.whatsapp.net",
                type: "set",
                xmlns: "status",
            },
            content: [
                {
                    tag: "status",
                    attrs: {},
                    content: Buffer.from(bio, "utf-8"),
                },
            ],
        });
        return bio;
    };
    const typing = async (jid: string) => await setsu.sendPresenceUpdate("composing", jid);
    const sendText = (jid: string, text: string, quoted?: proto.WebMessageInfo, options?: AnyMessageContent) => setsu.sendMessage(jid, { text: text, ...options }, { quoted });
    const sendImage = async (jid: string, path: Buffer | string, caption?: string, quoted?: proto.WebMessageInfo, options?: AnyMessageContent) => {
        const ArrayBuffer = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
            ? Buffer.from(path.split(`,`)[1], "base64")
            : /^https?:\/\//.test(path)
            ? await (await fetch(path)).arrayBuffer()
            : existsSync(path)
            ? readFileSync(path)
            : Buffer.alloc(0);
        const buffer = Buffer.from(new Uint8Array(ArrayBuffer));
        return await setsu.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
    };
    const sendVideo = async (jid: string, path: Buffer | string, caption?: string, quoted?: proto.WebMessageInfo, options?: AnyMessageContent) => {
        const ArrayBuffer = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
            ? Buffer.from(path.split(`,`)[1], "base64")
            : /^https?:\/\//.test(path)
            ? await (await fetch(path)).arrayBuffer()
            : existsSync(path)
            ? readFileSync(path)
            : Buffer.alloc(0);
        const buffer = Buffer.from(new Uint8Array(ArrayBuffer));
        return setsu.sendMessage(jid, { video: buffer, caption, ...options }, { quoted });
    };
    const sendAudio = async (jid: string, path: Buffer | string, caption?: string, quoted?: proto.WebMessageInfo, options?: AnyMessageContent) => {
        const ArrayBuffer = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
            ? Buffer.from(path.split(`,`)[1], "base64")
            : /^https?:\/\//.test(path)
            ? await (await fetch(path)).arrayBuffer()
            : existsSync(path)
            ? readFileSync(path)
            : Buffer.alloc(0);
        const buffer = Buffer.from(new Uint8Array(ArrayBuffer));
        return await setsu.sendMessage(jid, { audio: buffer, caption, ...options }, { quoted });
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // setsu.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    //     setsu.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net") }, options }, { quoted });
    const sendImageAsSticker = async (jid: string, path: Buffer | string, quoted?: proto.WebMessageInfo, options?: AnyMessageContent) => {
        const ArrayBuffer = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
            ? Buffer.from(path.split(`,`)[1], "base64")
            : /^https?:\/\//.test(path)
            ? await (await fetch(path)).arrayBuffer()
            : existsSync(path)
            ? readFileSync(path)
            : Buffer.alloc(0);
        const buffer = Buffer.from(new Uint8Array(ArrayBuffer));
        return setsu.sendMessage(jid, { sticker: buffer, ...options }, { quoted });
    };
    // setsu.sendVideoAsSticker = async (jid, path, quoted, options) => {
    //     const ArrayBuffer = Buffer.isBuffer(path)
    //         ? path
    //         : /^data:.*?\/.*?;base64,/i.test(path)
    //         ? Buffer.from(path.split(`,`)[1], "base64")
    //         : /^https?:\/\//.test(path)
    //         ? await (await fetch(path)).arrayBuffer()
    //         : existsSync(path)
    //         ? readFileSync(path)
    //         : Buffer.alloc(0);
    //     const buffer = Buffer.from(new Uint8Array(ArrayBuffer));
    //     // let result: Buffer;
    //     if ((options && options.packname) || options?.author) {
    //         const result = await writeExifImg(buffer, options);
    //         const buff = await getBuffer(path);
    //         await setsu.sendMessage(jid, { sticker: result || buff, ...options }, { quoted });
    //     }
    // };
    // setsu.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    //     const contentType = getContentType(message);
    //     const msg = message[contentType];
    //     const buffer = await downloadMediaMessage(msg, "buffer", {});
    //     const fileType = Buffer.isBuffer(buffer) ? await fromBuffer(buffer) : await fromStream(buffer);
    //     const fileName = attachExtension ? filename + "." + fileType?.ext : filename;
    //     await writeFile(fileName, buffer);
    //     return fileName;
    // };
    const getFile = async (path: Buffer | string) => {
        const data = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
            ? Buffer.from(path.split(`,`)[1], "base64")
            : /^https?:\/\//.test(path)
            ? await (await fetch(path)).buffer()
            : existsSync(path)
            ? readFileSync(path)
            : typeof path === "string"
            ? path
            : Buffer.alloc(0);
        if (!Buffer.isBuffer(data)) throw new TypeError("Result is not Buffer");
        const type = await fromBuffer(data);
        return {
            ...type!,
            data,
        };
    };
    const sendMedia = async (jid: string, path: string | Buffer, caption?: string, quoted?: proto.IWebMessageInfo, options?: AnyMessageContent) => {
        const { ext, mime, data } = await getFile(path);
        if (mime.includes("video")) {
            return await setsu.sendMessage(jid, { video: data, mimetype: mime, fileName: randomBytes(10).toString("hex") + "." + ext, caption }, { quoted });
        } else if (mime.includes("audio")) {
            return await setsu.sendMessage(jid, { audio: data, mimetype: mime, fileName: randomBytes(10).toString("hex") + "." + ext, caption }, { quoted });
        } else if (mime.includes("image")) {
            return await setsu.sendMessage(jid, { image: data, mimetype: mime, fileName: randomBytes(10).toString("hex") + "." + ext, caption }, { quoted });
        } else if (mime.includes("application")) {
            return await setsu.sendMessage(jid, { document: data, mimetype: mime, fileName: randomBytes(10).toString("hex") + "." + ext, caption }, { quoted });
        } else return await setsu.sendMessage(jid, { document: data, mimetype: mime, fileName: randomBytes(10).toString("hex") + "." + ext, caption }, { quoted });
    };
    // setsu.downloadMediaBuffer = async (message) => {
    //     const contentType = getContentType(message);
    //     const buffer = await downloadMediaMessage(message.audioMessage, "buffer", {}, { logger: pino({ level: "debug" }), reuploadRequest: setsu.updateMediaMessage });
    //     return buffer;
    // };
    // return Object.assign(setsu, setsu);
    // setsu.copyNForward = async (jid, message, quoted, options) => {
    //     let vtype: object
    //     if (options.message)
    // }
    const sendVerificationCode = (jid: string, code: number) => {
        setsu.sendMessage(jid, {
            text: `Kode verifikasi Anda adalah ${code}`,
            templateButtons: [
                {
                    index: 1,
                    urlButton: {
                        displayText: `Salin kode`,
                        url: `https://www.whatsapp.com/otp/copy/${code}`,
                    },
                },
            ],
            footer: `Verification Code`,
        });
    };
    const rejectCall = async (call: WACallEvent) => {
        const stanza = {
            tag: "call",
            attrs: {
                from: setsu.authState.creds.me!.id,
                to: call.from,
                id: (new Date().getTime() / 1000).toString().replace(".", "-"),
            },
            content: [
                {
                    tag: "reject",
                    attrs: {
                        "call-id": call.id,
                        "call-creator": call.from,
                        count: "0",
                    },
                    content: undefined,
                },
            ],
        };
        await setsu.query(stanza);
    };
    const assigned = {
        ...setsu,
        sendMedia,
        resize,
        decodeJid,
        setBio,
        typing,
        sendText,
        sendImage,
        sendVideo,
        sendAudio,
        sendImageAsSticker,
        getFile,
        sendVerificationCode,
        rejectCall,
    };
    return assigned;
};

export default Functions;
