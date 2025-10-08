import { API_KEYS } from "@/config/apiKeys";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  tags?: string[];
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

/**
 * Search YouTube videos
 * @param query - Search query
 * @param maxResults - Maximum number of results (default: 10)
 * @returns Array of video objects
 */
export async function searchYouTubeVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${API_KEYS.YOUTUBE}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to search YouTube videos');
  }

  const data = await response.json();
  
  return data.items.map((item: YouTubeSearchItem) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

/**
 * Get videos from a specific channel
 * @param channelId - YouTube channel ID
 * @param maxResults - Maximum number of results (default: 10)
 * @returns Array of video objects
 */
export async function getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${API_KEYS.YOUTUBE}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get channel videos');
  }

  const data = await response.json();
  
  return data.items.map((item: YouTubeSearchItem) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

/**
 * Get videos by hashtag
 * @param hashtag - Hashtag (without #)
 * @param maxResults - Maximum number of results (default: 10)
 * @returns Array of video objects
 */
export async function getVideosByHashtag(hashtag: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  // Remove # if present
  const cleanHashtag = hashtag.replace(/^#/, '');
  return searchYouTubeVideos(`#${cleanHashtag}`, maxResults);
}
