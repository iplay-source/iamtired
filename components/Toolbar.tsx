import React, { useRef, useState } from 'react';
import { MousePointer, Move, Image as ImageIcon, StickyNote, Upload, Link, ChevronDown, Save, Download, RefreshCcw, HardDrive, Grid, Magnet, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToolMode } from '../types';

interface ToolbarProps {
  onAddNode: (type: 'text' | 'image', title: string, content?: string, image?: string) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  
  // Save/Load Props
  isAutoSave: boolean;
  onToggleAutoSave: () => void;
  onSaveLocal: () => void;
  onLoadLocal: () => void;
  onExportFile: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Grid Props
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  
  // Theme
  isDarkMode: boolean;
  onToggleTheme: () => void;

  children?: React.ReactNode; 
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddNode, toolMode, setToolMode, onZoomIn, onZoomOut, 
  isAutoSave, onToggleAutoSave, onSaveLocal, onLoadLocal, onExportFile, onImportFile,
  showGrid, snapToGrid, onToggleGrid, onToggleSnap,
  isDarkMode, onToggleTheme,
  children
}) => {
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onAddNode('image', 'Uploaded Image', undefined, evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowImageMenu(false);
  };

  const handleAddImageURL = () => {
    const url = prompt("Enter Image URL:");
    if (url) onAddNode('image', 'Linked Image', undefined, url);
    setShowImageMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImportFile(e);
    setShowSaveMenu(false);
    if(importInputRef.current) importInputRef.current.value = '';
  }

  const btnClass = "text-zinc-500 dark:text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100";
  const activeBtnClass = "bg-blue-500/20 text-blue-600 dark:text-blue-400";
  const menuTextClass = "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-3 items-start pointer-events-none">
      <div className="pointer-events-auto">{children}</div>

      <div className="pointer-events-auto flex items-end gap-2">
        {/* Always Visible Group */}
        <div className="flex items-center gap-2">
            {/* System / Save Menu */}
            <div className="relative glass-panel p-1">
                 <button onClick={() => setShowSaveMenu(!showSaveMenu)} className={`p-2 transition-colors flex items-center gap-1 ${showSaveMenu ? 'bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-zinc-100' : btnClass}`} title="System / Save">
                      <Save size={18} />
                 </button>

                 {showSaveMenu && (
                     <div className="absolute bottom-full left-0 mb-2 w-48 glass-panel flex flex-col py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                         <button onClick={onToggleAutoSave} className={`flex items-center justify-between px-3 py-2 text-xs text-left group ${menuTextClass}`}>
                            <span className="flex items-center gap-2"><RefreshCcw size={12}/> Auto-Save</span>
                            <div className={`w-2 h-2 rounded-full ${isAutoSave ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                         </button>
                         <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2"></div>
                         <button onClick={() => { onSaveLocal(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><HardDrive size={12}/> Save to Browser</button>
                         <button onClick={() => { onLoadLocal(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><RefreshCcw size={12}/> Load from Browser</button>
                         <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2"></div>
                         <button onClick={() => { onExportFile(); setShowSaveMenu(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><Download size={12}/> Export JSON</button>
                         <button onClick={() => importInputRef.current?.click()} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><Upload size={12}/> Import JSON</button>
                     </div>
                 )}
                 <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
            </div>

            <div className="flex items-center gap-0.5 glass-panel p-1">
                <button onClick={() => onAddNode('text', 'New Note', '## New Note\nDouble click to edit...')} className={`p-2 transition-colors ${btnClass}`} title="Add Note">
                  <StickyNote size={18} />
                </button>
                
                <div className="relative">
                  <button onClick={() => setShowImageMenu(!showImageMenu)} className={`p-2 transition-colors flex items-center gap-1 ${showImageMenu ? 'bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-zinc-100' : btnClass}`} title="Add Image">
                      <ImageIcon size={18} /> <ChevronDown size={10} />
                  </button>
                  
                  {showImageMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-32 glass-panel flex flex-col py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><Upload size={12}/> Upload</button>
                          <button onClick={handleAddImageURL} className={`flex items-center gap-2 px-3 py-2 text-xs text-left ${menuTextClass}`}><Link size={12}/> URL</button>
                      </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
        </div>

        {/* Toggle Button */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className={`glass-panel p-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400`}
           title={isCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
        >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Collapsible Tools */}
        {!isCollapsed && (
            <div className="glass-panel px-1 py-1 flex items-center gap-0.5 animate-in slide-in-from-left-2 duration-300 fade-in">
              <ToolButton active={toolMode === ToolMode.SELECT} onClick={() => setToolMode(ToolMode.SELECT)} icon={<MousePointer size={18} />} label="Select (V)" />
              <ToolButton active={toolMode === ToolMode.PAN} onClick={() => setToolMode(ToolMode.PAN)} icon={<Move size={18} />} label="Pan (Space)" />
              <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>
              
              <button onClick={onToggleGrid} className={`p-2 transition-colors ${showGrid ? activeBtnClass : btnClass}`} title="Toggle Grid"><Grid size={18} /></button>
              <button onClick={onToggleSnap} className={`p-2 transition-colors ${snapToGrid ? activeBtnClass : btnClass}`} title="Snap to Grid"><Magnet size={18} /></button>
              
              <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>
              <button onClick={onZoomOut} className={`w-8 h-8 flex items-center justify-center rounded-none transition-colors font-mono text-lg ${btnClass}`}>-</button>
              <button onClick={onZoomIn} className={`w-8 h-8 flex items-center justify-center rounded-none transition-colors font-mono text-lg ${btnClass}`}>+</button>
              
              <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1"></div>
               <button onClick={onToggleTheme} className={`p-2 transition-colors ${btnClass}`} title="Toggle Theme">
                   {isDarkMode ? <Moon size={18}/> : <Sun size={18}/>}
               </button>
            </div>
        )}
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick} title={label}
    className={`p-2 transition-all duration-200 rounded-none ${active ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100'}`}
  >
    {icon}
  </button>
);