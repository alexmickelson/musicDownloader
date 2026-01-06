import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Innertube } from 'youtubei.js'
import fs from 'fs'
import path from 'path'
import { loggingMiddleware } from './middleware'

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
    'use server'
    const STORAGE_DIR = path.join(process.cwd(), 'storage')
    
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
    'use server'
    console.log('Downloading video from URL:', data.url)
    
    const STORAGE_DIR = path.join(process.cwd(), 'storage')
    
    // Ensure storage directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
    
    const yt = await Innertube.create()
    
    // Get video info
    const info = await yt.getInfo(data.videoId)
    
    // Check if video has playability status
    if (info.playability_status?.status === 'UNPLAYABLE') {
      throw new Error('Video is not playable')
    }
    
    // Get the best audio format
    const audioFormat = info.chooseFormat({ type: 'audio', quality: 'best' })
    
    if (!audioFormat) {
      throw new Error('No audio format available')
    }
    
    // Sanitize filename
    const sanitizedTitle = data.title.replace(/[/\\?%*:|"<>]/g, '-')
    const outputPath = path.join(STORAGE_DIR, `${sanitizedTitle}.mp3`)
    
    // Download audio format
    const stream = await info.download({
      type: 'audio',
      quality: 'best',
    })
    
    // Create write stream
    const writeStream = fs.createWriteStream(outputPath)
    
    return new Promise<{ success: boolean; path: string; filename: string }>((resolve, reject) => {
      const reader = stream.getReader()
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              writeStream.end()
              break
            }
            
            writeStream.write(Buffer.from(value))
          }
        } catch (error) {
          console.error('Download error:', error)
          writeStream.destroy()
          reject(error)
        }
      }
      
      pump()
      
      writeStream.on('finish', () => {
        console.log(`Download complete: ${outputPath}`)
        resolve({
          success: true,
          path: outputPath,
          filename: `${sanitizedTitle}.mp3`,
        })
      })
      
      writeStream.on('error', (error) => {
        console.error('Write stream error:', error)
        reject(error)
      })
    })
  })
