import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { parseFile } from 'music-metadata'
import { loggingMiddleware } from './middleware'
import { getDownloadsFolder, getOutputFolder } from './fileUtils'

const execAsync = promisify(exec)

export const getDownloadedFiles = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware])
  .handler(async () => {
    const DOWNLOADS_DIR = getDownloadsFolder()

    const files = fs.readdirSync(DOWNLOADS_DIR)
    const mp3Files = files.filter((file) => file.endsWith('.mp3'))

    const filesWithMetadata = await Promise.all(
      mp3Files.map(async (filename) => {
        const filePath = path.join(DOWNLOADS_DIR, filename)
        const stats = fs.statSync(filePath)

        // Read metadata from MP3 file tags
        let metadata = {
          track: undefined as string | undefined,
          album: undefined as string | undefined,
          artist: undefined as string | undefined,
        }

        try {
          const fileMetadata = await parseFile(filePath)
          metadata = {
            track: fileMetadata.common.title || undefined,
            album: fileMetadata.common.album || undefined,
            artist: fileMetadata.common.artist || undefined,
          }
        } catch (error) {
          console.error(`Error reading metadata for ${filename}:`, error)
        }

        return {
          filename,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          ...metadata,
        }
      }),
    )

    return filesWithMetadata.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })

const UpdateMetadataInputSchema = z.object({
  filename: z.string(),
  artist: z.string().optional(),
  track: z.string().optional(),
  album: z.string().optional(),
})

export const updateFileMetadata = createServerFn({ method: 'POST' })
  .inputValidator(UpdateMetadataInputSchema)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    const DOWNLOADS_DIR = getDownloadsFolder()
    const oldPath = path.join(DOWNLOADS_DIR, data.filename)

    // Check if file exists
    if (!fs.existsSync(oldPath)) {
      throw new Error('File not found')
    }

    // Create new filename from track name if provided, otherwise use original
    const sanitizedTitle = data.track
      ? data.track.replace(/[/\\?%*:|"<>]/g, '-')
      : data.filename.replace('.mp3', '')
    const newFilename = `${sanitizedTitle}.mp3`
    const newPath = path.join(DOWNLOADS_DIR, newFilename)
    const tempPath = path.join(DOWNLOADS_DIR, `temp_${Date.now()}.mp3`)

    // Build ffmpeg metadata arguments with proper quoting
    const metadataArgs = []
    if (data.artist) metadataArgs.push('-metadata', `"artist=${data.artist}"`)
    if (data.track) metadataArgs.push('-metadata', `"title=${data.track}"`)
    if (data.album) metadataArgs.push('-metadata', `"album=${data.album}"`)

    // Use ffmpeg to copy the file with new metadata
    const ffmpegCommand = [
      'ffmpeg',
      '-i', `"${oldPath}"`,
      ...metadataArgs,
      '-codec', 'copy',
      '-id3v2_version', '3',
      `"${tempPath}"`,
      '-y', // Overwrite without asking
    ].join(' ')

    console.log('Executing ffmpeg command:', ffmpegCommand)
    const { stdout, stderr } = await execAsync(ffmpegCommand)

    if (stderr && !stderr.includes('Output #0')) {
      console.error('ffmpeg stderr:', stderr)
    }

    console.log('ffmpeg stdout:', stdout)

    // Check if temp file was created
    if (!fs.existsSync(tempPath)) {
      throw new Error('Failed to create file with new metadata')
    }

    // Remove old file and rename temp file to new filename
    fs.unlinkSync(oldPath)
    fs.renameSync(tempPath, newPath)

    console.log(`File updated: ${newPath}`)

    return {
      success: true,
      filename: newFilename,
      path: newPath,
    }
  })

const MoveToJellyfinInputSchema = z.object({
  filename: z.string(),
  artist: z.string(),
  track: z.string(),
  album: z.string(),
})

export const moveToJellyfin = createServerFn({ method: 'POST' })
  .inputValidator(MoveToJellyfinInputSchema)
  .middleware([loggingMiddleware])
  .handler(async ({ data }) => {
    const DOWNLOADS_DIR = getDownloadsFolder()
    const OUTPUT_DIR = getOutputFolder()
    const sourcePath = path.join(DOWNLOADS_DIR, data.filename)

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error('File not found')
    }

    // Sanitize folder and file names
    const sanitizedArtist = data.artist.replace(/[/\\?%*:|"<>]/g, '-')
    const sanitizedAlbum = data.album.replace(/[/\\?%*:|"<>]/g, '-')
    const sanitizedTrack = data.track.replace(/[/\\?%*:|"<>]/g, '-')

    // Create destination path
    const artistDir = path.join(OUTPUT_DIR, sanitizedArtist)
    const albumDir = path.join(artistDir, sanitizedAlbum)
    const destinationPath = path.join(albumDir, `${sanitizedTrack}.mp3`)

    // Create directories if they don't exist
    if (!fs.existsSync(artistDir)) {
      fs.mkdirSync(artistDir, { recursive: true })
    }
    if (!fs.existsSync(albumDir)) {
      fs.mkdirSync(albumDir, { recursive: true })
    }

    // Copy file (can't use rename across filesystem boundaries)
    fs.copyFileSync(sourcePath, destinationPath)
    fs.unlinkSync(sourcePath)

    console.log(`File moved to Jellyfin: ${destinationPath}`)

    return {
      success: true,
      path: destinationPath,
    }
  })
