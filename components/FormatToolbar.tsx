import React from 'react';
import { Bold, Italic, List, Heading1, Heading2, Quote } from 'lucide-react';

interface FormatToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string) => void;
}

export const FormatToolbar: React.FC<FormatToolbarProps> = ({ onInsertMarkdown }) => {
  const handleMouseDown = (e: React.MouseEvent, prefix: string, suffix: string = '') => {
    e.preventDefault();
    onInsertMarkdown(prefix, suffix);
  };

  const btnClass = "p-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-none transition-colors";

  return (
    <div className="flex items-center gap-1 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200">
      <button onMouseDown={(e) => handleMouseDown(e, '## ', '')} className={btnClass} title="Heading 2"><Heading1 size={16} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '### ', '')} className={btnClass} title="Heading 3"><Heading2 size={16} /></button>
      <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-1" />
      <button onMouseDown={(e) => handleMouseDown(e, '**', '**')} className={btnClass} title="Bold"><Bold size={16} /></button>
      <button onMouseDown={(e) => handleMouseDown(e, '*', '*')} className={btnClass} title="Italic"><Italic size={16} /></button>
      <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-1" />
      <button onMouseDown={(e) => handleMouseDown(e, '- ', '')} className={btnClass} title="List"><List size={16} /></button>
       <button onMouseDown={(e) => handleMouseDown(e, '> ', '')} className={btnClass} title="Quote"><Quote size={16} /></button>
    </div>
  );
};