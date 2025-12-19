
import React from 'react';

interface FormatChartProps {
  shortsCount: number;
  videoCount: number;
}

const FormatChart: React.FC<FormatChartProps> = ({ shortsCount, videoCount }) => {
  const total = shortsCount + videoCount;
  const shortsPercent = total > 0 ? (shortsCount / total) * 100 : 0;
  const videoPercent = 100 - shortsPercent;
  
  const radius = 75;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (shortsPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full py-10 bg-[#1e293b] rounded-2xl border border-slate-800/50 shadow-inner">
      {/* Title inside the card as seen in the image */}
      <h3 className="text-lg font-black text-white mb-10 tracking-tight">쇼츠 vs 일반 영상 비율</h3>
      
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle (Regular Video - Red) */}
          <circle 
            cx="128" cy="128" r={radius} 
            stroke="#ef4444" 
            strokeWidth={strokeWidth} 
            fill="transparent" 
          />
          {/* Progress circle (Shorts - Purple) */}
          <circle 
            cx="128" cy="128" r={radius} 
            stroke="#a855f7" 
            strokeWidth={strokeWidth} 
            fill="transparent" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-6xl font-black text-white tracking-tighter leading-none mb-1">{total}</span>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-80">TOTAL VIDEOS</span>
        </div>
      </div>

      {/* Legend - Matches the image style exactly */}
      <div className="flex items-center justify-center space-x-10 mt-12">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7] mr-2"></div>
          <span className="text-[13px] font-bold text-slate-300 mr-2">쇼츠 (1분 미만)</span>
          <span className="text-[13px] font-black text-indigo-400">{Math.round(shortsPercent)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mr-2"></div>
          <span className="text-[13px] font-bold text-slate-300 mr-2">일반 영상</span>
          <span className="text-[13px] font-black text-red-500">{Math.round(videoPercent)}%</span>
        </div>
      </div>
    </div>
  );
};

export default FormatChart;
