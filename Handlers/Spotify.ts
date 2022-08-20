import { spotdlInfo, spotdlDownload } from "../Plugins/spotdl";
import { custom_msg } from "../Library/Fakes";
import { ucapanWaktu, secondsToMinutes } from "../Library/Modules";
import config from "../Config/Config.json";
import { getBuffer } from "../Library/Modules";
import { fromBuffer } from "file-type";
import { WAMethods } from "../Library/Functions";
import { MessageSerializer } from "../Library/Serialize";

const handler = async (setsu: WAMethods, m: MessageSerializer) => {
    if (m.isCmd) {
        if (!m.query) return setsu.sendMessage(m.chat, { text: `Ketik ${m.prefix || "."}${m.command} <url>` }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
    }
    try {
        m.reply(config.mess.wait);
        const data = await spotdlInfo(m.args![0] || m.text!);
        const coverImage = await getBuffer(data.cover_url);
        const fileType = await fromBuffer(coverImage!);
        const caption = `
🗂️${m.monospace}Lagu ditemukan!${m.monospace}

🎧 ${m.bold}Judul${m.bold} : ${data.name}
🎙 ${m.bold}Artist${m.bold} : ${data.artists.join(", ")}
📀 ${m.bold}Album${m.bold} : ${data.album_name}
⏱ ${m.bold}Durasi${m.bold} : ${secondsToMinutes(data.duration)}
🗓 ${m.bold}Tanggal${m.bold} : ${data.date}
🧮 ${m.bold}Nomor Track${m.bold} : ${data.track_number}
👥 ${m.bold}Publisher${m.bold} : ${data.publisher}

📥Tunggu sebentar, Lagu akan dikirim...

NOTE: ${m.bold}Fitur ini masih dalam tahap pengembangan, mungkin lagu yang dikirim tidak akan sesuai.${m.bold}
${m.italic}Gunakan fitur ini dengan bijak.${m.italic}
        `;
        setsu.sendMessage(m.chat, { image: coverImage!, caption: caption, mimetype: fileType?.mime }, { quoted: custom_msg(`${ucapanWaktu()} ${m.pushname}`) });
        const spotdl = await spotdlDownload(m.args![0] || m.text!);
        const song_buffer = await getBuffer(spotdl.download_url!);
        const song_type = await fromBuffer(song_buffer!);
        const song_name = `${data.name} - ${data.artists.join(", ")}`;
        setsu.sendMessage(m.chat, { audio: song_buffer!, fileName: song_name + "." + song_type?.ext, mimetype: song_type?.mime }, { quoted: custom_msg(`${song_name}`) });
    } catch (err) {
        m.reply(`Gagal mengambil data lagu, pastikan URL Valid!`);
        console.log(err);
    }
};
handler.command = ["spotify", "spotdl"];
export default handler;
