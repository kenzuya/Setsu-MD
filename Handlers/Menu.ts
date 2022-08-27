import { WAMethods } from "../Library/Functions";
import { MessageSerializer } from "../Library/Serialize";
import { getDevice } from "@adiwajshing/baileys";
import moment from "moment-timezone";
const handler = async (setsu: WAMethods, m: MessageSerializer) => {
    if (m.command === "menu") {
    } else if (m.command === "menus") {
        if (m.isGroup) {
        } else {
            await setsu.typing(m.chat);
            let desk = `

Ini ${m.monospace}${m.pushname}${m.monospace} Menunya

•🕔Jam: ${m.bold}${moment.tz("Asia/Jakarta").locale("id").format("HH:mm:ss")}${m.bold}
•📅Tanggal: ${m.bold}${moment().locale("id").format("DD MMMM YYYY")}${m.bold}
•📱Kamu menggunakan Device: ${m.bold}${getDevice(m.id!)}${m.bold}

                    `;
            let wargaMenu = [
                {
                    title: "Pilih Menu dibawah ini",
                    rows: [
                        { title: "📥 TikTok Downloader", rowId: `${m.prefix}tt` },
                        { title: "📽️ YouTube Downloader", rowId: `${m.prefix}yt` },
                        { title: "🖼️ Instagram Downloader", rowId: `${m.prefix}igdl` },
                        { title: "🕊 Twitter Downloader", rowId: `${m.prefix}twitter` },
                    ],
                },
            ];

            let adminMenu = {
                title: "Other",
                rows: [{ title: "🖥️ Admin Menu", rowId: `.adminmenu` }],
            };

            if (m.isCreator) wargaMenu.push(adminMenu);
            const listMessage = {
                text: desk,
                footer: m.footer,
                title: `${m.bold}List Menu!${m.bold}`,
                buttonText: "Select Menu",
                sections: wargaMenu,
                listType: 1,
            };

            setsu.sendMessage(m.chat, listMessage);
        }
    }
};
handler.command = ["menu", "menus"];

export default handler;
