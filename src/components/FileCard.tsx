import { Music, Edit, FolderOutput } from 'lucide-react'
import { MetadataEditor } from './MetadataEditor'

export function FileCard({
  file,
  isEditing,
  onEditClick,
  onMoveToJellyfin,
  onMetadataUpdate,
  onCancelEdit,
  isMoving,
}: {
  file: {
    filename: string
    size: number
    createdAt: string
    track?: string
    artist?: string
    album?: string
  }
  isEditing: boolean
  onEditClick: () => void
  onMoveToJellyfin: () => void
  onMetadataUpdate: (artist: string, track: string, album: string) => void
  onCancelEdit: () => void
  isMoving: boolean
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate mb-1 text-sm sm:text-base">
              {file.filename}
            </h3>
            {file.track || file.artist || file.album ? (
              <div className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                {file.track && <p className="text-cyan-400 truncate">{file.track}</p>}
                <p className="text-gray-400 truncate">
                  {file.artist || 'Unknown Artist'}
                  {file.album && ` • ${file.album}`}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                </p>
                <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs rounded-full">
                  No metadata
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          {file.track && file.artist && file.album && (
            <button
              onClick={onMoveToJellyfin}
              disabled={isMoving}
              className="px-3 py-2 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              aria-label="Move to Jellyfin"
              title="Move to Jellyfin"
            >
              <FolderOutput className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="text-green-400 text-sm sm:text-base font-medium">Move</span>
            </button>
          )}
          <button
            onClick={onEditClick}
            className="px-3 py-2 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            aria-label="Edit metadata"
          >
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-cyan-400" />
            <span className="text-gray-400 hover:text-cyan-400 text-sm sm:text-base font-medium">Edit</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <MetadataEditor
          filename={file.filename}
          onMetadataSelect={onMetadataUpdate}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  )
}
