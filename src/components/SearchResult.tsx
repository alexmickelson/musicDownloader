import { Download } from 'lucide-react'

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
  isDownloading: boolean
  onDownload: (videoId: string, title: string, url: string) => void
}

export function SearchResult({ video, isDownloading, onDownload }: SearchResultProps) {
  return (
    <div
      key={video.id}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300 flex gap-4"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">
          {video.title}
        </h3>
        <p className="text-gray-400 text-sm mb-2">
          {video.author} • {video.duration} • {typeof video.views === 'number' ? video.views.toLocaleString() : video.views}
        </p>
      </div>
      <button
        onClick={() => onDownload(video.id, video.title, video.url)}
        disabled={isDownloading}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 self-center flex-shrink-0"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
    </div>
  )
}
