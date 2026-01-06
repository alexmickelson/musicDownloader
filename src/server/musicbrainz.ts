import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { loggingMiddleware } from './middleware'

const SearchMusicBrainzSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['recording', 'release', 'artist']),
})

interface MusicBrainzResult {
  id: string
  title: string
  artist: string
  album?: string
  year?: string
  score: number
  coverArt?: string
}

export const searchMusicBrainz = createServerFn({ method: 'GET' })
  .inputValidator(SearchMusicBrainzSchema)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    'use server'
    
    const baseUrl = 'https://musicbrainz.org/ws/2'
    const userAgent = 'MusicDownloader/1.0.0 (https://github.com/alexmickelson/musicdownloader)'
    
    try {
      let url: string
      let results: MusicBrainzResult[] = []
      
      if (data.type === 'recording') {
        url = `${baseUrl}/recording/?query=${encodeURIComponent(data.query)}&fmt=json&limit=10`
        const response = await fetch(url, {
          headers: { 'User-Agent': userAgent }
        })
        
        if (!response.ok) throw new Error('MusicBrainz API error')
        
        const json = await response.json()
        results = await Promise.all(json.recordings?.map(async (rec: any) => {
          let coverArt: string | undefined
          const releaseId = rec.releases?.[0]?.id
          
          if (releaseId) {
            try {
              const coverArtUrl = `https://coverartarchive.org/release/${releaseId}/front-250`
              const coverResponse = await fetch(coverArtUrl, { method: 'HEAD' })
              if (coverResponse.ok) {
                coverArt = coverArtUrl
              }
            } catch {
              // Cover art not available, continue without it
            }
          }
          
          return {
            id: rec.id,
            title: rec.title,
            artist: rec['artist-credit']?.[0]?.name || 'Unknown Artist',
            album: rec.releases?.[0]?.title,
            year: rec.releases?.[0]?.date?.substring(0, 4),
            score: rec.score,
            coverArt,
          }
        }) || [])
      } else if (data.type === 'release') {
        url = `${baseUrl}/release/?query=${encodeURIComponent(data.query)}&fmt=json&limit=10`
        const response = await fetch(url, {
          headers: { 'User-Agent': userAgent }
        })
        
        if (!response.ok) throw new Error('MusicBrainz API error')
        
        const json = await response.json()
        results = await Promise.all(json.releases?.map(async (rel: any) => {
          let coverArt: string | undefined
          
          if (rel.id) {
            try {
              const coverArtUrl = `https://coverartarchive.org/release/${rel.id}/front-250`
              const coverResponse = await fetch(coverArtUrl, { method: 'HEAD' })
              if (coverResponse.ok) {
                coverArt = coverArtUrl
              }
            } catch {
              // Cover art not available, continue without it
            }
          }
          
          return {
            id: rel.id,
            title: rel.title,
            artist: rel['artist-credit']?.[0]?.name || 'Unknown Artist',
            album: rel.title,
            year: rel.date?.substring(0, 4),
            score: rel.score,
            coverArt,
          }
        }) || [])
      } else if (data.type === 'artist') {
        url = `${baseUrl}/artist/?query=${encodeURIComponent(data.query)}&fmt=json&limit=10`
        const response = await fetch(url, {
          headers: { 'User-Agent': userAgent }
        })
        
        if (!response.ok) throw new Error('MusicBrainz API error')
        
        const json = await response.json()
        results = json.artists?.map((art: any) => ({
          id: art.id,
          title: art.name,
          artist: art.name,
          score: art.score,
        })) || []
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return results
    } catch (error) {
      console.error('MusicBrainz search error:', error)
      throw new Error('Failed to search MusicBrainz')
    }
  })
