
import React from 'react';
import { GripVertical, X, GitBranch, Edit3, Check } from 'lucide-react';

interface NodeHeaderProps {
  title: string;
  isEditing: boolean;
  onUpdateTitle: (newTitle: string) => void;
  onEnterEdit: (e: React.MouseEvent) => void;
  onExitEdit: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onDelete: () => void;
  onBranch: (e: React.MouseEvent) => void;
  hasImage: boolean;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  title, isEditing, onUpdateTitle, onEnterEdit, onExitEdit, onDragStart, onDelete, onBranch
}) => {
  return (
    <div 
      className={`h-12 border-b border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-[#18181b] flex items-center px-3 justify-between cursor-grab active:cursor-grabbing select-none shrink-0 transition-colors`}
      onPointerDown={(e) => { e.stopPropagation(); onDragStart(e); }}
      onDoubleClick={onEnterEdit}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
        <GripVertical size={16} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
        <input 
            type="text"
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            disabled={!isEditing}
            className={`font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight bg-transparent border-none outline-none w-full ${!isEditing ? 'pointer-events-none truncate' : ''}`}
            placeholder="Enter title..."
            onPointerDown={(e) => isEditing && e.stopPropagation()}
        />
      </div>

      <div className="flex items-center gap-1">
         {isEditing ? (
           <button onMouseDown={(e) => { e.preventDefault(); onExitEdit(); }} className="flex items-center gap-1 bg-green-500/10 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 hover:bg-green-500/20 dark:hover:bg-green-900/50 font-medium text-xs transition-colors border border-green-500/20">
               <Check size={12} /> Done
           </button>
         ) : (
           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={onEnterEdit} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" title="Edit Text"><Edit3 size={14} /></button>
              <div className="w-px h-3 bg-zinc-300 dark:bg-white/10 mx-1"></div>
              <button onMouseDown={onBranch} className="p-1 hover:bg-purple-500/20 text-zinc-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title="Branch Out"><GitBranch size={14} /></button>
              <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-1 hover:bg-red-500/20 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><X size={14} /></button>
           </div>
         )}
      </div>
    </div>
  );
};
