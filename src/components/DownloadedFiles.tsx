import { Music, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDownloadedFiles, useUpdateFileMetadata, useMoveToJellyfin } from '../hooks/useYouTube'
import { FileCard } from './FileCard'

export function DownloadedFiles() {
  const { data: files, isLoading } = useDownloadedFiles()
  const updateMetadataMutation = useUpdateFileMetadata()
  const moveToJellyfinMutation = useMoveToJellyfin()
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMetadataUpdate = (filename: string, artist: string, track: string, album: string) => {
    setError(null)
    updateMetadataMutation.mutate(
      {
        filename,
        artist,
        track,
        album,
      },
      {
        onSuccess: () => {
          setEditingFile(null)
        },
        onError: (error: Error) => {
          console.error('Failed to update metadata:', error)
          setError(error.message)
        },
      }
    )
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
      <section className="px-4 sm:px-6 pb-12 sm:pb-16 max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
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
      <section className="px-4 sm:px-6 pb-12 sm:pb-16 max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          Downloaded Files
        </h2>
        <div className="text-center text-gray-400 py-8 sm:py-12 bg-slate-800/30 rounded-xl border border-slate-700 text-sm sm:text-base">
          No downloaded files yet
        </div>
      </section>
    )
  }

  return (
    <section className="px-2 pb-12 sm:pb-16 max-w-6xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <Music className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        Downloaded Files ({files.length})
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {updateMetadataMutation.isPending && (
        <div className="mb-4 flex items-center justify-center py-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mr-2" />
          <span className="text-cyan-400 text-sm">Updating metadata...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {files.map((file) => (
          <FileCard
            key={file.filename}
            file={file}
            isEditing={editingFile === file.filename}
            onEditClick={() => setEditingFile(file.filename)}
            onMoveToJellyfin={() => handleMoveToJellyfin(file)}
            onMetadataUpdate={(artist, track, album) =>
              handleMetadataUpdate(file.filename, artist, track, album)
            }
            onCancelEdit={() => setEditingFile(null)}
            isMoving={moveToJellyfinMutation.isPending}
          />
        ))}
      </div>
    </section>
  )
}
