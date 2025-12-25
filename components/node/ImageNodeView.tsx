
import React, { useRef, useState, useEffect } from 'react';
import { MoveVertical, AlignCenterVertical, Crop, MousePointer2, X } from 'lucide-react';

interface ImageNodeViewProps {
  image?: string;
  title: string;
  fit?: 'cover' | 'contain';
  position?: string;
  onDelete: () => void;
  onTitleChange: (val: string) => void;
  onDragStart: (e: React.PointerEvent) => void;
  onUpdateSettings: (fit: 'cover' | 'contain', position: string) => void;
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({ 
  image, title, fit = 'contain', position = 'center', onDelete, onTitleChange, onDragStart, onUpdateSettings 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRepositioning, setIsRepositioning] = useState(false);
  
  // Local state for smooth dragging without global re-renders
  const [localPos, setLocalPos] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number, y: number, posX: number, posY: number } | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [title]);

  // Reset local pos if external position changes and we aren't dragging
  useEffect(() => {
    if (!isRepositioning) {
        setLocalPos(null);
    }
  }, [position, isRepositioning]);

  const getPosPercentages = (posStr: string) => {
    let x = 50, y = 50;
    const parts = posStr.trim().split(/\s+/);
    
    const isVert = (s: string) => ['top', 'bottom'].includes(s);
    const isHorz = (s: string) => ['left', 'right'].includes(s);
    
    const parseVal = (v: string) => {
        if (v === 'left' || v === 'top') return 0;
        if (v === 'center') return 50;
        if (v === 'right' || v === 'bottom') return 100;
        return parseFloat(v) || 50;
    };

    if (parts.length === 1) {
        if (isVert(parts[0])) { x = 50; y = parseVal(parts[0]); }
        else if (isHorz(parts[0])) { x = parseVal(parts[0]); y = 50; }
        else if (parts[0] === 'center') { x = 50; y = 50; }
        else { x = parseVal(parts[0]); y = 50; }
    } else if (parts.length >= 2) {
        if (isVert(parts[0]) || isHorz(parts[1])) {
            y = parseVal(parts[0]);
            x = parseVal(parts[1]);
        } else {
            x = parseVal(parts[0]);
            y = parseVal(parts[1]);
        }
    }
    return { x, y };
  };

  const cyclePosition = () => {
    const sequence = ['center', 'top', 'bottom', 'left', 'right'];
    const idx = sequence.indexOf(position);
    const next = sequence[(idx + 1) % sequence.length];
    onUpdateSettings(fit, next);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Check if clicking a button (controls) - Allow this to pass through
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }

    if (isRepositioning) {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        
        // Initialize drag state from current (or local) position
        const currentPosString = localPos || position;
        const { x, y } = getPosPercentages(currentPosString);
        dragStartRef.current = { x: e.clientX, y: e.clientY, posX: x, posY: y };
    } else {
        onDragStart(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRepositioning && dragStartRef.current && containerRef.current) {
        e.stopPropagation();
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        const bounds = containerRef.current.getBoundingClientRect();
        if (bounds.width === 0 || bounds.height === 0) return;

        // Convert pixels to percentage of container
        // 1.2 acts as a sensitivity multiplier
        const percentChangeX = (deltaX / bounds.width) * 100 * 1.2;
        const percentChangeY = (deltaY / bounds.height) * 100 * 1.2;

        // Subtract delta to invert control (dragging mouse right reveals left side of image -> percentage decreases)
        const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - percentChangeX));
        const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - percentChangeY));

        setLocalPos(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isRepositioning && dragStartRef.current) {
        e.stopPropagation();
        if (e.currentTarget.releasePointerCapture) {
             e.currentTarget.releasePointerCapture(e.pointerId);
        }
        dragStartRef.current = null;
        // Commit final position to global state
        if (localPos) {
            onUpdateSettings(fit, localPos);
        }
    }
  };

  const activePosition = localPos || position;

  // Button styles matching NodeHeader
  const btnCommon = "p-1.5 backdrop-blur-sm transition-colors";
  // Matches NodeHeader: text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300
  // Wrapped in bg-white/80 dark:bg-black/50 for visibility over image
  const standardBtn = `${btnCommon} bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-black/5 dark:border-white/10`;
  const activeBtn = `${btnCommon} bg-blue-500 text-white border border-blue-600 shadow-md`;
  // Matches NodeHeader Delete: hover:bg-red-500/20 text-zinc-400 ... hover:text-red-600
  const deleteBtn = `${btnCommon} bg-white/80 dark:bg-black/60 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 border border-black/5 dark:border-white/10`;

  return (
    <>
      <div 
           ref={containerRef}
           className={`flex-1 relative overflow-hidden bg-white dark:bg-[#09090b] group/view select-none ${isRepositioning ? 'cursor-move' : ''}`} 
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
      >
           {image ? (
              <img 
                src={image} 
                className="w-full h-full pointer-events-none select-none transition-none will-change-[object-position]" 
                style={{ objectFit: fit, objectPosition: activePosition }} 
                alt="" 
              />
           ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs">NO IMAGE DATA</div>
           )}
           
           {/* Reposition Overlay Hint */}
           {isRepositioning && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 dark:bg-white/5 border-2 border-blue-500/50 z-20">
                <div className="bg-black/75 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md font-medium shadow-lg">
                    Drag to Reposition
                </div>
             </div>
           )}
           
           {/* Controls */}
           <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity z-10 ${isRepositioning ? 'opacity-100' : 'opacity-0 group-hover/view:opacity-100'}`}>
              <div className="flex gap-1">
                 <button onClick={(e) => {e.stopPropagation(); setIsRepositioning(!isRepositioning)}} className={isRepositioning ? activeBtn : standardBtn} title={isRepositioning ? "Finish Repositioning" : "Crop / Reposition"}>
                    {isRepositioning ? <MousePointer2 size={14} /> : <Crop size={14} />}
                 </button>

                 {!isRepositioning && (
                   <>
                     <button onClick={(e) => {e.stopPropagation(); onUpdateSettings(fit === 'cover' ? 'contain' : 'cover', position)}} className={standardBtn} title="Toggle Fit"><MoveVertical size={14} /></button>
                     <button onClick={(e) => {e.stopPropagation(); cyclePosition()}} className={standardBtn} title="Cycle Position"><AlignCenterVertical size={14} /></button>
                     <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={deleteBtn} title="Delete Image"><X size={14} /></button>
                   </>
                 )}
              </div>
           </div>
      </div>

      <div className="bg-zinc-50 dark:bg-[#18181b] border-t border-zinc-200 dark:border-white/10 flex items-start py-2 px-3 shrink-0">
           <textarea 
              ref={textareaRef}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-xs font-medium text-center bg-transparent outline-none text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 resize-none overflow-hidden"
              placeholder="Add a caption..."
              rows={1}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ minHeight: '24px', maxHeight: '150px' }}
           />
      </div>
    </>
  );
};
