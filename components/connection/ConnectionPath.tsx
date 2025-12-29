import React from 'react';
import { Position, ToolMode } from '../../types';

interface ConnectionPathProps {
  start: Position;
  end: Position;
  isSelected: boolean;
  onSelect: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  toolMode: ToolMode;
  isSpacePressed: boolean;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  start, end, isSelected, onSelect, onContextMenu, toolMode, isSpacePressed
}) => {
  return (
    <g
      className="connection-path group"
      onPointerDown={(e) => { 
        if (toolMode === ToolMode.PAN || isSpacePressed) return;
        e.stopPropagation(); 
        onSelect(e); 
      }}
      onContextMenu={onContextMenu}
      style={{ cursor: toolMode === ToolMode.PAN || isSpacePressed ? 'inherit' : 'pointer', pointerEvents: 'auto' }}
    >
      {/* Invisible wider path for better hit detection */}
      <path
        d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
        stroke="transparent"
        strokeWidth="60"
        fill="none"
      />

      {/* Visible line */}
      <path
        d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
        stroke={isSelected ? "#3b82f6" : "var(--text-main)"}
        strokeOpacity={isSelected ? 1 : 0.4}
        strokeWidth={isSelected ? "3" : "2.5"}
        className="transition-colors duration-200 group-hover:stroke-blue-400"
        fill="none"
      />
    </g>
  );
};