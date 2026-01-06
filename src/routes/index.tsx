import { createFileRoute } from '@tanstack/react-router'
import { Music } from 'lucide-react'
import { SearchSection } from '../components/SearchSection'
import { DownloadedFiles } from '../components/DownloadedFiles'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-12 px-6 text-center">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Music className="w-16 h-16 text-cyan-400" />
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Music Downloader
              </span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Search and download audio from YouTube videos
          </p>
        </div>
      </section>

      <SearchSection />
      <DownloadedFiles />
    </div>
  )
}
