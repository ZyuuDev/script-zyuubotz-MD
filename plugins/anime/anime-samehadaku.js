import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  switch (command) {
    case "samehadaku-detail": {
      if (!text) return m.reply(`Masukan link Samehadaku! \n\nContoh : \n${usedPrefix + command} https://samehadaku.email/anime/roshidere/`)
      let { detail, episode } = await samehadaku.detail(text)
      let caption = `
${Object.entries(detail).map(([key, value]) => {
  return `${key} : ${value}`
}).join("\n")}
`.trim()
      let list = episode.map((v, i) => {
        return [`${usedPrefix}samehadaku-download ${v.episodeUrl}`, (i + 1).toString(), `${v.title} \nDiupload pada ${v.date}`]
      })
      await conn.textList(m.chat, caption, false, list, m)
      break
    }
    case "samehadaku-download": {
      if (!text) return m.reply(`Masukan link Samehadaku! \n\nContoh : \n${usedPrefix + command} https://samehadaku.email/roshidere-episode-12-end/`)
      let data = await samehadaku.detailEps(text)
      let link = data.find(v => /MP4/i.test(v.format))
      let list = Object.entries(link.resolutions).map(([key, value], i) => {
        let pdrain = value.find(v => /Pixeldrain/i.test(v.text))
        return [`${usedPrefix}pixeldrain ${pdrain.href}`, (i + 1).toString(), key]
      })
      await conn.textList(m.chat, "Silahkan pilih Resolusi video yang ingin kamu download!", false, list, m)
      break
    }
    default: {
      if (!text) return m.reply(`Masukan nama Anime! \n\nContoh : \n${usedPrefix + command} Alya`)
      let result = await samehadaku.search(text)
      if (result.length == 0) return m.reply(`Tidak dapat menemukan query *${text}*`)
      let list = result.map((v, i) => {
        return [`${usedPrefix}samehadaku-detail ${v.link}`, (i + 1).toString(), `${v.title} \n${v.views}`]
      })
      await conn.textList(m.chat, `Terdapat *${result.length} Result* \nSilahkan pilih anime yang kamu cari..`, false, list, m)
    }
  }
}
handler.help = ["samehadaku"]
handler.tags = ["anime"]
handler.command = /^(samehadaku(-detail|-download)?)$/i
export default handler

let base_url = "https://samehadaku.email"
const samehadaku = {
  latest: async () => {
    let { data } = await axios.get(base_url + "/anime-terbaru")
    let $ = cheerio.load(data)
    let result = []
    $('.post-show li').each((index, element) => {
      const title = $(element).find('.entry-title a').text()
      const episodeUrl = $(element).find('.entry-title a').attr('href')
      const imageUrl = $(element).find('img').attr('src')
      const author = $(element).find('.author [itemprop="name"]').text()
      const releasedOn = $(element).find('.dashicons-calendar').parent().text().trim()
      
      result.push({
        title,
        episodeUrl,
        imageUrl,
        author,
        releasedOn
      })
    })
    return result
  },
  search: async query => {
    let { data } = await axios.get(base_url + `?s=${query}`)
    let $ = cheerio.load(data)
    let result = []
    $('#content .animpost').each((index, element) => {
      const title = $(element).find('.title h2').text().trim()
      const link = $(element).find('a').attr('href')
      const imgSrc = $(element).find('img').attr('src')
      const score = $(element).find('.score i').text().trim()
      const views = $(element).find('.metadata span').last().text().trim()

      result.push({
        title,
        link,
        imgSrc,
        score,
        views
      })
    })
    return result
  },
  detail: async url => {
    let { data } = await axios.get(url)
    let $ = cheerio.load(data)
    let result = {
      detail: {},
      episode: []
    }
    result.detail.title = $('h3.anim-detail').text().trim()
    result.detail.japaneseTitle = $('.spe span').eq(0).text().replace('Japanese', '').trim()
    result.detail.englishTitle = $('.spe span').eq(1).text().replace('English', '').trim()
    result.detail.status = $('.spe span').eq(2).text().replace('Status', '').trim()
    result.detail.type = $('.spe span').eq(3).text().replace('Type', '').trim()
    result.detail.source = $('.spe span').eq(4).text().replace('Source', '').trim()
    result.detail.season = $('.spe span a').text().trim()
    result.detail.studio = $('.spe span a').eq(1).text().trim()
    result.detail.producers = $('.spe span a').slice(2, 4).map((i, el) => $(el).text()).get().join(', ')
    result.detail.released = $('.spe span').last().text().replace('Released:', '').trim()
    
    $('.lstepsiode ul li').each((i, el) => {
      const episode = {
        number: $(el).find('.eps a').text().trim(),
        title: $(el).find('.lchx a').text().trim(),
        date: $(el).find('.date').text().trim(),
        episodeUrl: $(el).find('.lchx a').attr('href')
      }
      result.episode.push(episode)
    })
    return result
  },
  detailEps: async url => {
    let { data } = await axios.get(url)
    let $ = cheerio.load(data)
    let download = []
    $('.download-eps').each((i, el) => {
      const format = $(el).find('p b').text().trim()
      const resolutions = {}
      $(el).find('ul li').each((j, li) => {
        const resolution = $(li).find('strong').text().trim()
        const links = []
        $(li).find('span a').each((k, linkEl) => {
          links.push({
            text: $(linkEl).text(),
            href: $(linkEl).attr('href')
          })
        })
        resolutions[resolution] = links
      })
      download.push({
        format,
        resolutions
      })
    })
    return download
  }
}