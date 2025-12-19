
import React from 'react';
import { X } from 'lucide-react';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-8">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {description || '설명이 없습니다.'}
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 dark:bg-red-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all">확인</button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;
