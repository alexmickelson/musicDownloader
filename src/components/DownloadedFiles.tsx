import { Music, Loader2, Search, Edit, X, Check, FolderOutput } from 'lucide-react'
import { useState } from 'react'
import { useDownloadedFiles, useUpdateFileMetadata, useMoveToJellyfin } from '../hooks/useYouTube'
import { useMusicBrainzSearch } from '../hooks/useMusicBrainz'

export function DownloadedFiles() {
  const { data: files, isLoading } = useDownloadedFiles()
  const updateMetadataMutation = useUpdateFileMetadata()
  const moveToJellyfinMutation = useMoveToJellyfin()
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'recording' | 'release' | 'artist'>('recording')
  const [shouldSearch, setShouldSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: searchResults, isFetching } = useMusicBrainzSearch(searchQuery, searchType, shouldSearch)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSearch = (filename: string) => {
    setEditingFile(filename)
    setSearchQuery(filename.replace('.mp3', ''))
    setShouldSearch(true)
    setError(null)
  }

  const handleSelectMetadata = (filename: string, result: any) => {
    setError(null)
    updateMetadataMutation.mutate(
      {
        filename,
        artist: result.artist,
        track: result.title,
        album: result.album,
      },
      {
        onSuccess: () => {
          setEditingFile(null)
          setShouldSearch(false)
          setSearchQuery('')
        },
        onError: (error: Error) => {
          console.error('Failed to update metadata:', error)
          setError(error.message)
        },
      }
    )
  }

  const handleCancel = () => {
    setEditingFile(null)
    setShouldSearch(false)
    setSearchQuery('')
    setError(null)
  }

  const handleMoveToJellyfin = (file: any) => {
    if (!file.artist || !file.track || !file.album) {
      setError('Missing metadata. Please ensure artist, track, and album are set.')
      return
    }

    setError(null)
    moveToJellyfinMutation.mutate(
      {
        filename: file.filename,
        artist: file.artist,
        track: file.track,
        album: file.album,
      },
      {
        onError: (error: Error) => {
          console.error('Failed to move file:', error)
          setError(error.message)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Music className="w-6 h-6 text-cyan-400" />
          Downloaded Files
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </section>
    )
  }

  if (!files || files.length === 0) {
    return (
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Music className="w-6 h-6 text-cyan-400" />
          Downloaded Files
        </h2>
        <div className="text-center text-gray-400 py-12 bg-slate-800/30 rounded-xl border border-slate-700">
          No downloaded files yet. Start by searching and downloading some music!
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 pb-16 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Music className="w-6 h-6 text-cyan-400" />
        Downloaded Files ({files.length})
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {files.map((file) => (
          <div key={file.filename} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate mb-1">
                    {file.filename}
                  </h3>
                  {file.track || file.artist || file.album ? (
                    <div className="text-sm space-y-1">
                      {file.track && (
                        <p className="text-cyan-400">
                          {file.track}
                        </p>
                      )}
                      <p className="text-gray-400">
                        {file.artist || 'Unknown Artist'}
                        {file.album && ` • ${file.album}`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                      </p>
                      <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs rounded-full">
                        No metadata
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {file.track && file.artist && file.album && (
                  <button
                    onClick={() => handleMoveToJellyfin(file)}
                    disabled={moveToJellyfinMutation.isPending}
                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Move to Jellyfin"
                    title="Move to Jellyfin"
                  >
                    <FolderOutput className="w-8 h-8 text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch(file.filename)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Edit metadata"
                >
                  <Edit className="w-8 h-8 text-gray-400 hover:text-cyan-400" />
                </button>
              </div>
            </div>

            {editingFile === file.filename && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for track, artist, or album..."
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="recording">Track</option>
                      <option value="release">Album</option>
                      <option value="artist">Artist</option>
                    </select>
                    <button
                      onClick={() => setShouldSearch(true)}
                      disabled={isFetching}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {isFetching ? 'Searching...' : 'Search'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {isFetching && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  )}

                  {updateMetadataMutation.isPending && (
                    <div className="flex items-center justify-center py-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
                      <span className="text-cyan-400">Updating metadata...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {searchResults && searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((result: any) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectMetadata(file.filename, result)}
                          className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-3"
                        >
                          {result.coverArt ? (
                            <img 
                              src={result.coverArt} 
                              alt={result.title}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-600 rounded flex items-center justify-center flex-shrink-0">
                              <Music className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{result.title}</p>
                              <p className="text-gray-400 text-sm truncate">
                                {result.artist}
                                {result.album && ` • ${result.album}`}
                                {result.year && ` (${result.year})`}
                              </p>
                            </div>
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {shouldSearch && searchResults && searchResults.length === 0 && !isFetching && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No results found. Try a different search term.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
