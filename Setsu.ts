import { AnyMessageContent, proto } from "@adiwajshing/baileys";
import { WAMethods } from "./Library/Functions";
import { MessageSerializer } from "./Library/Serialize";
import Logger from "./Library/Logger";
import { getBuffer, ListCommands, runtime, ucapanWaktu } from "./Library/Modules";
import moment from "moment";
import * as global from "./Config/Config.json";
import { ftroli } from "./Library/Fakes";
export default async function Setsu(setsu: WAMethods, m: MessageSerializer, command: ListCommands) {
    try {
        if (m.isCmd) {
            const cmd = command.find((x) => {
                if (x.command.includes(m.command!)) {
                    x.main(setsu, m);
                    Logger.command(m);
                    return true;
                }
            });
            !cmd ? Logger.messages(m) : undefined;
        } else Logger.messages(m);
        const menu = `
${m.italic}${m.bold}💛Setsu Bot  👑${m.bold}${m.italic}

${m.monospace}👋${ucapanWaktu()}${m.monospace} ${m.bold}${m.pushname}${m.bold}

⏰ ${m.monospace}Waktu:${m.monospace} ${m.bold}${moment().tz("Asia/Jakarta").locale("id").tz("Asia/Jakarta").format("HH:mm:ss")}${m.bold}
🗓️ ${m.monospace}Tanggal:${m.monospace} ${m.bold}${moment().locale("id").format("DD MMMM YYYY")}${m.bold}
⏲️ ${m.monospace}Runtime:${m.monospace}
        ${m.bold}${runtime(process.uptime())}${m.bold}
🔐${m.monospace}Prefix:${m.monospace} ${m.bold}${global.prefa.join(" , ")}${m.bold}


📒 ${m.monospace}Fitur pilih 📝 Menu${m.monospace}
      
${m.italic}${m.bold}INFO BOT${m.bold}${m.italic}
        
┏ ${m.italic}${m.bold}TELEPON: BLOCK PERMANEN${m.bold}${m.italic}
┣ ${m.italic}${m.bold}SPAM: BLOCK PERMANEN${m.bold}${m.italic}
┗ ${m.italic}${m.bold}BOT MASIH BETA${m.bold}${m.italic}
`;

        //============================= Kata-kata Basic ===========================

        switch (m.body) {
            case "tes":
            case "p":
            case "menu": {
                if (m.isGroup) return;
                setsu.typing(m.chat);
                const Buttons: proto.Message.ButtonsMessage.IButton[] = [
                    { buttonId: `.menus`, buttonText: { displayText: "📝 Menu" }, type: 1 },
                    { buttonId: `.owner`, buttonText: { displayText: "🔖 Owner" }, type: 1 },
                ];
                const options: AnyMessageContent = {
                    image: { url: global.url.thumb },
                    caption: menu,
                    footer: m.footer,
                    buttons: Buttons,
                };
                setsu.sendMessage(m.chat, options, m.device !== "web" ? { quoted: ftroli(m.pushname) } : undefined);
            }
            default:
        }
    } catch (err) {
        console.error(err);
    }
    // const msg = generateWAMessageFromContent(m.chat, )
}
