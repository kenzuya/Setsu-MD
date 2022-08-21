import { WAMethods } from "../Library/Functions";
import { exec } from "child_process";
import { MessageSerializer } from "../Library/Serialize";
import { custom_msg } from "../Library/Fakes";
import { ucapanWaktu } from "../Library/Modules";
import * as cfg from "../Config/Config.json";
const handler = (setsu: WAMethods, m: MessageSerializer) => {
    if (m.isCreator === false) return setsu.sendMessage(m.chat, { text: cfg.mess.owner }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
    if (!m.query) return setsu.sendMessage(m.chat, { text: `Ketik ${m.bold}${m.prefix}${m.command} <perintah>${m.bold}` }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
    const Aliases = Object.keys(cfg["terminal.aliases"]);
    const command = m.query === "pull" ? "pull" : m.query === "restart" ? "restart" : undefined;
    if (Aliases.includes(m.query)) execute(cfg["terminal.aliases"][command!]);
    else execute(m.query);
    function execute(command: string) {
        exec(command, (err, stdout, stderr) => {
            if (err) return setsu.sendMessage(m.chat, { text: `${err}` }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
            if (stderr) return setsu.sendMessage(m.chat, { text: `${stderr}` }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
            setsu.sendMessage(m.chat, { text: `${stdout}` }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
        });
    }
};
handler.command = ["exec"];

export default handler;
