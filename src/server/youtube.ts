import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Innertube } from 'youtubei.js'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { loggingMiddleware } from './middleware'
import { getDownloadsFolder } from './fileUtils'

const execAsync = promisify(exec)

const SearchInputSchema = z.object({
  query: z.string().min(1),
})

const DownloadInputSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  url: z.string(),
})

export const searchYouTube = createServerFn({ method: 'GET' })
  .inputValidator(SearchInputSchema)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    const yt = await Innertube.create()
    const search = await yt.search(data.query, { type: 'video' })

    return search.videos.slice(0, 10).map((video: any) => ({
      id: video.id || '',
      title: video.title?.text || video.title || '',
      thumbnail: video.best_thumbnail?.url || video.thumbnails?.[0]?.url || '',
      duration: video.duration?.text || '',
      author: video.author?.name || '',
      views: video.view_count?.text || '0 views',
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }))
  })

export const downloadYouTube = createServerFn({ method: 'POST' })
  .inputValidator(DownloadInputSchema)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    console.log('Downloading video from URL:', data.url)

    const DOWNLOADS_DIR = getDownloadsFolder()

    // Sanitize filename
    const sanitizedTitle = data.title.replace(/[/\\?%*:|"<>]/g, '-')
    const outputTemplate = path.join(DOWNLOADS_DIR, `${sanitizedTitle}.%(ext)s`)

    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${data.url}"`

    console.log('Executing yt-dlp command...')
    
    try {
      const { stdout, stderr } = await execAsync(command)

      if (stderr && !stderr.includes('Deleting original file')) {
        console.error('yt-dlp stderr:', stderr)
      }

      console.log('yt-dlp stdout:', stdout)
    } catch (error) {
      // If download fails, list available formats for debugging
      console.log('\n=== Download failed, listing available formats ===')
      const listFormatsCommand = `yt-dlp --list-formats "${data.url}"`
      try {
        const { stdout: formatsOutput } = await execAsync(listFormatsCommand)
        console.log(formatsOutput)
      } catch (formatError) {
        console.error('Error listing formats:', formatError)
      }
      console.log('=== End of formats list ===\n')
      throw error
    }

    const outputPath = path.join(DOWNLOADS_DIR, `${sanitizedTitle}.mp3`)

    // Check if file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error('Download failed - file not created')
    }

    console.log(`Download complete: ${outputPath}`)

    return {
      success: true,
      path: outputPath,
      filename: `${sanitizedTitle}.mp3`,
    }
  })
