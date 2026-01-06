import { Music, Check } from 'lucide-react'

export function SearchResults({
  results,
  onSelect,
}: {
  results: Array<{
    id: string
    title: string
    artist: string
    album?: string
    year?: string
    coverArt?: string
  }>
  onSelect: (result: any) => void
}) {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result)}
          className="w-full text-left p-2 sm:p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 sm:gap-3"
        >
          {result.coverArt ? (
            <img
              src={result.coverArt}
              alt={result.title}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-600 rounded flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          )}
          <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-sm sm:text-base">{result.title}</p>
              <div className="text-gray-400 text-xs sm:text-sm">
                <span className="block sm:inline truncate">{result.artist}</span>
                {result.album && (
                  <>
                    <span className="hidden sm:inline"> • </span>
                    <span className="block sm:inline truncate">{result.album}</span>
                  </>
                )}
                {result.year && (
                  <>
                    <span className="hidden sm:inline"> </span>
                    <span className="block sm:inline">({result.year})</span>
                  </>
                )}
              </div>
            </div>
            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
          </div>
        </button>
      ))}
    </div>
  )
}
