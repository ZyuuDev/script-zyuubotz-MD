import axios from "axios"
import * as cheerio from "cheerio"
const regex = /https:\/\/l\.likee\.video\/v\/[A-Za-z0-9]+/i
let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`Masukan Link! \n\nContoh: \n${usedPrefix + command} https://l.likee.video/v/X1taJ3`)
    if (!text.match(regex)) return m.reply("Itu bukan link Likee!")
    await conn.loading(m, conn)
    const like = new LikeeDownloader()
    let result = await like.getLinks(text)
    const caption = `
*Likee Downloader*
Views: ${result.views}
Likes: ${result.likes}
Comments: ${result.comments}
`.trim()
    await conn.sendFile(m.chat, result.download[1].link, null, caption, m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["likee"]
handler.tags = ["downloader"]
handler.command = /^(like(e)?)$/i
handler.limit = true
export default handler

class LikeeDownloader {
  constructor() {
    this.url = "https://likeedownloader.com/process";
  }
  decode(base64Url) {
    return Buffer.from(base64Url, "base64").toString("utf-8");
  }
  getSegments(url) {
    return url.split("/").slice(-2).join("/");
  }
  async getLinks(id, locale = "id") {
    try {
      const {
        data
      } = await axios.post(this.url, `id=${encodeURIComponent(id)}&locale=${locale}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0",
          Referer: "https://likeedownloader.com/id"
        }
      });
      const $ = cheerio.load(data.template);
      const [views, likes, comments] = $("p.infotext").text().split(",").map(text => text.trim());
      const imageUrl = $("div.img_thumb img").attr("src") || "";
      const decodedImageUrl = this.decode(this.getSegments(imageUrl));
      return {
        views: views || "No views",
        likes: likes || "No likes",
        comments: comments || "No comments",
        image: decodedImageUrl,
        download: $("div.result-links-item").map((_, el) => {
          const encodedLink = $(el).find("a.download_link").attr("href") || "";
          const decodedLink = this.decode(this.getSegments(encodedLink));
          return {
            type: $(el).find("div").eq(0).text().trim() || "Unknown",
            link: decodedLink || ""
          };
        }).get()
      };
    } catch (error) {
      console.error("Error:", error);
      return {};
    }
  }
}