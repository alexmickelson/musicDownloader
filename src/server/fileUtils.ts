import fs from 'fs'
import path from 'path'

export const getDownloadsFolder = () => {
  const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads')
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true })
  }
  return DOWNLOADS_DIR
}

export const getOutputFolder = () => {
  const OUTPUT_DIR = path.join(process.cwd(), 'output')
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  return OUTPUT_DIR
}
