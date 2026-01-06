import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { searchMusicBrainz } from '../server/musicbrainz'

export function useMusicBrainzSearch(query: string, type: 'recording' | 'release' | 'artist', enabled: boolean) {
  const searchFn = useServerFn(searchMusicBrainz)

  return useQuery({
    queryKey: ['musicbrainz-search', query, type],
    queryFn: () => searchFn({ data: { query, type } }),
    enabled: enabled && query.trim().length > 0,
  })
}
