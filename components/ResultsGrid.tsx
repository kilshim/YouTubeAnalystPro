
import React from 'react';
import { VideoResult } from '../types';
import { Eye, ThumbsUp, MessageSquare, BrainCircuit, ExternalLink, Users } from 'lucide-react';

interface ResultsGridProps {
  data: VideoResult[];
  onSummaryClick: (video: VideoResult) => void;
  onChannelAnalysis?: (channelId: string) => void;
  currentType: 'all' | 'video' | 'short';
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ data, onSummaryClick, onChannelAnalysis, currentType }) => {
  const formatNum = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    return num.toLocaleString();
  };

  const isShort = (v: VideoResult) => {
    return v.title.includes('#shorts') || v.tags.some(t => t.toLowerCase() === 'shorts') || v.duration.includes('PT59S') || v.duration.includes('PT40S'); 
  };

  const calculateScore = (v: VideoResult) => {
    const score = Math.floor((v.viewCount * 0.1 + v.likeCount + v.commentCount * 5) / 1000);
    return Math.min(score, 100);
  };

  return (
    <div className={`grid gap-6 ${currentType === 'short' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
      {data.map((video) => {
        const isThisVideoShort = isShort(video);
        const useShortAspect = currentType === 'short';

        return (
          <div key={video.id} className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col group hover:ring-2 hover:ring-red-500 transition-all shadow-sm h-full">
            <a 
              href={`https://www.youtube.com/watch?v=${video.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`relative block overflow-hidden bg-gray-100 dark:bg-slate-800 ${useShortAspect ? 'aspect-[9/14]' : 'aspect-video'}`}
            >
              <img 
                src={video.thumbnailUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={video.title} 
              />
              <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center border border-white/10 z-10">
                🔥 {calculateScore(video)}점
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 z-10">
                {video.duration.replace('PT','').replace('H',':').replace('M',':').replace('S','')}
              </div>
              {isThisVideoShort && !useShortAspect && (
                <div className="absolute bottom-2 left-2 bg-purple-600/90 px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase z-10">
                  Shorts
                </div>
              )}
            </a>

            <div className="p-4 flex flex-col flex-1 space-y-3">
              <a 
                href={`https://www.youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 h-8 leading-tight hover:text-red-500 transition-colors"
              >
                {video.title}
              </a>
              
              <div className="flex flex-wrap items-center gap-y-1">
                <button 
                  onClick={() => onChannelAnalysis?.(video.channelId)}
                  className="flex items-center text-[10px] text-gray-500 dark:text-slate-400 font-bold hover:text-red-500 transition-colors mr-3"
                >
                  <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded-full mr-1 flex-shrink-0"></div>
                  <span className="truncate max-w-[100px]">{video.channelTitle}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-1 flex-shrink-0" />
                </button>
                <div className="flex items-center text-[9px] font-black text-slate-400">
                  <Users className="w-2.5 h-2.5 mr-1" /> {formatNum(video.subscriberCount || 0)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 py-2 border-y border-gray-100 dark:border-slate-800">
                <div className="text-center border-r border-gray-100 dark:border-slate-800">
                  <Eye className="w-3 h-3 mx-auto text-gray-400 dark:text-slate-500 mb-0.5" />
                  <p className="text-[10px] font-black text-gray-800 dark:text-white">{formatNum(video.viewCount)}</p>
                </div>
                <div className="text-center border-r border-gray-100 dark:border-slate-800">
                  <ThumbsUp className="w-3 h-3 mx-auto text-gray-400 dark:text-slate-500 mb-0.5" />
                  <p className="text-[10px] font-black text-gray-800 dark:text-white">{formatNum(video.likeCount)}</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="w-3 h-3 mx-auto text-gray-400 dark:text-slate-500 mb-0.5" />
                  <p className="text-[10px] font-black text-gray-800 dark:text-white">{formatNum(video.commentCount)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-slate-500 font-bold mt-auto">
                <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                <span className={`px-1.5 py-0.5 rounded uppercase ${isThisVideoShort ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}`}>
                  {isThisVideoShort ? 'Shorts' : 'Video'}
                </span>
              </div>

              <button 
                onClick={() => onSummaryClick(video)}
                className="w-full py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-[10px] font-bold text-gray-600 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all"
              >
                <BrainCircuit className="w-3 h-3 mr-1.5" /> AI 영상 요약
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsGrid;
