
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Keyboard } from 'lucide-react';

interface HUDProps {
  nodeCount: number;
  connectionCount: number;
  zoomScale: number;
  lastSaved: Date | null;
}

const ShortcutRow = ({ label, action }: { label: string, action: string }) => (
    <div className="flex items-center justify-between w-full text-[10px] text-zinc-500 dark:text-zinc-400 gap-6">
        <span>{label}</span>
        <span className="font-mono text-[9px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/5 whitespace-nowrap">{action}</span>
    </div>
);

export const HUD: React.FC<HUDProps> = ({ nodeCount, connectionCount, zoomScale, lastSaved }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end pointer-events-none">
      <div className="glass-panel p-2 pointer-events-auto transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-black/60 shadow-lg border border-black/5 dark:border-white/10 min-w-[180px]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-end gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-full"
        >
          <div className="flex items-center gap-1.5">
             <Info size={14} />
             <span>Status & Help</span>
          </div>
          {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {!isCollapsed && (
          <div className="mt-3 flex flex-col gap-3 items-end w-full animate-in slide-in-from-bottom-2 duration-200">
             {lastSaved && (
                 <div className="mb-1 flex items-center justify-end gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 w-full pb-2 border-b border-zinc-200 dark:border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]"></div>
                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
            )}
            
            <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-0.5">
                    <Keyboard size={10} /> Shortcuts
                </div>
                <ShortcutRow label="Pan Canvas" action="Space + Drag" />
                <ShortcutRow label="Zoom" action="Ctrl + Scroll" />
                <ShortcutRow label="Add Node" action="Dbl Click Bg" />
                <ShortcutRow label="Edit Node" action="Dbl Click Node" />
                <ShortcutRow label="Edit Link" action="Click Link" />
                <ShortcutRow label="Connect" action="Drag Dot" />
                <ShortcutRow label="Resize" action="Drag Corner" />
            </div>
            
            <div className="w-full h-px bg-zinc-200 dark:bg-white/10 my-1"></div>
            
            <div className="flex justify-between w-full gap-2 text-xs font-mono opacity-80 text-zinc-500 dark:text-zinc-400">
              <span title="Nodes">{nodeCount} Nodes</span>
              <span title="Connections">{connectionCount} Links</span>
              <span title="Zoom">{(zoomScale * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
