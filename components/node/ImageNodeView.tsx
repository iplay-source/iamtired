import React, { useRef, useEffect } from 'react';
import { CornerRightDown, MoveVertical, AlignCenterVertical, ArrowUpFromLine, ArrowDownFromLine } from 'lucide-react';

interface ImageNodeViewProps {
  image?: string;
  title: string;
  fit?: 'cover' | 'contain';
  position?: string;
  onDelete: () => void;
  onTitleChange: (val: string) => void;
  onDragStart: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent) => void;
  onUpdateSettings: (fit: 'cover' | 'contain', position: string) => void;
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({ 
  image, title, fit = 'contain', position = 'center', onDelete, onTitleChange, onDragStart, onResizeStart, onUpdateSettings 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [title]);

  const cyclePosition = () => {
    const sequence = ['center', 'top', 'bottom', 'left', 'right'];
    const idx = sequence.indexOf(position);
    const next = sequence[(idx + 1) % sequence.length];
    onUpdateSettings(fit, next);
  };

  return (
    <>
      <div className="flex-1 relative overflow-hidden bg-zinc-100 dark:bg-[#18181b] group/view" 
           onPointerDown={(e) => { e.stopPropagation(); onDragStart(e); }}
      >
           {image ? (
              <img src={image} className="w-full h-full pointer-events-none select-none transition-all duration-300" style={{ objectFit: fit, objectPosition: position }} alt="" />
           ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs">NO IMAGE DATA</div>
           )}
           
           <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/view:opacity-100 transition-opacity z-10">
              <div className="flex gap-1">
                 <button onClick={(e) => {e.stopPropagation(); onUpdateSettings(fit === 'cover' ? 'contain' : 'cover', position)}} className="bg-white/80 dark:bg-black/50 hover:bg-blue-500/20 dark:hover:bg-blue-500/80 p-1.5 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-colors" title="Toggle Fit"><MoveVertical size={14} /></button>
                 <button onClick={(e) => {e.stopPropagation(); cyclePosition()}} className="bg-white/80 dark:bg-black/50 hover:bg-blue-500/20 dark:hover:bg-blue-500/80 p-1.5 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-colors" title="Cycle Position"><AlignCenterVertical size={14} /></button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-white/80 dark:bg-black/50 hover:bg-red-500/20 dark:hover:bg-red-500/80 p-1.5 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-white transition-colors"><CornerRightDown size={14} className="rotate-45" /></button>
              </div>
           </div>
      </div>

      <div className="bg-zinc-50 dark:bg-[#09090b] border-t border-zinc-200 dark:border-white/10 flex items-start py-2 px-3 shrink-0">
           <textarea 
              ref={textareaRef}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-xs font-medium text-center bg-transparent outline-none text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 resize-none overflow-hidden"
              placeholder="Caption..."
              rows={1}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ minHeight: '24px', maxHeight: '150px' }}
           />
           <div className="cursor-se-resize text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 pl-2 pt-1" onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e); }}>
             <CornerRightDown size={10} strokeWidth={3} />
           </div>
      </div>
    </>
  );
};