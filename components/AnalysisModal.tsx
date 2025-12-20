
import React, { useState } from 'react';
import { Sparkles, Bot, Copy, Check, X, Loader2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  loading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, content, loading }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">AI 시장 경쟁 전략 분석</h2>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!loading && content && (
              <button 
                onClick={handleCopy}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all border border-transparent"
                title="전체 복사"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-[#0f172a]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                <Bot className="w-16 h-16 text-indigo-600 dark:text-indigo-400 relative z-10 animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">데이터를 분석하고 있습니다...</h3>
                <p className="text-sm text-slate-500 font-medium">시장 규모, 경쟁 강도, 차별화 전략을 수립 중입니다.</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm md:prose-base prose-indigo dark:prose-invert max-w-none">
              <div className="text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end bg-gray-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
