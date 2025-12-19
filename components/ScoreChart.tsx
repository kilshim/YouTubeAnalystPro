
import React from 'react';

interface ScoreChartProps {
  scores: number[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  const chartHeight = 300;
  const chartWidth = 1000;
  const barPadding = 10;
  const barWidth = (chartWidth / Math.max(scores.length, 1)) - barPadding;

  return (
    <div className="w-full bg-[#111827] rounded-xl p-8 border border-slate-800">
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels and grid lines */}
        {[0, 25, 50, 75, 100].map(val => (
          <div key={val} className="absolute w-full border-t border-slate-800" style={{ bottom: `${val}%` }}>
            <span className="absolute -left-10 -top-2 text-[10px] font-bold text-slate-500">{val}</span>
          </div>
        ))}
        
        {/* Bars */}
        <div className="flex items-end h-full px-2 space-x-[10px]">
          {scores.map((score, i) => (
            <div
              key={i}
              className="bg-[#ef4444] rounded-t-sm transition-all duration-1000 ease-out hover:brightness-125 cursor-pointer relative group"
              style={{ 
                height: `${score}%`, 
                width: `${barWidth}px`,
                animation: `growUp 1s ease-out ${i * 50}ms forwards`
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {score}점
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes growUp {
          from { height: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScoreChart;
