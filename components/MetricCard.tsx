
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, iconBg }) => {
  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border flex justify-between items-start transition-all hover:shadow-md">
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{value}</h3>
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} shadow-lg shadow-current/10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default MetricCard;
