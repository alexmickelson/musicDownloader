import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { searchYouTube, downloadYouTube } from '../server/youtube'
import { getDownloadedFiles, updateFileMetadata, moveToJellyfin } from '../server/musicFiles'

export function useYouTubeSearch(searchQuery: string, enabled: boolean) {
  const searchFn = useServerFn(searchYouTube)

  return useQuery({
    queryKey: ['youtube-search', searchQuery],
    queryFn: () => searchFn({ data: { query: searchQuery } }),
    enabled: enabled && searchQuery.trim().length > 0,
  })
}

export function useYouTubeDownload() {
  const downloadFn = useServerFn(downloadYouTube)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { videoId: string; title: string; url: string }) =>
      downloadFn({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloaded-files'] })
    },
  })
}

export function useDownloadedFiles() {
  const getFilesFn = useServerFn(getDownloadedFiles)

  return useQuery({
    queryKey: ['downloaded-files'],
    queryFn: () => getFilesFn(),
  })
}

export function useUpdateFileMetadata() {
  const updateFn = useServerFn(updateFileMetadata)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { filename: string; artist?: string; track?: string; album?: string }) =>
      updateFn({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloaded-files'] })
    },
  })
}

export function useMoveToJellyfin() {
  const moveFn = useServerFn(moveToJellyfin)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { filename: string; artist: string; track: string; album: string }) =>
      moveFn({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloaded-files'] })
    },
  })
}
