import mediafire from "../Plugins/mediafire";
import { WAMethods } from "../Library/Functions";
import { MessageSerializer } from "../Library/Serialize";
import { getBuffer, isUrl } from "../Library/Modules";
import * as global from "../Config/Config.json";
import { fromBuffer } from "file-type";
import { ftroli } from "../Library/Fakes";
enum Reason {
    invalid = "Ini bukan Link Mediafire!",
}
const handler = async (setsu: WAMethods, m: MessageSerializer) => {
    if (m.isCmd) {
        if (m.args!.length < 1) return m.reply(`Ketik perintah ${m.prefix}${m.command} <url>`);
        const isMediafireLink = isUrl(m.args![0]) && m.args![0].includes("mediafire.com");
        if (!isMediafireLink) return m.reply(`${global.mess.invalid}\nReason: ${m.italic}${Reason.invalid}${m.italic}`);
    }
    try {
        m.reply(global.mess.wait);
        const mf = await mediafire(m.args![0] || (m.body as string));
        const split = mf.uploadedAt.split(" ");
        const caption = `
    File ditemukan!!!
    
${m.bold}Nama file${m.bold}: ${mf.filename}
${m.bold}Ukuran${m.bold}: ${mf.fileSize}
${m.bold}Diupload pada${m.bold}: ${split[1]} ${split[0]}

${m.bold}Tunggu sebentar Bot akan mengirim filenya${m.bold}
        `;
        m.reply(caption);
        const buffer = await getBuffer(mf.link);
        const filetype = await fromBuffer(buffer as ArrayBuffer);
        setsu.sendMessage(
            m.chat,
            { document: buffer as Buffer, footer: m.footer, fileName: mf.filename, mimetype: filetype!.mime, caption: `${m.italic}Nih filenya${m.italic}` },
            m.device !== "web" ? { quoted: ftroli(m.pushname, m.command) } : undefined
        );
    } catch (err) {
        m.reply(`${m.bold}File tidak tersedia!!!${m.bold}`);
    }
};
handler.command = ["mediafire", "mf"];

export default handler;
