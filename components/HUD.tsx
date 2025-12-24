import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface HUDProps {
  nodeCount: number;
  connectionCount: number;
  zoomScale: number;
  lastSaved: Date | null;
}

export const HUD: React.FC<HUDProps> = ({ nodeCount, connectionCount, zoomScale, lastSaved }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end pointer-events-none">
      <div className="glass-panel p-2 pointer-events-auto transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-black/60 shadow-lg border border-black/5 dark:border-white/10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-end gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-full min-w-[60px]"
        >
          <div className="flex items-center gap-1">
             <Info size={14} />
             <span>Info</span>
          </div>
          {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {!isCollapsed && (
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex flex-col gap-1 items-end min-w-[140px] animate-in slide-in-from-bottom-2 duration-200">
             {lastSaved && (
                 <div className="mb-2 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]"></div>
                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
            )}
            <div className="flex flex-col gap-1 text-right">
                <span>Space + Drag to Pan</span>
                <span>Cmd + Scroll to Zoom</span>
                <span>Double-click to Edit</span>
            </div>
            
            <div className="w-full h-px bg-zinc-200 dark:bg-white/10 my-2"></div>
            
            <div className="flex justify-between w-full gap-4 font-mono opacity-80">
              <span title="Nodes">{nodeCount} N</span>
              <span title="Connections">{connectionCount} C</span>
              <span title="Zoom">{(zoomScale * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};