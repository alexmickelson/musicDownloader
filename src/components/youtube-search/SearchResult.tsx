import { Download, CheckCircle, AlertCircle, ChevronUp, Play } from 'lucide-react'
import { useState } from 'react'
import { useYouTubeDownload } from '../../hooks/useYouTube'

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  author: string
  views: number | string
  url: string
}

function formatViews(views: number | string): string {
  let numViews: number
  if (typeof views === 'string') {
    // Parse the number before the space (e.g., "1234567" from "1234567 views")
    numViews = parseInt(views.split(' ')[0].replace(/,/g, ''), 10)
    if (isNaN(numViews)) return views // fallback if parsing fails
  } else {
    numViews = views
  }
  
  if (numViews >= 1_000_000_000) return `${(numViews / 1_000_000_000).toFixed(1)}B`
  if (numViews >= 1_000_000) return `${(numViews / 1_000_000).toFixed(1)}M`
  if (numViews >= 1_000) return `${(numViews / 1_000).toFixed(1)}K`
  return numViews.toString()
}

export function SearchResult({
  video,
  onDownloadComplete,
}: {
  video: Video
  onDownloadComplete?: () => void
}) {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const downloadMutation = useYouTubeDownload()

  const handleDownload = () => {
    setStatus(null)
    downloadMutation.mutate(
      { videoId: video.id, title: video.title, url: video.url },
      {
        onSuccess: (data) => {
          setStatus({ type: 'success', message: `Downloaded: ${data.filename}` })
          onDownloadComplete?.()
        },
        onError: (error: Error) => {
          setStatus({ type: 'error', message: error.message })
        },
      }
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-1 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full sm:w-32 h-40 sm:h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-base sm:text-lg font-semibold text-white hover:text-cyan-400 mb-1 line-clamp-2 sm:truncate block transition-colors cursor-pointer"
          >
            {video.title}
          </a>
          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-0">
            {video.author} • {video.duration} • {formatViews(video.views)} views
          </p>
        </div>
        <div className="flex gap-2 sm:gap-0 sm:contents">
          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 self-center flex-shrink-0 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">{downloadMutation.isPending ? 'Downloading...' : 'Download'}</span>
            <span className="xs:hidden">{downloadMutation.isPending ? '...' : 'Get'}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 self-center flex-shrink-0 text-sm sm:text-base"
            aria-label={isExpanded ? 'Collapse video' : 'Watch video'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isExpanded ? 'Hide' : 'Watch'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      
      {status && (
        <div className={`mt-3 p-2.5 sm:p-3 rounded-lg border flex items-center gap-2 ${
          status.type === 'success' 
            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm break-words">{status.message}</span>
        </div>
      )}
    </div>
  )
}
