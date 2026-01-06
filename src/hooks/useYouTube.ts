import { useQuery, useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { searchYouTube, downloadYouTube } from '../server/youtube'

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

  return useMutation({
    mutationFn: (params: { videoId: string; title: string; url: string }) =>
      downloadFn({ data: params }),
  })
}
