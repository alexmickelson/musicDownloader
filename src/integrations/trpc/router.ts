import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'
import type { TRPCRouterRecord } from '@trpc/server'
import { Innertube } from 'youtubei.js'
import fs from 'fs'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), 'storage')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

const youtubeRouter = {
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const yt = await Innertube.create()
      const search = await yt.search(input.query, { type: 'video' })
      
      return search.videos.slice(0, 10).map((video: any) => ({
        id: video.id || '',
        title: video.title?.text || video.title || '',
        thumbnail: video.best_thumbnail?.url || video.thumbnails?.[0]?.url || '',
        duration: video.duration?.text || '',
        author: video.author?.name || '',
        views: video.view_count?.text || '0 views',
        url: `https://www.youtube.com/watch?v=${video.id}`,
      }))
    }),

  download: publicProcedure
    .input(z.object({ videoId: z.string(), title: z.string() }))
    .mutation(async ({ input }) => {
      const yt = await Innertube.create()
      const info = await yt.getInfo(input.videoId)
      
      // Sanitize filename
      const sanitizedTitle = input.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
      const filename = `${sanitizedTitle}.mp3`
      const filepath = path.join(STORAGE_DIR, filename)
      
      // Download the audio stream
      const stream = await info.download({ type: 'audio', quality: 'best' })
      const writeStream = fs.createWriteStream(filepath)
      
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        writeStream.write(value)
      }
      
      writeStream.end()
      
      return {
        success: true,
        filename,
        filepath: filepath,
      }
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  youtube: youtubeRouter,
})
export type TRPCRouter = typeof trpcRouter
