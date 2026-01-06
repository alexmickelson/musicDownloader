import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useMusicBrainzSearch } from '../hooks/useMusicBrainz'
import { SearchResults } from './SearchResults'

export function MetadataEditor({
  filename,
  onMetadataSelect,
  onCancel,
}: {
  filename: string
  onMetadataSelect: (artist: string, track: string, album: string) => void
  onCancel: () => void
}) {
  const [searchQuery, setSearchQuery] = useState(filename.replace('.mp3', ''))
  const [searchType, setSearchType] = useState<'recording' | 'release' | 'artist'>('recording')
  const [shouldSearch, setShouldSearch] = useState(false)

  const { data: searchResults, isFetching } = useMusicBrainzSearch(
    searchQuery,
    searchType,
    shouldSearch
  )

  const handleSelectResult = (result: any) => {
    onMetadataSelect(result.artist, result.title, result.album)
  }

  return (
    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for track, artist, or album..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="recording">Track</option>
              <option value="release">Album</option>
              <option value="artist">Artist</option>
            </select>
            <button
              onClick={() => setShouldSearch(true)}
              disabled={isFetching}
              className="px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xs:inline">{isFetching ? 'Searching...' : 'Search'}</span>
              <span className="xs:hidden">{isFetching ? '...' : 'Go'}</span>
            </button>
            <button
              onClick={onCancel}
              className="px-2 sm:px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isFetching && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <SearchResults results={searchResults} onSelect={handleSelectResult} />
        )}

        {shouldSearch && searchResults && searchResults.length === 0 && !isFetching && (
          <p className="text-gray-400 text-sm text-center py-4">
            No results found. Try a different search term.
          </p>
        )}
      </div>
    </div>
  )
}
