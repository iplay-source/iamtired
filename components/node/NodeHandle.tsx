import React from 'react';
import { HandlePosition } from '../../types';

interface NodeHandleProps {
  position: HandlePosition;
  onDown: (e: React.PointerEvent) => void;
  onUp: (e: React.PointerEvent) => void;
}

export const NodeHandle: React.FC<NodeHandleProps> = ({ position, onDown, onUp }) => {
  let style: React.CSSProperties = {};
  switch (position) {
    case 'top': style = { top: -5, left: '50%', transform: 'translateX(-50%)' }; break;
    case 'bottom': style = { bottom: -5, left: '50%', transform: 'translateX(-50%)' }; break;
    case 'left': style = { left: -5, top: '50%', transform: 'translateY(-50%)' }; break;
    case 'right': style = { right: -5, top: '50%', transform: 'translateY(-50%)' }; break;
  }

  return (
    <div 
      className="absolute w-2.5 h-2.5 bg-[#09090b] border border-zinc-500 z-50 hover:bg-blue-500 hover:border-blue-500 cursor-crosshair transition-all duration-200 opacity-0 group-hover:opacity-100"
      style={style}
      onPointerDown={(e) => { e.stopPropagation(); onDown(e); }}
      onPointerUp={(e) => { e.stopPropagation(); onUp(e); }}
    />
  );
};