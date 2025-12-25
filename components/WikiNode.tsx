
import React, { useState, useRef, useEffect, memo } from 'react';
import { WikiNode as WikiNodeType, HandlePosition, ResizeDirection } from '../types';
import { NodeHandle } from './node/NodeHandle';
import { NodeImage } from './node/NodeImage';
import { NodeHeader } from './node/NodeHeader';
import { TextNodeView } from './node/TextNodeView';
import { ImageNodeView } from './node/ImageNodeView';
import { Sparkles, X, ArrowRight, Wand2, Network } from 'lucide-react';

interface WikiNodeProps {
  node: WikiNodeType;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<WikiNodeType>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onDragStart: (e: React.PointerEvent, id: string) => void;
  onResizeStart: (e: React.PointerEvent, id: string, dir: ResizeDirection) => void;
  onBranch: (sourceId: string, text: string) => void;
  onExpandAI: (id: string, title: string, content: string) => void;
  onEditAI: (id: string, content: string, instruction: string) => void;
  onSetImage: (id: string, title: string, mode: 'generate' | 'search') => void;
  onDotDown: (e: React.PointerEvent, nodeId: string, handle: HandlePosition) => void;
  onDotUp: (e: React.PointerEvent, nodeId: string) => void;
  isFormatActive: boolean;
  registerFormatRef: (ref: any) => void;
  globalFont: 'sans' | 'serif' | 'mono';
}

