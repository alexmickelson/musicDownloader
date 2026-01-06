import { Search } from 'lucide-react'
import { useState } from 'react'
import { useYouTubeSearch } from '../hooks/useYouTube'
import { SearchResult } from './SearchResult'

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  author: string
  views: number | string
  url: string
}

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [shouldSearch, setShouldSearch] = useState(false)

  const { data: searchResults, isFetching, refetch } = useYouTubeSearch(
    searchQuery,
    shouldSearch
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShouldSearch(true)
      refetch()
    }
  }

  const handleDownloadComplete = () => {
    setSearchQuery('')
    setShouldSearch(false)
  }

  return (
    <>
      <section className="relative py-12 px-6 text-center">
        <div className="relative max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Search Results */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        {searchResults && searchResults.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((video: Video) => (
              <SearchResult key={video.id} video={video} onDownloadComplete={handleDownloadComplete} />
            ))}
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No results found. Try a different search term.
          </div>
        )}
      </section>
    </>
  )
}
