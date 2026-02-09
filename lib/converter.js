import PDFDocument from "pdfkit"
import axios from 'axios'
import BodyForm from 'form-data'
import fs from 'fs'
import * as cheerio from 'cheerio'
import Helper from './helper.js'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'

/**
 * Convert an audio buffer to a PTT (Push-to-Talk) format audio file.
 *
 * This function takes an audio buffer as input and converts it into an OGG
 * file using the Opus codec, suitable for use in PTT applications.
 * 
 * @param {Buffer} audioBuffer - The input audio buffer.
 * @returns {Promise<{data: Buffer, filename: string, delete: Function}>} 
 *          A promise that resolves with an object containing the converted
 *          audio buffer, filename, and a delete function to remove temporary files.
 */

function toPtt(audioBuffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = path.join(Helper.__dirname(import.meta.url), '../tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

        const inputPath = path.join(tmpDir, `${Date.now()}-input.mp3`)
        const outputPath = path.join(tmpDir, `${Date.now()}-ptt.ogg`)

        fs.writeFile(inputPath, audioBuffer, (err) => {
            if (err) return reject(err)

            const command = ffmpeg(inputPath)
                .audioCodec('libopus')
                .audioChannels(1)
                .audioFrequency(48000)
                .format('ogg')
                .outputOptions(['-compression_level 10', '-application voip'])

            command
                .on('error', (err) => reject(err))
                .on('end', () => {
                    const resultBuffer = fs.readFileSync(outputPath)
                    resolve({
                        data: resultBuffer,
                        filename: path.basename(outputPath),
                        delete: () => {
                            fs.unlinkSync(inputPath)
                            fs.unlinkSync(outputPath)
                        }
                    })
                })
                .save(outputPath)
        })
    })
}

/**
 * Convert Video to Playable WhatsApp Audio
 * @param {Buffer} videoBuffer Video Buffer
 * @param {String} [format=mp3] File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 * @throws {Error} If the format is not supported
 */
function toAudio(videoBuffer, format = 'mp3') {
    return new Promise((resolve, reject) => {
        const tmpDir = path.join(Helper.__dirname(import.meta.url), '../tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

        const tempVideoPath = path.join(tmpDir, `${Date.now()}-input.mp4`)
        const tempAudioPath = path.join(tmpDir, `${Date.now()}.${format}`)

        fs.writeFile(tempVideoPath, videoBuffer, (err) => {
        if (err) return reject(err)

        const command = ffmpeg(tempVideoPath).outputOptions('-vn').format(format)

        switch (format) {
            case 'mp3':
                command.audioCodec('libmp3lame')
            break
            case 'ogg':
                command.audioCodec('libvorbis')
            break
            case 'aac':
                command.audioCodec('aac')
                command.format('adts')
            break
            case 'flac':
                command.audioCodec('flac')
            break
            case 'wav':
                // default codec sudah cukup
            break
            default:
                return reject(new Error('Format audio tidak didukung.'))
        }

        command.on('end', () => {
            fs.readFile(tempAudioPath, (err, audioBuffer) => {
                if (err) return reject(err)
                resolve({
                    data: audioBuffer,
                    filename: tempAudioPath
                })
            })
            }).on('error', (err) => {
                reject(err)
            }).save(tempAudioPath)
        })
    })
}

/**
 * Convert audio buffer to video buffer with black background.
 * 
 * @param {Buffer} audioBuffer
 * @param {string} [audioFormat='mp3']
 * @returns {Promise<{data: Buffer, filename: string}>}
 */
function toVideo(audioBuffer, audioFormat = 'mp3') {
    return new Promise((resolve, reject) => {
        const tmpDir = path.join(Helper.__dirname(import.meta.url), '../tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

        const timestamp = Date.now()
        const audioPath = path.join(tmpDir, `${timestamp}.${audioFormat}`)
        const outputVideoPath = path.join(tmpDir, `${timestamp}.mp4`)

        fs.writeFile(audioPath, audioBuffer, (err) => {
        if (err) return reject(err)

        ffmpeg()
            .input('color=black:s=1280x720:d=9999') // background black
            .inputFormat('lavfi')
            .input(audioPath)
            .outputOptions([
                '-c:v libx264',
                '-tune stillimage',
                '-c:a aac',
                '-b:a 192k',
                '-shortest'
            ]).output(outputVideoPath).on('end', () => {
                fs.readFile(outputVideoPath, (err, videoBuffer) => {
                    fs.unlink(audioPath, () => {})
                    if (err) return reject(err)
                    resolve({
                    data: videoBuffer,
                    filename: outputVideoPath
                    })
                })
            }).on('error', (err) => {
                fs.unlink(audioPath, () => {})
                reject(err)
            }).run()
        })
    })
}

/**
 * Converts an array of image URLs into a single PDF document.
 * 
 * @param {Array} images - An array of image URLs to be included in the PDF.
 * @param {Object} [opt={}] - Optional axios configuration options for fetching images.
 * 
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the PDF data.
 * 
 * Note: The function skips images with extensions .webp and .gif.
 */

function toPDF(images, opt = {}) {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(images)) images = [images]
        let buffs = [],
        doc = new PDFDocument({
            margin: 0, size: 'A4'
        })
        for (let x = 0; x < images.length; x++) {
            if (/.webp|.gif/.test(images[x])) continue
            let data = (await axios.get(images[x], {
                responseType: 'arraybuffer', ...opt
            })).data
            doc.image(data, 0, 0, {
                fit: [595.28, 841.89], align: 'center', valign: 'center'
            })
            if (images.length != x + 1) doc.addPage()
        }
        doc.on('data', (chunk) => buffs.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffs)))
        doc.on('error', (err) => reject(err))
        doc.end()
    })
}

/**
 * Convert Webp to MP4 File
 * @param {String} path File Path
 * @returns {Promise<{status: Boolean, message: String, result: String}>}
 */

function webp2mp4File(path) {
	return new Promise((resolve, reject) => {
		const form = new BodyForm()
		form.append('new-image-url', '')
		form.append('new-image', fs.createReadStream(path))
		axios({
			method: 'post',
			url: 'https://ezgif.com/webp-to-mp4',
			data: form,
			headers: {
				'Content-Type': `multipart/form-data; boundary=${form._boundary}`
			}
		}).then(({ data }) => {
			const bodyFormThen = new BodyForm()
			const $ = cheerio.load(data)
			const file = $('input[name="file"]').attr('value')
			bodyFormThen.append('file', file)
			bodyFormThen.append('convert', "Convert WebP to MP4!")
			axios({
				method: 'post',
				url: 'https://ezgif.com/webp-to-mp4/' + file,
				data: bodyFormThen,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
				}
			}).then(({ data }) => {
				const $ = cheerio.load(data)
				const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
				resolve({
					status: true,
					message: "Created By Satzz",
					result: result
				})
			}).catch(reject)
		}).catch(reject)
	})
}

export {
    toPDF,
    toAudio,
    toVideo,
    ffmpeg,
    webp2mp4File,
    toPtt
}