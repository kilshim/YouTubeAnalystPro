
import { Key, Moon, Sun, Youtube, Sparkles, Trash2, Save, ExternalLink } from 'lucide-react';
import React from 'react';

interface SidebarProps {
  youtubeKey: string;
  setYoutubeKey: (key: string) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onSave: (type: 'yt' | 'ai') => void;
  onDelete: (type: 'yt' | 'ai') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  youtubeKey, setYoutubeKey, 
  geminiKey, setGeminiKey,
  isDark, toggleTheme,
  onSave, onDelete 
}) => {
  return (
    <aside className="w-full md:w-80 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-slate-800 flex flex-col h-auto md:h-screen sticky top-0 md:fixed md:left-0 z-30 transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-500/20">
             <Youtube className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-black text-gray-800 dark:text-white tracking-tighter">유튜브 분석 프로</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
        {/* YouTube API Key Section */}
        <section className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
            <Key className="w-3.5 h-3.5 mr-2 text-red-500" />
            YouTube Data API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="YouTube API Key 입력"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onSave('yt')} 
              className="flex-1 py-2 text-[11px] font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all flex items-center justify-center"
            >
              <Save className="w-3 h-3 mr-1.5" /> 저장
            </button>
            <button 
              onClick={() => onDelete('yt')} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-gray-200 dark:border-slate-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Gemini API Key Section */}
        <section className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            Gemini 2.5 Flash API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Gemini API Key 입력"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onSave('ai')} 
              className="flex-1 py-2 text-[11px] font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <Save className="w-3 h-3 mr-1.5" /> 저장
            </button>
            <button 
              onClick={() => onDelete('ai')} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-gray-200 dark:border-slate-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </section>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
          <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-tighter">서비스 안내</h3>
          <ul className="text-[11px] text-indigo-800/70 dark:text-indigo-300/60 list-disc pl-4 space-y-2 font-medium">
            <li>모든 API 키는 로컬 브라우저에만 암호화되어 저장됩니다.</li>
            <li>YouTube 키가 없으면 영상 데이터 검색이 불가능합니다.</li>
            <li>Gemini 키가 있어야 AI 심층 분석 및 요약 기능을 사용합니다.</li>
          </ul>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-100 dark:border-slate-800">
        <a 
          href="https://xn--design-hl6wo12cquiba7767a.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block text-[10px] font-black text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center"
        >
          떨림과울림Design.com <ExternalLink className="w-2.5 h-2.5 ml-1.5" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
