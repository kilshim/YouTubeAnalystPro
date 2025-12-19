
import { VideoResult, ChannelInfo } from '../types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchYouTubeData = async (
  query: string, 
  apiKey: string, 
  region: string = 'KR', 
  maxResults: number = 20,
  categoryId: string = ''
): Promise<VideoResult[]> => {
  if (!apiKey) throw new Error('YouTube API 키가 필요합니다.');

  let allVideoIds: string[] = [];
  let nextPageToken = '';
  
  const fetchBatch = async (token: string) => {
    let regionParam = '';
    let relevanceLang = '';

    // 시장 구분에 따른 검색 필터 강화
    if (region === 'KR') {
      regionParam = '&regionCode=KR';
      relevanceLang = '&relevanceLanguage=ko';
    } else if (region === 'Global') {
      // 해외(US 기준) 및 영어권 영상 우선 검색으로 한국 영상 노출 최소화
      regionParam = '&regionCode=US';
      relevanceLang = '&relevanceLanguage=en';
    } else {
      // ALL: 제한 없음
      regionParam = '';
      relevanceLang = '';
    }

    const categoryParam = categoryId ? `&videoCategoryId=${categoryId}` : '';
    const limit = Math.min(50, maxResults - allVideoIds.length);
    
    const url = `${BASE_URL}/search?part=id&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}${regionParam}${relevanceLang}${categoryParam}&key=${apiKey}${token ? `&pageToken=${token}` : ''}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || '검색 중 오류가 발생했습니다.');
    }
    const data = await res.json();
    const ids = data.items?.map((item: any) => item.id.videoId) || [];
    allVideoIds = [...allVideoIds, ...ids];
    return data.nextPageToken;
  };

  nextPageToken = await fetchBatch('');
  while (maxResults > allVideoIds.length && nextPageToken) {
    nextPageToken = await fetchBatch(nextPageToken);
  }

  if (allVideoIds.length === 0) return [];
  return fetchVideoDetails(allVideoIds, apiKey);
};

export const searchChannels = async (query: string, apiKey: string, maxResults: number = 10): Promise<ChannelInfo[]> => {
  const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${maxResults}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.items || data.items.length === 0) return [];

  const channelIds = data.items.map((item: any) => item.id.channelId).join(',');
  const detailUrl = `${BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();

  return detailData.items.map((c: any) => ({
    id: c.id,
    title: c.snippet.title,
    customUrl: c.snippet.customUrl || '',
    description: c.snippet.description,
    publishedAt: c.snippet.publishedAt,
    thumbnailUrl: c.snippet.thumbnails.medium.url,
    viewCount: parseInt(c.statistics.viewCount),
    subscriberCount: parseInt(c.statistics.subscriberCount),
    videoCount: parseInt(c.statistics.videoCount),
    avgUploadInterval: 'N/A',
    latestUploadInterval: 'N/A',
    firstUploadDate: 'N/A'
  }));
};

export const fetchVideoDetails = async (videoIds: string[], apiKey: string): Promise<VideoResult[]> => {
  const results: VideoResult[] = [];
  // 50개 단위로 상세 정보 요청 (YouTube API 제한)
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).join(',');
    const url = `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${chunk}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.items) continue;

    const channelIds = Array.from(new Set(data.items.map((v: any) => v.snippet.channelId))).join(',');
    const channelRes = await fetch(`${BASE_URL}/channels?part=statistics&id=${channelIds}&key=${apiKey}`);
    const channelData = await channelRes.json();
    const channelMap = new Map(channelData.items?.map((c: any) => [c.id, c.statistics.subscriberCount]) || []);

    data.items.forEach((video: any) => {
      results.push({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        tags: video.snippet.tags || [],
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        subscriberCount: parseInt(channelMap.get(video.snippet.channelId) as string || '0'),
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        thumbnailUrl: video.snippet.thumbnails.medium.url,
        duration: video.contentDetails.duration,
      });
    });
  }
  return results;
};

export const fetchChannelAnalysis = async (channelId: string, apiKey: string): Promise<{ info: ChannelInfo, videos: VideoResult[] }> => {
  const channelRes = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
  const channelData = await channelRes.json();
  if (!channelData.items?.length) throw new Error('채널 정보를 찾을 수 없습니다.');
  const c = channelData.items[0];

  const searchRes = await fetch(`${BASE_URL}/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=50&key=${apiKey}`);
  const searchData = await searchRes.json();
  const videoIds = searchData.items?.map((i: any) => i.id.videoId) || [];
  const videos = await fetchVideoDetails(videoIds, apiKey);

  const dates = videos.map(v => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
  const latestDiff = dates.length > 1 ? (dates[0] - dates[1]) / (1000 * 60 * 60) : 0;
  const avgDiff = dates.length > 1 ? (dates[0] - dates[dates.length - 1]) / (dates.length - 1) / (1000 * 60 * 60) : 0;

  const info: ChannelInfo = {
    id: c.id,
    title: c.snippet.title,
    customUrl: c.snippet.customUrl || '',
    description: c.snippet.description,
    publishedAt: c.snippet.publishedAt,
    thumbnailUrl: c.snippet.thumbnails.default.url,
    viewCount: parseInt(c.statistics.viewCount),
    subscriberCount: parseInt(c.statistics.subscriberCount),
    videoCount: parseInt(c.statistics.videoCount),
    avgUploadInterval: `${Math.floor(avgDiff / 24)}일 ${Math.floor(avgDiff % 24)}시간`,
    latestUploadInterval: `${Math.floor(latestDiff)}시간`,
    firstUploadDate: dates.length > 0 ? new Date(dates[dates.length-1]).toLocaleDateString() : 'N/A'
  };

  return { info, videos };
};
