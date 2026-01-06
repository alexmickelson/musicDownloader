import { Download, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { useState } from 'react'
import { useYouTubeDownload } from '../hooks/useYouTube'

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  author: string
  views: number | string
  url: string
}

interface SearchResultProps {
  video: Video
  onDownloadComplete?: () => void
}

export function SearchResult({ video, onDownloadComplete }: SearchResultProps) {
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
          setTimeout(() => setStatus(null), 5000)
          onDownloadComplete?.()
        },
        onError: (error: Error) => {
          setStatus({ type: 'error', message: error.message })
          setTimeout(() => setStatus(null), 5000)
        },
      }
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex gap-4">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-semibold text-white hover:text-cyan-400 mb-1 truncate block transition-colors cursor-pointer"
          >
            {video.title}
          </a>
          <p className="text-gray-400 text-sm mb-2">
            {video.author} • {video.duration} • {typeof video.views === 'number' ? video.views.toLocaleString() : video.views}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloadMutation.isPending}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 self-center flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          {downloadMutation.isPending ? 'Downloading...' : 'Download'}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 self-center flex-shrink-0"
          aria-label={isExpanded ? 'Collapse video' : 'Watch video'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isExpanded ? 'Hide' : 'Watch'}
        </button>
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
        <div className={`mt-3 p-3 rounded-lg border flex items-center gap-2 ${
          status.type === 'success' 
            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{status.message}</span>
        </div>
      )}
    </div>
  )
}
