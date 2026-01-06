import { createFileRoute } from '@tanstack/react-router'
import { Music } from 'lucide-react'
import { SearchSection } from '../components/youtube-search/SearchSection'
import { DownloadedFiles } from '../components/DownloadedFiles'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-6 sm:py-8 md:py-12 px-4 sm:px-6 text-center">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <Music className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-cyan-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Music Downloader
              </span>
            </h1>
          </div>
        </div>
      </section>

      <SearchSection />
      <DownloadedFiles />
    </div>
  )
}
