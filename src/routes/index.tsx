import { createFileRoute } from '@tanstack/react-router'
import { Music, Search, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useYouTubeSearch, useYouTubeDownload } from '../hooks/useYouTube'
import { SearchResult } from '../components/SearchResult'

export const Route = createFileRoute('/')({
  component: App,
})

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  author: string
  views: number | string
  url: string
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)
  const [shouldSearch, setShouldSearch] = useState(false)

  const { data: searchResults, isFetching, refetch } = useYouTubeSearch(
    searchQuery,
    shouldSearch
  )

  const downloadMutation = useYouTubeDownload()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShouldSearch(true)
      refetch()
    }
  }

  const handleDownload = (videoId: string, title: string, url: string) => {
    setSelectedVideo(videoId)
    downloadMutation.mutate(
      { videoId, title, url },
      {
        onSuccess: (data) => {
          setDownloadStatus(`Downloaded: ${data.filename}`)
          setTimeout(() => setDownloadStatus(null), 5000)
        },
        onError: (error: Error) => {
          setDownloadStatus(`Error: ${error.message}`)
        },
      }
    )
  }

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

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for music or videos..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isFetching}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {isFetching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Download Status */}
          {downloadStatus && (
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="bg-slate-800 border border-cyan-500 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400">{downloadStatus}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        {searchResults && searchResults.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((video: Video) => (
              <SearchResult
                key={video.id}
                video={video}
                isDownloading={downloadMutation.isPending && selectedVideo === video.id}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No results found. Try a different search term.
          </div>
        )}
      </section>
    </div>
  )
}
