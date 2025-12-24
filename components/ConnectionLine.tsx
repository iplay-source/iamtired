import React, { useState } from 'react';
import { Position } from '../types';
import { X, Check } from 'lucide-react';

interface ConnectionLineProps {
  id: string;
  start: Position;
  end: Position;
  label?: string;
  isSelected: boolean;
  onSelect: (e: React.PointerEvent | React.MouseEvent) => void;
  onUpdateLabel: (val: string) => void;
  onDelete: () => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ 
  id, start, end, label, isSelected, onSelect, onUpdateLabel, onDelete 
}) => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    if (!isSelected) onSelect(e);
  };

  const handleLabelClick = (e: React.MouseEvent) => {
      e.stopPropagation(); setEditingLabel(label || ""); onSelect(e);
  };

  const submitLabel = () => {
      if (editingLabel !== null) onUpdateLabel(editingLabel);
      setEditingLabel(null);
  };

  return (
    <g className="connection-line group" onPointerDown={handlePointerDown} style={{ cursor: 'pointer' }}>
      <path d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} stroke="transparent" strokeWidth="20" fill="none" />
      
      <path
        d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
        stroke={isSelected ? "#3b82f6" : "var(--text-main)"} 
        strokeOpacity={isSelected ? 1 : 0.4}
        strokeWidth={isSelected ? "2" : "1.5"}
        className="transition-colors duration-200 group-hover:stroke-blue-400"
        fill="none"
        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
      />
      
      <foreignObject x={midX - 60} y={midY - 20} width={120} height={40} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div className="flex justify-center items-center h-full relative" style={{ pointerEvents: 'auto' }}>
          {isSelected ? (
              <div className="flex items-center gap-1 bg-white dark:bg-[#18181b] border border-blue-500/50 p-1 shadow-lg" onPointerDown={(e) => e.stopPropagation()}>
                  <input 
                    type="text" className="w-20 text-[10px] outline-none bg-transparent text-zinc-900 dark:text-white border-b border-blue-500/30" 
                    placeholder="Label..." value={editingLabel ?? label ?? ""} onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') submitLabel(); }} autoFocus
                  />
                  <button onClick={submitLabel} className="text-green-600 dark:text-green-400 hover:bg-green-500/20 p-0.5"><Check size={10} /></button>
                  <button onClick={onDelete} className="text-red-600 dark:text-red-400 hover:bg-red-500/20 p-0.5"><X size={10} /></button>
              </div>
          ) : (
             (label || isSelected) && (
               <div className={`px-2 py-0.5 glass-panel text-[10px] truncate max-w-[100px] select-none ${isSelected ? 'border-blue-500/50 text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} onPointerDown={handleLabelClick}>
                 {label || "+"}
               </div>
             )
          )}
        </div>
      </foreignObject>
    </g>
  );
};