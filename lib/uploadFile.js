import { PomfUploader, QuaxUploader, RyzenUploader, FastUrlUploader, VideyUploader, ShojibUploader, ErhabotUploader } from "@zanixongroup/uploader"

const uploaders = [
	PomfUploader,
	QuaxUploader,
	RyzenUploader,
	FastUrlUploader,
	VideyUploader,
	ShojibUploader,
	ErhabotUploader
]

export default async (buffer) => {
	for (const uploader of uploaders) {
		try {
			const result = await uploader(buffer)
			return result
		} catch (error) {
			console.error(error)
		}
	}
	throw new Error("Tidak ada uploader yang tersedia")
}
