
import React from 'react';
import { VideoResult } from '../types';

interface UploadTimelineProps {
  videos: VideoResult[];
}

const UploadTimeline: React.FC<UploadTimelineProps> = ({ videos }) => {
  // Sort by date ascending to show timeline
  const sortedVideos = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  
  if (sortedVideos.length === 0) return null;

  const firstDate = new Date(sortedVideos[0].publishedAt).getTime();
  const lastDate = new Date(sortedVideos[sortedVideos.length - 1].publishedAt).getTime();
  const range = lastDate - firstDate || 1;

  return (
    <div className="w-full bg-[#111827]/50 rounded-xl p-8 border border-slate-800/50">
      <div className="relative h-32 flex items-center">
        {/* Progress Line */}
        <div className="absolute w-full h-0.5 bg-slate-800 rounded-full"></div>
        
        {/* Circles for each upload */}
        {sortedVideos.map((video, i) => {
          const pos = ((new Date(video.publishedAt).getTime() - firstDate) / range) * 100;
          const isShort = video.title.includes('#shorts') || video.duration.includes('PT59S');
          
          return (
            <div 
              key={video.id}
              className="absolute group"
              style={{ left: `${pos}%` }}
            >
              <div 
                className={`w-3 h-3 rounded-full border-2 border-[#111827] cursor-pointer transition-transform hover:scale-150 ${isShort ? 'bg-purple-500' : 'bg-red-500'}`}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-2xl border border-slate-700">
                <p className="text-slate-400 mb-1">{new Date(video.publishedAt).toLocaleDateString()}</p>
                <p className="max-w-[150px] truncate">{video.title}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">분석 기간</p>
          <p className="text-white text-xs font-black">
            {new Date(firstDate).toLocaleDateString()} ~ {new Date(lastDate).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">범례</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] text-slate-300 font-bold">일반 영상</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[10px] text-slate-300 font-bold">쇼츠</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTimeline;
