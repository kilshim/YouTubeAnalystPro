
import React from 'react';
import { ChannelInfo } from '../types';
import { ExternalLink, Calendar, Clock, RotateCcw, Globe } from 'lucide-react';

interface ChannelHeaderProps {
  info: ChannelInfo;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ info }) => {
  const format = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    return num.toLocaleString();
  };

  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 shadow-2xl transition-colors text-white">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
        {/* Left Section: Profile & Key Metrics */}
        <div className="flex items-center space-x-8 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-600 shadow-2xl">
              <img src={info.thumbnailUrl} className="w-full h-full object-cover" alt={info.title} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
              <span className="text-slate-400">Global</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-black tracking-tight">{info.title}</h2>
              <a href={`https://youtube.com/${info.customUrl}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
            
            <div className="flex items-center space-x-10">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1 tracking-wider">구독자 수</p>
                <p className="text-red-500 font-black text-2xl">{format(info.subscriberCount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1 tracking-wider">총 조회수</p>
                <p className="text-white font-black text-2xl">{format(info.viewCount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1 tracking-wider">총 영상 수</p>
                <p className="text-white font-black text-2xl">{info.videoCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Metadata Box */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 min-w-[340px] grid grid-cols-2 gap-x-8 gap-y-5">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold flex items-center">채널 개설일:</p>
            <p className="text-white text-xs font-black">{new Date(info.publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold flex items-center">최초 업로드:</p>
            <p className="text-white text-xs font-black">{info.firstUploadDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold flex items-center"><Clock className="w-3 h-3 mr-1" /> 평균 업로드 주기:</p>
            <p className="text-white text-xs font-black">{info.avgUploadInterval}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold flex items-center"><Clock className="w-3 h-3 mr-1" /> 최근 업로드 주기:</p>
            <p className="text-white text-xs font-black">{info.latestUploadInterval}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
