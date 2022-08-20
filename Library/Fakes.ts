import { ucapanWaktu } from "./Modules";

export const ftroli = (pushname: string, command?: string) => {
    return {
        key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "6289523258649-1604595598@g.us" },
        message: {
            orderMessage: {
                itemCount: 2021,
                status: 200,
                surface: 200,
                message: `${ucapanWaktu()} ${pushname}${command ? `\n𝙲𝚖𝚍 ${command}` : ""}`,
                sellerJid: "0@s.whatsapp.net",
            },
        },
        contextInfo: { forwardingScore: 999, isForwarded: true },
        sendEphemeral: true,
    };
};