export const WikiNode = memo(({
  node, isSelected, onUpdate, onDelete, onSelect, onDragStart, onResizeStart, onBranch, onExpandAI, onEditAI, onSetImage, onDotDown, onDotUp, isFormatActive, registerFormatRef, globalFont
}: WikiNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isBranching, setIsBranching] = useState(false);
  const [branchQuery, setBranchQuery] = useState("");
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditQuery, setAiEditQuery] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const branchInputRef = useRef<HTMLInputElement>(null);
  const aiEditInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && isFormatActive) registerFormatRef(textareaRef);
  }, [isEditing, isFormatActive, registerFormatRef]);

  // Automatically exit edit/branch mode if node is deselected
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
      setIsBranching(false);
      setIsAiEditing(false);
    }
  }, [isSelected]);

  // Auto-focus branch input
  useEffect(() => {
    if (isBranching) {
       setTimeout(() => branchInputRef.current?.focus(), 50);
    }
  }, [isBranching]);

  // Auto-focus AI edit input
  useEffect(() => {
    if (isAiEditing) {
       setTimeout(() => aiEditInputRef.current?.focus(), 50);
    }
  }, [isAiEditing]);

  const handleEnterEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    onSelect(node.id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleBranchClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const text = window.getSelection()?.toString() || "";
    setBranchQuery(text);
    setIsBranching(true);
  };

  const submitBranch = () => {
    if (!branchQuery.trim()) return;
    onBranch(node.id, branchQuery);
    setIsBranching(false);
    setBranchQuery("");
  };

  const submitAiEdit = () => {
    if (!aiEditQuery.trim()) return;
    onEditAI(node.id, node.content, aiEditQuery);
    setIsAiEditing(false);
    setAiEditQuery("");
  };

  // Resize Handles Component
  const ResizeHandles = () => {
    const handleBase = "absolute bg-white border border-blue-600 rounded-[2px] z-50 shadow-sm transition-transform hover:scale-125";
    const cornerSize = "w-3.5 h-3.5";
    const edgeSize = "absolute z-40 opacity-0 hover:opacity-10"; // Invisible hit targets

    return (
      <>
        {/* Edges (Invisible larger hit areas) */}
        <div className="absolute -top-1.5 left-0 right-0 h-4 cursor-n-resize z-30" onPointerDown={(e) => onResizeStart(e, node.id, 'n')} />
        <div className="absolute -bottom-1.5 left-0 right-0 h-4 cursor-s-resize z-30" onPointerDown={(e) => onResizeStart(e, node.id, 's')} />
        <div className="absolute top-0 -left-1.5 bottom-0 w-4 cursor-w-resize z-30" onPointerDown={(e) => onResizeStart(e, node.id, 'w')} />
        <div className="absolute top-0 -right-1.5 bottom-0 w-4 cursor-e-resize z-30" onPointerDown={(e) => onResizeStart(e, node.id, 'e')} />
        
        {/* Corners (Visible handles) */}
        {/* NW */}
        <div className={`${handleBase} ${cornerSize} cursor-nw-resize`} style={{ top: -6, left: -6 }} onPointerDown={(e) => onResizeStart(e, node.id, 'nw')} />
        {/* NE */}
        <div className={`${handleBase} ${cornerSize} cursor-ne-resize`} style={{ top: -6, right: -6 }} onPointerDown={(e) => onResizeStart(e, node.id, 'ne')} />
        {/* SW */}
        <div className={`${handleBase} ${cornerSize} cursor-sw-resize`} style={{ bottom: -6, left: -6 }} onPointerDown={(e) => onResizeStart(e, node.id, 'sw')} />
        {/* SE */}
        <div className={`${handleBase} ${cornerSize} cursor-se-resize`} style={{ bottom: -6, right: -6 }} onPointerDown={(e) => onResizeStart(e, node.id, 'se')} />
        
        {/* Visual Borders for selection (on top of content) */}
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30 z-20 rounded-sm"></div>
      </>
    );
  };

  const commonClasses = `absolute flex flex-col glass-panel transition-shadow duration-200 group overflow-visible ${isSelected ? 'shadow-xl z-30' : 'hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-xl z-10'}`;
  
  // When selected, we remove the default border and let ResizeHandles draw the selection border
  const borderClass = isSelected ? 'border-transparent' : 'border-zinc-200 dark:border-white/10';

  if (node.type === 'image') {
    return (
      <div className={`${commonClasses} ${borderClass}`}
        style={{ left: node.position.x, top: node.position.y, width: node.width, height: node.height }}
        onPointerDown={() => { if (!isEditing) onSelect(node.id); }} onPointerUp={(e) => onDotUp(e, node.id)}
        onDoubleClick={(e) => e.stopPropagation()}
      >
         {(['top', 'right', 'bottom', 'left'] as HandlePosition[]).map(pos => (
            <NodeHandle key={pos} position={pos} onDown={(e) => onDotDown(e, node.id, pos)} onUp={(e) => onDotUp(e, node.id)} />
        ))}
        {isSelected && <ResizeHandles />}
        
        <ImageNodeView 
            image={node.coverImage} title={node.title} fit={node.imageFit} position={node.imagePosition}
            onDelete={() => onDelete(node.id)} onTitleChange={(t) => onUpdate(node.id, { title: t })}
            onDragStart={(e) => { onSelect(node.id); onDragStart(e, node.id); }}
            onUpdateSettings={(f, p) => onUpdate(node.id, { imageFit: f, imagePosition: p })}
        />
      </div>
    );
  }

  return (
    <div className={`${commonClasses} ${borderClass}`}
      style={{ left: node.position.x, top: node.position.y, width: node.width, height: node.height }}
      onPointerDown={() => { if (!isEditing) onSelect(node.id); }} onPointerUp={(e) => onDotUp(e, node.id)}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {(['top', 'right', 'bottom', 'left'] as HandlePosition[]).map(pos => (
        <NodeHandle key={pos} position={pos} onDown={(e) => onDotDown(e, node.id, pos)} onUp={(e) => onDotUp(e, node.id)} />
      ))}
      {isSelected && <ResizeHandles />}

      {node.coverImage && (
        <NodeImage 
          url={node.coverImage} title={node.title} height={node.imageHeight || 160} fit={node.imageFit || 'cover'} position={node.imagePosition}
          onUpdateImage={(url) => onUpdate(node.id, { coverImage: url })}
          onUpdateSettings={(h, f, p) => onUpdate(node.id, { imageHeight: h, imageFit: f, imagePosition: p })}
        />
      )}

      <NodeHeader 
        title={node.title} isEditing={isEditing} hasImage={!!node.coverImage}
        onUpdateTitle={(t) => onUpdate(node.id, { title: t })}
        onEnterEdit={handleEnterEdit} onExitEdit={() => setIsEditing(false)}
        onDragStart={(e) => onDragStart(e, node.id)} onDelete={() => onDelete(node.id)} onBranch={handleBranchClick}
      />

      {isBranching && (
        <div className="absolute top-14 left-2 right-2 z-50 animate-in fade-in zoom-in-95 duration-200" onPointerDown={(e) => e.stopPropagation()}>
             <div className="glass-panel p-2 flex flex-col gap-2 shadow-2xl border border-blue-500/30">
                 <div className="flex items-center justify-between px-1">
                     <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1"><Network size={10}/> AI Branch</span>
                     <button onClick={() => setIsBranching(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"><X size={12}/></button>
                 </div>
                 <p className="text-[9px] text-zinc-500 dark:text-zinc-400 px-1 leading-snug">
                     Creates a new connected node using this card as context.
                 </p>
                 <div className="flex gap-1">
                     <input
                        ref={branchInputRef}
                        className="flex-1 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        placeholder="Topic to expand on..."
                        value={branchQuery}
                        onChange={(e) => setBranchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitBranch()}
                     />
                     <button onClick={submitBranch} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded transition-colors" title="Generate Branch">
                         <ArrowRight size={14} />
                     </button>
                 </div>
             </div>
        </div>
      )}

      {isAiEditing && (
        <div className="absolute bottom-10 left-2 right-2 z-50 animate-in fade-in zoom-in-95 duration-200" onPointerDown={(e) => e.stopPropagation()}>
             <div className="glass-panel p-2 flex flex-col gap-2 shadow-2xl border border-blue-500/30">
                 <div className="flex items-center justify-between px-1">
                     <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1"><Wand2 size={10}/> AI Edit</span>
                     <button onClick={() => setIsAiEditing(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"><X size={12}/></button>
                 </div>
                 <div className="flex gap-1">
                     <input
                        ref={aiEditInputRef}
                        className="flex-1 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        placeholder="Instructions (e.g., 'Concise', 'Fix grammar')..."
                        value={aiEditQuery}
                        onChange={(e) => setAiEditQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitAiEdit()}
                     />
                     <button onClick={submitAiEdit} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded transition-colors" title="Apply AI Edit">
                         <ArrowRight size={14} />
                     </button>
                 </div>
             </div>
        </div>
      )}

      <TextNodeView 
        ref={textareaRef} content={node.content} isEditing={isEditing} isGenerating={node.isGenerating} 
        fontStyle={node.fontStyle} globalFont={globalFont}
        onChange={(e) => onUpdate(node.id, { content: e.target.value })}
        onDoubleClick={handleEnterEdit} onExpand={() => onExpandAI(node.id, node.title, node.content)}
        onEditAI={() => setIsAiEditing(true)}
        onImageSearch={() => onSetImage(node.id, node.title, 'search')} onImageGen={() => onSetImage(node.id, node.title, 'generate')}
      />
    </div>
  );
}, (prev, next) => prev.node === next.node && prev.isSelected === next.isSelected && prev.isFormatActive === next.isFormatActive && prev.globalFont === next.globalFont);
