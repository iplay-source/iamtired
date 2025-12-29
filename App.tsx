import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { ToolMode, AIConfig } from './types';
import { Toolbar } from './components/toolbar/Toolbar';
import { GlobalToolbar } from './components/toolbar/GlobalToolbar';
import { SelectedNodeToolbar } from './components/toolbar/SelectedNodeToolbar';
import { Canvas } from './components/Canvas';
import { HUD } from './components/HUD';
import { SettingsMenu } from './components/SettingsMenu';
import { WelcomeModal } from './components/WelcomeModal';
import { ExportModal } from './components/ExportModal';
import { TabBar } from './components/tabs/TabBar';
import { useAppState } from './hooks/useAppState';
import { useTabs } from './hooks/useTabs';
import { useTabGraph } from './hooks/useTabGraph';
import { useTabPersistence } from './hooks/useTabPersistence';
import { useEventHandlers } from './hooks/useEventHandlers';
import { useContextMenu } from './hooks/useContextMenu';
import { useClipboard } from './hooks/useClipboard';
import { useContextMenuActions } from './hooks/useContextMenuActions';
import { ContextMenu } from './components/ContextMenu';
import { useToast } from './context/ToastContext';
import { configureAI } from './services/geminiService';
import * as fileHandlers from './utils/fileHandlers';

