import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Wand2 } from 'lucide-react';

interface TextNodeViewProps {
  content: string;
  isEditing: boolean;
  isGenerating?: boolean;
  fontStyle?: 'sans' | 'serif' | 'mono';
  globalFont?: 'sans' | 'serif' | 'mono';
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDoubleClick: () => void;
  onExpand: () => void;
  onEditAI: () => void;
  onImageSearch: () => void;
  onImageGen: () => void;
}

export const TextNodeView = forwardRef<HTMLTextAreaElement, TextNodeViewProps>(({
  content, isEditing, isGenerating, fontStyle, globalFont = 'sans', onChange, onDoubleClick, onExpand, onEditAI, onImageSearch, onImageGen
}, ref) => {
  
  const effectiveFont = fontStyle || globalFont;
  const fontClass = effectiveFont === 'serif' ? 'font-serif' : effectiveFont === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className={`flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-[#09090b] ${fontClass}`} onWheel={(e) => e.stopPropagation()}>
      {isEditing ? (
           <textarea
              ref={ref}
              value={content}
              onChange={onChange}
              className={`wiki-textarea flex-1 w-full h-full p-4 resize-none text-[15px] leading-relaxed bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-zinc-100 border-none ${fontClass}`}
              spellCheck={false}
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={onDoubleClick}
              placeholder="Write in Markdown..."
           />
      ) : (
          <div 
              className="markdown-content flex-1 overflow-y-auto px-4 py-3 text-[15px] select-text cursor-default bg-white dark:bg-[#18181b] transition-colors"
              onDoubleClick={onDoubleClick}
              onPointerDown={(e) => e.stopPropagation()} 
          >
              {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                  <p className="text-zinc-400 dark:text-zinc-500 italic">Double click to edit...</p>
              )}
          </div>
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
           <div className="flex flex-col items-center gap-2">
               <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
               <span className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">Gemini Thinking...</span>
           </div>
        </div>
      )}

      {!isEditing && (
        <div className="h-8 border-t border-zinc-200 dark:border-white/10 flex items-center gap-1 px-2 bg-zinc-50 dark:bg-[#18181b] shrink-0 font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={(e) => { e.stopPropagation(); onExpand(); }} className="flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 px-2 py-0.5 transition-colors uppercase tracking-wider"><Sparkles size={10} /> Expand with AI</button>
          <div className="w-px h-3 bg-zinc-300 dark:bg-white/10 mx-1"></div>
          <button onClick={(e) => { e.stopPropagation(); onEditAI(); }} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 px-2 py-0.5 transition-colors uppercase tracking-wider"><Wand2 size={10} /> Edit with AI</button>
        </div>
      )}
    </div>
  );
});