import { translate } from "bing-translate-api";
import { pinterest } from "../../lib/scrape.js";
import moment from 'moment-timezone';
import fs from 'fs';
import axios from 'axios';

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
    let id = senderKey;
    let user = global.db.data.users[id];
    let name = user.registered ? user.name : await conn.getName(id);
    let hwaifu = JSON.parse(fs.readFileSync('./json/hwaifu.json', 'utf-8'));
    
    if (!conn.cai) conn.cai = {};

    switch (command) {
        case 'cai-id':
            text = text.split('|');
            if (text.length < 2) {
                return m.reply(`Format salah! Gunakan: ${usedPrefix}cai-id <nama>|<id>`);
            }
            const thumbnail = (await pinterest(text[0])).getRandom();
            conn.cai[id].name = text[0];
            conn.cai[id].id = text[1];
            conn.cai[id].thumbnail = thumbnail.imageURL;
            m.reply(`Berhasil ${conn.cai[id].id ? "mengganti" : "menyetel"} ${text[0]} menjadi lawan bicaramu. Sekarang kamu dapat menggunakan command *${usedPrefix}cai*`);
            break;

        case 'cai':
            if (!text) return m.reply(`Masukkan teks yang ingin kamu tanyakan \n\nContoh: \n${usedPrefix + command} hallo`);
            if (!(id in conn.cai)) return m.reply(`Silahkan cari karakter yang ingin kamu chat terlebih dahulu \n\nContoh: \n${usedPrefix}cai-search Elaina`);
            try {
                let { data } = await axios.get(global.API("ryhar", "/api/features/ai/cai-message", { characterId: conn.cai[id].id, message: await textTranslated(text, "en") }, "apikey"));
                let thumbnailData = await conn.getFile(conn.cai[id].thumbnail);
                await conn.adReply(m.chat, await textTranslated(data.result, "id"), conn.cai[id].name, "", thumbnailData.data, "", m, false, false, { smlcap: false });
            } catch (error) {
                console.error("Error sending message:", error);
                m.reply('Terjadi kesalahan saat menghubungi Character AI. Silakan coba lagi nanti.');
            }
            break;

        case 'cai-search':
            if (!text) return m.reply(`Masukkan nama karakter! \n\nContoh: \n${usedPrefix + command} Elaina`);
            try {
                await conn.loading(m, conn);
                let { data } = await axios.get(global.API("ryhar", "/api/features/ai/cai-search", { query: text }, "apikey"));
                let list = data.result.map((v, i) => {
                    return [`${usedPrefix}cai-id ${v.name}|${v.id}`, (i + 1).toString(), `${v.name} \n${v.greeting}`];
                });
                await conn.textList(m.chat, `Terdapat *${data.result.length} Result* \nSilahkan pilih karakter yang ingin kamu gunakan`, false, list, m, {
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: false,
                            mediaType: 1,
                            title: `Halo ${name}, ${wish()}`,
                            body: global.config.watermark,
                            thumbnail: fs.readFileSync("./media/cai.jpg"),
                            renderLargerThumbnail: true,
                            mediaUrl: hwaifu.getRandom(),
                            sourceUrl: global.config.website
                        }
                    }
                });
                if (!(id in conn.cai)) {
                    conn.cai[id] = {
                        name: null,
                        id: null,
                        thumbnail: null,
                    };
                }
            } catch (error) {
                console.error("Error searching character:", error);
                m.reply('Terjadi kesalahan saat mencari karakter. Silakan coba lagi nanti.');
            } finally {
                await conn.loading(m, conn, true);
            }
            break;

        default:
            m.reply(`Command tidak dikenali. Gunakan ${usedPrefix}cai atau ${usedPrefix}cai-search.`);
    }
};

handler.help = ["cai", "cai-search"];
handler.tags = ["premium", "ai"];
handler.command = /^(cai|characterai|cai-search|characterai-search|cai-id)$/i;
handler.premium = true;

export default handler;

let textTranslated = async (text, to) => {
    let translatedText = await translate(text, null, to);
    return translatedText.translation;
};

function wish() {
    const time = moment.tz('Asia/Jakarta').format('HH');
    if (time >= 0 && time < 4) {
        return 'Selamat Malam';
    }
    if (time >= 4 && time < 11) {
        return 'Selamat Pagi';
    }
    if (time >= 11 && time < 15) {
        return 'Selamat Siang';
    }
    if (time >= 15 && time < 18) {
        return 'Selamat Sore';
    }
    return 'Selamat Malam';
}
