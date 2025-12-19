
import React from 'react';

interface MetricDistributionChartProps {
  data: { label: string; value: number }[];
  color: string;
  unit?: string;
}

const MetricDistributionChart: React.FC<MetricDistributionChartProps> = ({ data, color, unit = '' }) => {
  const chartHeight = 250;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const formatValue = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    return num.toLocaleString();
  };

  return (
    <div className="w-full bg-[#111827]/50 rounded-xl p-6 border border-slate-800/50">
      <div className="relative flex items-end justify-between space-x-1" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <div 
            key={tick} 
            className="absolute w-full border-t border-slate-800/30" 
            style={{ bottom: `${tick * 100}%` }}
          >
            <span className="absolute -left-10 -top-2 text-[9px] font-bold text-slate-600">
              {formatValue(Math.round(maxVal * tick))}
            </span>
          </div>
        ))}

        {/* Bars */}
        {data.map((item, i) => {
          const heightPercent = (item.value / maxVal) * 100;
          return (
            <div
              key={i}
              className="flex-1 group relative flex flex-col items-center justify-end h-full"
            >
              <div
                className="w-full rounded-t-sm transition-all duration-700 ease-out cursor-pointer relative"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: color,
                  opacity: 0.8 + (heightPercent / 500),
                  animation: `growUp 1s ease-out ${i * 30}ms forwards`
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-xl border border-slate-700">
                  {formatValue(item.value)}{unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
        <span>최고 성과 영상</span>
        <span>상위 20개 분포</span>
      </div>
      
      <style>{`
        @keyframes growUp {
          from { height: 0; }
        }
      `}</style>
    </div>
  );
};

export default MetricDistributionChart;
