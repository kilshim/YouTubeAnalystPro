
import React from 'react';
import { Sparkles, Bot, Copy, Check } from 'lucide-react';

interface AiAnalysisProps {
  content: string;
  loading: boolean;
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ content, loading }) => {
  const [copied, setCopied] = React.useState(false);

  if (!loading && !content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight">AI 시장 경쟁 전략 분석</h2>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Gemini 2.5 Flash Engine</p>
          </div>
        </div>
        {!loading && (
          <button 
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="분석 결과 복사"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="flex space-x-3">
              <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest">실시간 데이터를 기반으로 전략을 수립 중입니다</p>
          </div>
        ) : (
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 mt-1 hidden sm:block">
              <div className="p-3 bg-indigo-50 dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800">
                <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            {/* 분석 텍스트 컨테이너에 스크롤바와 최대 높이 적용 */}
            <div className="flex-1 prose prose-sm prose-indigo dark:prose-invert max-w-none">
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-4 text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                {content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAnalysis;
