import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Viewport, ToolMode } from './types';
import { Toolbar } from './components/Toolbar';
import { FormatToolbar } from './components/FormatToolbar';
import { Canvas } from './components/Canvas';
import { HUD } from './components/HUD';
import { useGraph } from './hooks/useGraph';

const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds

function App() {
  const [viewport, setViewport] = useState<Viewport>({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150, scale: 1 });
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.SELECT);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [globalFont, setGlobalFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const activeEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const graph = useGraph();
  const selectedNode = graph.nodes.find(n => n.selected);

  // Refs for State persistence (to avoid stale closures in intervals)
  const nodesRef = useRef(graph.nodes);
  const connectionsRef = useRef(graph.connections);
  const viewportRef = useRef(viewport);
  const globalFontRef = useRef(globalFont);
  const isDarkModeRef = useRef(isDarkMode);

  useEffect(() => { nodesRef.current = graph.nodes; }, [graph.nodes]);
  useEffect(() => { connectionsRef.current = graph.connections; }, [graph.connections]);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  useEffect(() => { globalFontRef.current = globalFont; }, [globalFont]);
  useEffect(() => { isDarkModeRef.current = isDarkMode; }, [isDarkMode]);

  // Theme Logic
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // -- Persistence Logic --

  const saveData = useCallback((toLocalStorage = true) => {
    const data = {
      version: 1,
      timestamp: Date.now(),
      nodes: nodesRef.current,
      connections: connectionsRef.current,
      viewport: viewportRef.current,
      globalFont: globalFontRef.current,
      isDarkMode: isDarkModeRef.current
    };
    
    if (toLocalStorage) {
      localStorage.setItem('iamtired_save', JSON.stringify(data));
      setLastSaved(new Date());
    }
    return data;
  }, []);

  const loadData = useCallback((data: any) => {
    if (!data || !data.nodes || !data.connections) {
        alert("Invalid save data.");
        return;
    }
    graph.loadGraph(data.nodes, data.connections);
    if (data.viewport) setViewport(data.viewport);
    if (data.globalFont) setGlobalFont(data.globalFont);
    if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
    setLastSaved(data.timestamp ? new Date(data.timestamp) : new Date());
  }, [graph]);

  // Auto Save Timer
  useEffect(() => {
    if (!isAutoSave) return;
    const interval = setInterval(() => {
        saveData(true);
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAutoSave, saveData]);

  // Manual Handlers
  const handleSaveLocal = () => {
    saveData(true);
    alert("Saved to Browser Storage!");
  };

  const handleLoadLocal = () => {
    const saved = localStorage.getItem('iamtired_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            loadData(parsed);
        } catch (e) {
            console.error(e);
            alert("Failed to load local save.");
        }
    } else {
        alert("No local save found.");
    }
  };

  const handleExportFile = () => {
    const data = saveData(false);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iamtired-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const parsed = JSON.parse(evt.target?.result as string);
            loadData(parsed);
        } catch (err) {
            alert("Error parsing JSON file");
        }
    };
    reader.readAsText(file);
  };

  // -- Event Listeners --

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isEditing = activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'INPUT';
      if (e.code === 'Space' && !e.repeat && !isEditing) setIsSpacePressed(true);
      if (isEditing) return;
      if (e.key.toLowerCase() === 'v') setToolMode(ToolMode.SELECT);
      if (e.key.toLowerCase() === 'h') setToolMode(ToolMode.PAN);
      // Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSaveLocal();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
    const handleWheel = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const centerX = (-viewport.x + window.innerWidth / 2) / viewport.scale;
                        const centerY = (-viewport.y + window.innerHeight / 2) / viewport.scale;
                        graph.addNode('image', 'Pasted Image', undefined, event.target?.result as string, { x: centerX, y: centerY });
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); 
    window.addEventListener('wheel', handleWheel, { passive: false }); window.addEventListener('paste', handlePaste);
    return () => { 
        window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); 
        window.removeEventListener('wheel', handleWheel); window.removeEventListener('paste', handlePaste);
    };
  }, [viewport, graph.addNode, handleSaveLocal]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (activeEditorRef.current) {
        const textarea = activeEditorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = textarea.value.substring(0, start) + prefix + textarea.value.substring(start, end) + suffix + textarea.value.substring(end);
        if (selectedNode) graph.updateNode(selectedNode.id, { content: newText });
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
    }
  };

  const FontButton = ({ font, current, onClick, label }: { font: string, current: string, onClick: () => void, label: string }) => (
    <button onClick={onClick} className={`px-2 py-0.5 text-xs ${current === font ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'} font-${font}`}>
        {label}
    </button>
  );

  return (
    <div className={`w-full h-full bg-zinc-100 dark:bg-[#09090b] relative overflow-hidden font-${globalFont} transition-colors duration-300`}>
      <Toolbar 
        onAddNode={(type, title, content, image) => {
             const centerX = (-viewport.x + window.innerWidth / 2) / viewport.scale;
             const centerY = (-viewport.y + window.innerHeight / 2) / viewport.scale;
             graph.addNode(type, title, content, image, { x: centerX, y: centerY });
        }} 
        toolMode={isSpacePressed ? ToolMode.PAN : toolMode} setToolMode={setToolMode} onZoomIn={() => setViewport(p => ({ ...p, scale: Math.min(3, p.scale * 1.2) }))} onZoomOut={() => setViewport(p => ({ ...p, scale: Math.max(0.1, p.scale / 1.2) }))}
        
        isAutoSave={isAutoSave}
        onToggleAutoSave={() => setIsAutoSave(!isAutoSave)}
        onSaveLocal={handleSaveLocal}
        onLoadLocal={handleLoadLocal}
        onExportFile={handleExportFile}
        onImportFile={handleImportFile}
        
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      >
         {/* Context Aware Menu */}
         {selectedNode && selectedNode.type === 'text' ? (
            <>
               <div className="flex items-center gap-1 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1 font-bold">NODE</div>
                  <FontButton font="sans" current={selectedNode.fontStyle || globalFont} onClick={() => graph.updateNode(selectedNode.id, { fontStyle: 'sans' })} label="Sans" />
                  <FontButton font="serif" current={selectedNode.fontStyle || globalFont} onClick={() => graph.updateNode(selectedNode.id, { fontStyle: 'serif' })} label="Serif" />
                  <FontButton font="mono" current={selectedNode.fontStyle || globalFont} onClick={() => graph.updateNode(selectedNode.id, { fontStyle: 'mono' })} label="Mono" />
               </div>
               <FormatToolbar onInsertMarkdown={insertMarkdown} />
            </>
         ) : (
            <div className="flex items-center gap-1 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1 font-bold">GLOBAL</div>
                <FontButton font="sans" current={globalFont} onClick={() => setGlobalFont('sans')} label="Sans" />
                <FontButton font="serif" current={globalFont} onClick={() => setGlobalFont('serif')} label="Serif" />
                <FontButton font="mono" current={globalFont} onClick={() => setGlobalFont('mono')} label="Mono" />
            </div>
         )}
      </Toolbar>

      <Canvas 
        nodes={graph.nodes} connections={graph.connections} viewport={viewport}
        toolMode={isSpacePressed ? ToolMode.PAN : toolMode} isSpacePressed={isSpacePressed}
        onViewportChange={setViewport} onUpdateContent={(id, c, t) => graph.updateNode(id, { content: c, title: t })}
        onUpdatePosition={(id, p) => graph.updateNode(id, { position: p })} onUpdateSize={(id, w, h) => graph.updateNode(id, { width: w, height: h })}
        onUpdateImage={(id, img) => graph.updateNode(id, { coverImage: img })} onUpdateImageSettings={(id, h, f, p) => graph.updateNode(id, { imageHeight: h, imageFit: f, imagePosition: p })}
        onDeleteNode={graph.deleteNode} onSelectNode={graph.selectNode} onBranchNode={graph.branchFromNode}
        onConnectEnd={graph.connectNodes} onExpandAI={graph.expandNodeAI} onEditNodeAI={graph.editNodeAI} onSetImage={graph.setNodeImage}
        onSelectConnection={graph.selectConnection} onUpdateConnectionLabel={graph.updateConnectionLabel} onDeleteConnection={graph.deleteConnection}
        registerFormatRef={(ref) => activeEditorRef.current = ref.current}
        showGrid={showGrid} snapToGrid={snapToGrid}
        globalFont={globalFont} isDarkMode={isDarkMode}
      />
      
      <HUD nodeCount={graph.nodes.length} connectionCount={graph.connections.length} zoomScale={viewport.scale} lastSaved={lastSaved} />
    </div>
  );
}

export default App;