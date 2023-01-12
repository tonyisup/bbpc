import { env } from "../../env/server.mjs"

const API_BASE_URL = "https://www.googleapis.com/youtube/v3",
SEARCH_BASE_URL = `${API_BASE_URL}/search?maxResults=10&key=${env.GOOGLE_API_KEY}&part=snippet&safeSearch=none&type=video`

export interface VideoSearchResult {
  kind: string,
  etag: string,
  id: {
    kind: string,
    videoId: string,
    channelId: string,
    playlistId: string,
  },
  snippet: {
    publishedAt: string,
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
      default: {
        url: string,
        width: number,
        height: number,
      },
    },
    channelTitle: string,
    liveBroadcastContent: string,
  }
}

interface VideoSearchResponse {
  kind: string,
  etag: string,
  nextPageToken: string,
  prevPageToken: string,
  regionCode: string,
  pageInfo: {
    totalResults: number,
    resultsPerPage: number,
  },
  items: VideoSearchResult[]
}

export const yt = {
  getVideos: async(searchTerm=""): Promise<VideoSearchResponse> => {
    if (!searchTerm) return {
      kind: "",
      etag: "",
      nextPageToken: "",
      prevPageToken: "",
      regionCode: "",
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0,
      },
      items: [],
    }
    const resp = await fetch(`${SEARCH_BASE_URL}&q=${searchTerm}`)
    const res = await resp.json() as VideoSearchResponse;
    return res;
  }
}