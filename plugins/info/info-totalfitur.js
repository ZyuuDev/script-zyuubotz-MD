import fs from "fs";
import { plugins } from "../../lib/plugins.js";
let handler = async (m, { conn }) => {
  let totalf = Object.values(plugins).filter((v) => v.help && v.tags).length;
  conn.adReply(
    m.chat,
    `Bot Ini Memiliki ${totalf} Fitur Selengkapnya Ketik .menu`,
    "T O T A L - F I T U R",
    "",
    fs.readFileSync("./media/thumbnail.jpg"),
    global.config.website,
    m,
  );
};
handler.help = ["totalfitur"];
handler.tags = ["info"];
handler.command = ["totalfitur"];
export default handler;
