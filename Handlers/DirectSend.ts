import { WAMethods } from "../Library/Functions";
import { ucapanWaktu, useSessionUUID } from "../Library/Modules";
import { MessageSerializer } from "../Library/Serialize";
import * as config from "../Config/Config.json";
import { custom_msg } from "../Library/Fakes";
const handler = (setsu: WAMethods, m: MessageSerializer) => {
    useSessionUUID(m.args![0], async (result) => {
        if (result) {
            m.reply(config.mess.wait);
            return setsu.sendMedia(m.chat, result, config.mess.done, custom_msg(ucapanWaktu()! + m.pushname));
        } else return m.reply(`${m.bold}Session telah expired...${m.bold}\nKirim ulang perintahnya!`);
    });
};
handler.command = ["__directsendfromurl"];

export default handler;