function App() {
  const { addToast } = useToast();
  const [isPanDragging, setIsPanDragging] = React.useState(false);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const {
    toolMode, setToolMode, isSpacePressed, setIsSpacePressed,
    isAutoSave, setIsAutoSave, showGrid, setShowGrid, snapToGrid, setSnapToGrid,
    globalHeaderFont, setGlobalHeaderFont, globalHeaderFontSize, setGlobalHeaderFontSize, globalHeaderColor, setGlobalHeaderColor,
    globalBodyFont, setGlobalBodyFont, globalBodyFontSize, setGlobalBodyFontSize,
    globalColor, setGlobalColor, isDarkMode, setIsDarkMode, lastSaved, setLastSaved,
    showSettings, setShowSettings, showWelcome, setShowWelcome, aiConfig, setAiConfig
  } = useAppState();

  const [showExportModal, setShowExportModal] = React.useState(false);

  const { tabs, activeTabId, activeTab, addTab, closeTab, switchTab, updateTabTitle, updateActiveTabData, loadTabState, reorderTabs, getTabState } = useTabs();
  const graph = useTabGraph(activeTab, updateActiveTabData);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { copy, paste, canPaste } = useClipboard();
  const [contextMenuNodeType, setContextMenuNodeType] = React.useState<'text' | 'image' | 'title' | 'group' | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const handleShowContextMenu = useCallback((e: React.MouseEvent | MouseEvent, type: 'canvas' | 'node' | 'connection' | 'selection', targetId?: string) => {
    let nodeType: 'text' | 'image' | 'title' | 'group' | undefined = undefined;
    let menuType = type;
    const selectedNodes = graph.nodes.filter(n => n.selected);
    
    if (type === 'node' && targetId) {
      const node = graph.nodes.find(n => n.id === targetId);
      if (node) {
        nodeType = node.type;
        if (!node.selected) {
            graph.selectNode(targetId);
        }
      }
    } else if (type === 'canvas' && selectedNodes.length > 1) {
        menuType = 'selection';
    }
    
    setContextMenuNodeType(nodeType);
    showContextMenu(e, menuType, targetId);
  }, [graph, showContextMenu]);

  const handleContextMenuAction = useContextMenuActions({ graph, contextMenu, hideContextMenu, copy, paste, addToast, fileInputRef });

  const { loadData, saveData, markInitialized } = useTabPersistence({
    getTabState, loadTabState, 
    globalHeaderFont, globalHeaderFontSize, globalHeaderColor,
    globalBodyFont, globalBodyFontSize, globalColor,
    isDarkMode, isAutoSave, showGrid, snapToGrid, toolMode,
    setGlobalHeaderFont, setGlobalHeaderFontSize, setGlobalHeaderColor,
    setGlobalBodyFont, setGlobalBodyFontSize, setGlobalColor,
    setIsDarkMode, setIsAutoSave, setShowGrid, setSnapToGrid, setToolMode, setLastSaved
  });

  const handleSaveLocal = useCallback(() => fileHandlers.handleSaveLocal(saveData, addToast), [saveData, addToast]);

  useEventHandlers({ 
    viewport: graph.viewport, mousePosRef, setIsSpacePressed, setToolMode, handleSaveLocal, 
    addNode: graph.addNode, onDeleteSelected: () => {
      const selected = graph.nodes.find(n => n.selected); if (selected) graph.deleteNode(selected.id);
      const selectedConn = graph.connections.find(c => c.selected); if (selectedConn) graph.deleteConnection(selectedConn.id);
    }
  });

  useEffect(() => { isDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark'); }, [isDarkMode]);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { 
      const rect = document.querySelector('.canvas-container')?.getBoundingClientRect() || { left: 0, top: 0 };
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }; 
    };
    window.addEventListener('mousemove', handleMouseMove); return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem('iamtired_ai_config');
    if (savedConfig) { try { setAiConfig(JSON.parse(savedConfig)); configureAI(JSON.parse(savedConfig)); } catch (e) {} }
    else configureAI(aiConfig);
    if (!localStorage.getItem('iamtired_onboarding_complete') && !savedConfig) setShowWelcome(true);
    
    const saved = localStorage.getItem('iamtired_save');
    if (saved) {
      try { loadData(JSON.parse(saved)); } catch (e) {
        console.error("Failed to load save:", e);
        markInitialized();
      }
    } else {
      markInitialized();
    }
  }, []);

  const selectedNode = graph.nodes.find(n => n.selected);
  
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (activeEditorRef.current && selectedNode) {
      const ta = activeEditorRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value;
      
      let newText = text;
      let newCursorStart = start;
      let newCursorEnd = end;

      // Special handling for Horizontal Rule (Block insertion)
      if (prefix.includes('---')) {
          const insert = prefix.startsWith('\n') ? prefix : `\n${prefix}\n`;
          newText = text.substring(0, start) + insert + text.substring(end);
          newCursorStart = start + insert.length;
          newCursorEnd = start + insert.length;
          graph.updateNode(selectedNode.id, { content: newText });
          setTimeout(() => { 
              ta.focus(); 
              ta.setSelectionRange(newCursorStart, newCursorEnd); 
          }, 0);
          return;
      }

      if (suffix) {
        // Inline formatting (Bold, Italic, Strikethrough, etc.)
        const selected = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);
        
        if (selected.startsWith(prefix) && selected.endsWith(suffix)) {
             newText = before + selected.substring(prefix.length, selected.length - suffix.length) + after;
             newCursorStart = start;
             newCursorEnd = end - prefix.length - suffix.length;
        } 
        else if (before.endsWith(prefix) && after.startsWith(suffix)) {
             newText = before.substring(0, before.length - prefix.length) + selected + after.substring(suffix.length);
             newCursorStart = start - prefix.length;
             newCursorEnd = end - prefix.length;
        } else {
             newText = before + prefix + selected + suffix + after;
             newCursorStart = start + prefix.length;
             newCursorEnd = end + prefix.length;
        }
      } else {
        // Block formatting (Heading, List, Quote)
        // Find line boundaries
        let lineStart = text.lastIndexOf('\n', start - 1) + 1;
        let lineEnd = text.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = text.length;
        
        // Regex to match existing list markers or headers
        // Matches: #, ##, -, *, +, 1., >
        const listRegex = /^(\s*(?:#{1,6}|[-*+]|\d+\.|>)\s+)(.*)/;
        
        const selectionContainsNewline = text.substring(start, end).includes('\n');

        if (selectionContainsNewline) {
             // Multi-line toggle
             let chunkEnd = end;
             if (text[chunkEnd - 1] === '\n') chunkEnd--;
             let lastLineEnd = text.indexOf('\n', chunkEnd);
             if (lastLineEnd === -1) lastLineEnd = text.length;

             const chunk = text.substring(lineStart, lastLineEnd);
             const lines = chunk.split('\n');
             
             // Check if all non-empty lines already have the target prefix
             // Note: For '1. ', we check if they have ANY numbered list prefix
             const isNumbered = prefix === '1. ';
             const allHavePrefix = lines.every(line => {
                 if (line.trim().length === 0) return true;
                 if (isNumbered) return /^\s*\d+\.\s+/.test(line);
                 return line.startsWith(prefix);
             });
             
             const newLines = lines.map((line, idx) => {
                 if (line.trim().length === 0) return line;
                 
                 const match = line.match(listRegex);
                 const currentContent = match ? match[2] : line;

                 if (allHavePrefix) {
                     // Remove existing prefix
                     return currentContent;
                 } else {
                     // Add/Replace prefix
                     // For numbered lists, increment the number
                     const effectivePrefix = isNumbered ? `${idx + 1}. ` : prefix;
                     return effectivePrefix + currentContent;
                 }
             });
             
             const newChunk = newLines.join('\n');
             newText = text.substring(0, lineStart) + newChunk + text.substring(lastLineEnd);
             newCursorStart = lineStart;
             newCursorEnd = lineStart + newChunk.length;

        } else {
            // Single line logic
            const lineContent = text.substring(lineStart, lineEnd);
            const match = lineContent.match(listRegex);
            
            if (match) {
                const currentPrefix = match[1];
                const content = match[2];
                
                // Check equality. For numbered lists, match any digit pattern.
                const isCurrentNumbered = /^\s*\d+\.\s+$/.test(currentPrefix);
                const isTargetNumbered = prefix === '1. ';
                
                if (currentPrefix === prefix || (isCurrentNumbered && isTargetNumbered)) {
                    // Exact match (or number match): Toggle Off
                    newText = text.substring(0, lineStart) + content + text.substring(lineEnd);
                    newCursorStart = Math.max(lineStart, start - prefix.length);
                    newCursorEnd = Math.max(lineStart, end - prefix.length);
                } else if (prefix.trim().startsWith('#') && currentPrefix.trim().startsWith('#')) {
                    // Heading Level Change (e.g. # to ##)
                    newText = text.substring(0, lineStart) + prefix + content + text.substring(lineEnd);
                    const diff = prefix.length - currentPrefix.length;
                    newCursorStart = Math.max(lineStart, start + diff);
                    newCursorEnd = Math.max(lineStart, end + diff);
                } else {
                    // Type Change (e.g. List to Quote, or Bullet to Number)
                    newText = text.substring(0, lineStart) + prefix + content + text.substring(lineEnd);
                    const diff = prefix.length - currentPrefix.length;
                    newCursorStart = Math.max(lineStart, start + diff);
                    newCursorEnd = Math.max(lineStart, end + diff);
                }
            } else {
                // Add
                newText = text.substring(0, lineStart) + prefix + lineContent + text.substring(lineEnd);
                newCursorStart = start + prefix.length;
                newCursorEnd = end + prefix.length;
            }
        }
      }

      graph.updateNode(selectedNode.id, { content: newText });
      setTimeout(() => { 
          ta.focus(); 
          ta.setSelectionRange(newCursorStart, newCursorEnd); 
      }, 0);
    }
  };

  const onAddNode = (type: any, title: string, content?: string, image?: string) => {
    const centerX = (-graph.viewport.x + window.innerWidth / 2) / graph.viewport.scale;
    const centerY = (-graph.viewport.y + window.innerHeight / 2) / graph.viewport.scale;
    graph.addNode(type, title, content, image, { x: centerX + (Math.random() - 0.5) * 60, y: centerY + (Math.random() - 0.5) * 60 });
  }

  const selectedCount = graph.nodes.filter(n => n.selected).length;

  const wordCount = useMemo(() => {
    const selectedNodes = graph.nodes.filter(n => n.selected);
    const nodesToCount = selectedNodes.length > 0 ? selectedNodes : graph.nodes;
    
    return nodesToCount.reduce((acc, node) => {
      if (node.type === 'text') {
        return acc + (node.content?.trim().split(/\s+/).filter(Boolean).length || 0);
      } else if (node.type === 'image') {
        return acc + (node.title?.trim().split(/\s+/).filter(Boolean).length || 0);
      }
      return acc;
    }, 0);
  }, [graph.nodes]);

  return (
    <div className={`w-full h-full bg-zinc-100 dark:bg-[#09090b] relative overflow-hidden font-sans transition-colors duration-300 flex flex-col`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && contextMenu.targetId) {
            const reader = new FileReader();
            reader.onload = (ev) => { graph.updateNode(contextMenu.targetId!, { coverImage: ev.target?.result as string }); addToast({ title: 'Replaced', message: 'Image updated', type: 'success' }); };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }} />
      <div className={(isPanDragging || isSelecting) ? 'pointer-events-none' : ''}>
        <TabBar tabs={tabs} activeTabId={activeTabId} onSwitchTab={switchTab} onCloseTab={closeTab} onNewTab={addTab} onRenameTab={updateTabTitle} onReorderTabs={reorderTabs} globalFont={globalBodyFont} />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div className={(isPanDragging || isSelecting) ? 'pointer-events-none' : ''}>
          <Toolbar
            onAddNode={onAddNode} toolMode={isSpacePressed ? ToolMode.PAN : toolMode} setToolMode={setToolMode}
            onZoomIn={() => graph.setViewport({ ...graph.viewport, scale: Math.min(3, graph.viewport.scale * 1.2) })}
            onZoomOut={() => graph.setViewport({ ...graph.viewport, scale: Math.max(0.1, graph.viewport.scale / 1.2) })}
            isAutoSave={isAutoSave} onToggleAutoSave={() => setIsAutoSave(!isAutoSave)}
            onSaveLocal={handleSaveLocal} onLoadLocal={() => fileHandlers.handleLoadLocal(loadData, addToast)}
            onExportFile={() => setShowExportModal(true)} onImportFile={(e) => fileHandlers.handleImportFile(e, loadData, addToast)}
            showGrid={showGrid} snapToGrid={snapToGrid} onToggleGrid={() => setShowGrid(!showGrid)} onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onOpenSettings={() => setShowSettings(true)} onOpenWelcome={() => setShowWelcome(true)}
          >
            {selectedNode ? 
              <SelectedNodeToolbar 
                selectedNode={selectedNode} 
                globalFont={globalBodyFont} 
                globalColor={globalColor} 
                updateSelectedNodes={graph.updateSelectedNodes} 
                insertMarkdown={insertMarkdown} 
              /> : 
              <GlobalToolbar 
                globalHeaderFont={globalHeaderFont} setGlobalHeaderFont={setGlobalHeaderFont}
                globalHeaderFontSize={globalHeaderFontSize} setGlobalHeaderFontSize={setGlobalHeaderFontSize}
                globalHeaderColor={globalHeaderColor} setGlobalHeaderColor={setGlobalHeaderColor}
                globalBodyFont={globalBodyFont} setGlobalBodyFont={setGlobalBodyFont}
                globalBodyFontSize={globalBodyFontSize} setGlobalBodyFontSize={setGlobalBodyFontSize}
                globalColor={globalColor} setGlobalColor={setGlobalColor} 
              />
            }
          </Toolbar>
        </div>
        <Canvas
          nodes={graph.nodes} connections={graph.connections} viewport={graph.viewport}
          toolMode={isSpacePressed ? ToolMode.PAN : toolMode} isSpacePressed={isSpacePressed}
          onViewportChange={graph.setViewport} onUpdateNode={graph.updateNode} onUpdateNodes={graph.updateNodes}
          onDeleteNode={graph.deleteNode} onSelectNode={graph.selectNode} onSelectNodes={graph.selectNodes} onBranchNode={graph.branchFromNode}
          onConnectEnd={graph.connectNodes} onExpandAI={graph.expandNodeAI} onEditNodeAI={graph.editNodeAI} onSetImage={graph.setNodeImage}
          onSelectConnection={graph.selectConnection} onUpdateConnectionLabel={graph.updateConnectionLabel} onDeleteConnection={graph.deleteConnection}
          onReparentNode={graph.reparentNode}
          onBackgroundDoubleClick={(pos) => graph.addNode('text', 'Untitled', '', undefined, pos)}
          registerFormatRef={(ref) => activeEditorRef.current = ref.current}
          showGrid={showGrid} snapToGrid={snapToGrid} 
          globalFont={globalBodyFont} globalHeaderFont={globalHeaderFont} 
          globalHeaderFontSize={globalHeaderFontSize} globalHeaderColor={globalHeaderColor}
          globalBodyFontSize={globalBodyFontSize} globalColor={globalColor} 
          isDarkMode={isDarkMode}
          onPanDraggingChange={setIsPanDragging} onSelectionDraggingChange={setIsSelecting} onContextMenu={handleShowContextMenu}
        />
        <div className={(isPanDragging || isSelecting) ? 'pointer-events-none' : ''}>
          <HUD nodeCount={graph.nodes.length} connectionCount={graph.connections.length} wordCount={wordCount} zoomScale={graph.viewport.scale} lastSaved={lastSaved} globalFont={globalBodyFont} />
        </div>
      </div>
      <div className={(isPanDragging || isSelecting) ? 'pointer-events-none' : ''}>
        {showSettings && <SettingsMenu currentConfig={aiConfig} onSave={(c) => { setAiConfig(c); configureAI(c); localStorage.setItem('iamtired_ai_config', JSON.stringify(c)); localStorage.setItem('iamtired_onboarding_complete', 'true'); addToast({ title: 'Saved', message: 'Config updated', type: 'success' }); }} onClose={() => setShowSettings(false)} globalFont={globalBodyFont} />}
        {showWelcome && <WelcomeModal onConfigure={() => { setShowWelcome(false); setShowSettings(true); }} onContinue={() => { setShowWelcome(false); localStorage.setItem('iamtired_onboarding_complete', 'true'); }} globalFont={globalBodyFont} />}
        {showExportModal && (
            <ExportModal 
                onClose={() => setShowExportModal(false)}
                onExport={(filename) => {
                    fileHandlers.handleExportFile(saveData, filename);
                    setShowExportModal(false);
                    addToast({ title: 'Exported', message: `${filename}.json saved`, type: 'success' });
                }}
            />
        )}
        {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} type={contextMenu.type as any} onClose={hideContextMenu} onAction={handleContextMenuAction} hasMultiSelection={selectedCount > 1} canPaste={canPaste} selectedText={contextMenu.selectedText} nodeType={contextMenuNodeType} />}
      </div>
    </div>
  );
}
export default App;