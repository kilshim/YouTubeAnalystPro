
import React from 'react';
import { VideoResult } from '../types';
import { Eye, ThumbsUp, MessageSquare, ExternalLink, Copy, BrainCircuit, Users } from 'lucide-react';

interface ResultsTableProps {
  data: VideoResult[];
  onSummaryClick: (video: VideoResult) => void;
  onChannelAnalysis?: (channelId: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onSummaryClick, onChannelAnalysis }) => {
  if (data.length === 0) return null;

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    return num.toLocaleString();
  };

  const copyUrl = (id: string) => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${id}`);
    alert('URL이 복사되었습니다.');
  };

  const calculateScore = (v: VideoResult) => {
    const score = Math.floor((v.viewCount * 0.1 + v.likeCount + v.commentCount * 5) / 1000);
    return Math.min(score, 100);
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">영상 정보</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">채널</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">구독자</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">인기 점수</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">주요 성과</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">게시일</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">기능</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {data.map((video) => (
              <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] text-white px-1 rounded">
                        {video.duration.replace('PT','').replace('S','').replace('M',':').replace('H',':')}
                      </div>
                    </div>
                    <div className="max-w-xs">
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[13px] font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-red-500 transition-colors leading-tight"
                      >
                        {video.title}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onChannelAnalysis?.(video.channelId)}
                    className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-red-500 transition-colors flex items-center"
                  >
                    <span className="truncate max-w-[100px]">{video.channelTitle}</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex items-center justify-center text-[11px] font-black text-slate-700 dark:text-slate-300">
                      <Users className="w-3 h-3 mr-1 text-slate-400" /> {formatNumber(video.subscriberCount || 0)}
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black rounded-lg">
                    🔥 {calculateScore(video)}점
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex items-center text-[10px] font-bold text-gray-700 dark:text-slate-300">
                      <Eye className="w-3 h-3 mr-1.5 opacity-40 text-blue-500" /> {formatNumber(video.viewCount)}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-gray-700 dark:text-slate-300">
                      <ThumbsUp className="w-3 h-3 mr-1.5 opacity-40 text-red-500" /> {formatNumber(video.likeCount)}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-gray-700 dark:text-slate-300">
                      <MessageSquare className="w-3 h-3 mr-1.5 opacity-40 text-green-500" /> {formatNumber(video.commentCount)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-slate-500">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => onSummaryClick(video)}
                      className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 rounded-lg text-slate-500 dark:text-slate-400 transition-all group/btn"
                      title="AI 요약"
                    >
                      <BrainCircuit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => copyUrl(video.id)} 
                      className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
                      title="URL 복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
