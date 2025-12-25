
import React, { useRef, useState, useCallback } from 'react';
import { WikiNode, Connection, Viewport, Position, ToolMode, HandlePosition, ResizeDirection } from '../types';
import { WikiNode as WikiNodeComponent } from './WikiNode';
import { ConnectionLayer } from './ConnectionLayer';

interface CanvasProps {
  nodes: WikiNode[];
  connections: Connection[];
  viewport: Viewport;
  toolMode: ToolMode;
  isSpacePressed: boolean;
  onViewportChange: (newViewport: Viewport) => void;
  onUpdateContent: (id: string, content: string, title?: string) => void;
  onUpdatePosition: (id: string, pos: Position) => void;
  onUpdateSize: (id: string, w: number, h: number) => void;
  onUpdateImage: (id: string, url: string | undefined) => void;
  onUpdateImageSettings: (id: string, height: number, fit: 'cover' | 'contain', position: string) => void;
  onDeleteNode: (id: string) => void;
  onSelectNode: (id: string) => void;
  onBranchNode: (id: string, text: string) => void;
  onConnectEnd: (sourceId: string, targetId: string) => void;
  onExpandAI: (id: string, title: string, content: string) => void;
  onEditNodeAI: (id: string, content: string, instruction: string) => void;
  onSetImage: (id: string, title: string, mode: 'generate' | 'search') => void;
  onSelectConnection: (id: string) => void;
  onUpdateConnectionLabel: (id: string, label: string) => void;
  onDeleteConnection: (id: string) => void;
  onBackgroundDoubleClick: (pos: Position) => void;
  registerFormatRef: (ref: any) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  globalFont: 'sans' | 'serif' | 'mono';
  isDarkMode: boolean;
}

const SNAP_SIZE = 20;

export const Canvas: React.FC<CanvasProps> = ({
  nodes, connections, viewport, toolMode, isSpacePressed,
  onViewportChange, onUpdateContent, onUpdatePosition, onUpdateSize, onUpdateImage, onUpdateImageSettings,
  onDeleteNode, onSelectNode, onBranchNode, onConnectEnd, onExpandAI, onEditNodeAI, onSetImage,
  onSelectConnection, onUpdateConnectionLabel, onDeleteConnection, onBackgroundDoubleClick, registerFormatRef,
  showGrid, snapToGrid, globalFont, isDarkMode
}) => {
  const isDraggingCanvas = useRef(false);
  const isDraggingNode = useRef(false);
  const isResizingNode = useRef(false);
  const resizeDirection = useRef<ResizeDirection>('se'); // Track direction
  const isDraggingConnection = useRef(false);
  const [isConnectionDraggingState, setIsConnectionDraggingState] = useState(false); // State for UI updates (cursor/selection)
  
  const draggedNodeId = useRef<string | null>(null);
  const connectionStartId = useRef<string | null>(null);
  const connectionStartHandle = useRef<HandlePosition | null>(null);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  
  // Track current raw position/size during drag to snap on release
  const currentDragValues = useRef<{ x: number, y: number, w: number, h: number } | null>(null);

  const [tempConnection, setTempConnection] = useState<{start: Position, end: Position} | null>(null);
  // Force update to reflect cursor changes if needed (though we mostly use styles)
  const [, setTick] = useState(0); 

  const getHandlePosition = (nodeId: string, handle: HandlePosition): Position => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const { x, y } = node.position;
    switch (handle) {
        case 'top': return { x: x + node.width / 2, y: y };
        case 'bottom': return { x: x + node.width / 2, y: y + node.height };
        case 'left': return { x: x, y: y + node.height / 2 };
        case 'right': return { x: x + node.width, y: y + node.height / 2 };
        default: return { x: x + node.width / 2, y: y + node.height / 2 };
    }
  };

  const snap = (val: number) => {
    return Math.round(val / SNAP_SIZE) * SNAP_SIZE;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (toolMode === ToolMode.PAN || isSpacePressed || e.button === 1) {
      isDraggingCanvas.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; e.preventDefault();
    } else if (toolMode === ToolMode.SELECT) {
        onSelectNode(''); onSelectConnection('');
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the canvas background
    // (WikiNode handles its own double click stopPropagation)
    const x = (e.clientX - viewport.x) / viewport.scale;
    const y = (e.clientY - viewport.y) / viewport.scale;
    onBackgroundDoubleClick({ x, y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (isDraggingCanvas.current) {
      onViewportChange({ ...viewport, x: viewport.x + deltaX, y: viewport.y + deltaY });
    } else if (isDraggingNode.current && draggedNodeId.current) {
        const node = nodes.find(n => n.id === draggedNodeId.current);
        if (node) {
            // Free movement during drag
            const newX = node.position.x + deltaX / viewport.scale;
            const newY = node.position.y + deltaY / viewport.scale;
            currentDragValues.current = { x: newX, y: newY, w: node.width, h: node.height };
            onUpdatePosition(draggedNodeId.current, { x: newX, y: newY });
        }
    } else if (isResizingNode.current && draggedNodeId.current && currentDragValues.current) {
        const node = nodes.find(n => n.id === draggedNodeId.current);
        // Use currentDragValues as the base, not the node's snapped state, to allow smooth resizing
        const base = currentDragValues.current;
        const scale = viewport.scale;
        
        let newX = base.x;
        let newY = base.y;
        let newW = base.w;
        let newH = base.h;

        const dX = deltaX / scale;
        const dY = deltaY / scale;
        const dir = resizeDirection.current;

        // Min dimensions
        const MIN_W = 250;
        const MIN_H = 150;

        // Calculate new Width
        if (dir.includes('e')) {
            newW = Math.max(MIN_W, base.w + dX);
        } else if (dir.includes('w')) {
            const possibleW = Math.max(MIN_W, base.w - dX);
            // Only move X if we haven't hit min width
            if (possibleW !== MIN_W || base.w > MIN_W) {
                newX = base.x + (base.w - possibleW);
                newW = possibleW;
            }
        }

        // Calculate new Height
        if (dir.includes('s')) {
            newH = Math.max(MIN_H, base.h + dY);
        } else if (dir.includes('n')) {
            const possibleH = Math.max(MIN_H, base.h - dY);
            if (possibleH !== MIN_H || base.h > MIN_H) {
                newY = base.y + (base.h - possibleH);
                newH = possibleH;
            }
        }

        currentDragValues.current = { x: newX, y: newY, w: newW, h: newH };
        
        // Live update (smooth)
        onUpdateSize(draggedNodeId.current, newW, newH);
        if (newX !== base.x || newY !== base.y) {
            onUpdatePosition(draggedNodeId.current, { x: newX, y: newY });
        }

    } else if (isDraggingConnection.current && connectionStartId.current) {
        const mouseCanvasX = (e.clientX - viewport.x) / viewport.scale;
        const mouseCanvasY = (e.clientY - viewport.y) / viewport.scale;
        const startPos = connectionStartHandle.current ? getHandlePosition(connectionStartId.current, connectionStartHandle.current) : {x:0,y:0};
        setTempConnection({ start: startPos, end: { x: mouseCanvasX, y: mouseCanvasY } });
    }
  };

  const handlePointerUp = () => {
    isDraggingCanvas.current = false; 

    // Final Snap on Release
    if (snapToGrid && currentDragValues.current && draggedNodeId.current) {
         if (isDraggingNode.current) {
            onUpdatePosition(draggedNodeId.current, { 
                x: snap(currentDragValues.current.x), 
                y: snap(currentDragValues.current.y) 
            });
         } else if (isResizingNode.current) {
             const finalX = snap(currentDragValues.current.x);
             const finalY = snap(currentDragValues.current.y);
             const finalW = snap(currentDragValues.current.w);
             const finalH = snap(currentDragValues.current.h);
             
             onUpdateSize(draggedNodeId.current, finalW, finalH);
             onUpdatePosition(draggedNodeId.current, { x: finalX, y: finalY });
         }
    }

    if (isResizingNode.current) {
        isResizingNode.current = false;
        setTick(t => t + 1); // Trigger re-render to reset cursor
    }
    
    isDraggingNode.current = false; 
    draggedNodeId.current = null;
    currentDragValues.current = null;

    if (isDraggingConnection.current) {
        isDraggingConnection.current = false; 
        setTempConnection(null); 
        connectionStartId.current = null;
        setIsConnectionDraggingState(false); // Reset UI state
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
        e.preventDefault();
        // 5% change per step (assuming ~100 deltaY per step on mouse wheel)
        // 0.05 / 100 = 0.0005
        const ZOOM_SPEED = 0.0005; 
        const newScale = Math.min(Math.max(viewport.scale * (1 - e.deltaY * ZOOM_SPEED), 0.1), 5);
        
        onViewportChange({ ...viewport, scale: newScale });
    } else {
        onViewportChange({ ...viewport, x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
    }
  };

  let cursor = 'default';
  if (isDraggingCanvas.current || isSpacePressed || toolMode === ToolMode.PAN) cursor = 'grab';
  if (isDraggingNode.current) cursor = 'grabbing';
  if (isDraggingConnection.current) cursor = 'crosshair';
  if (isResizingNode.current) {
      switch(resizeDirection.current) {
          case 'n': cursor = 'n-resize'; break;
          case 's': cursor = 's-resize'; break;
          case 'e': cursor = 'e-resize'; break;
          case 'w': cursor = 'w-resize'; break;
          case 'ne': cursor = 'ne-resize'; break;
          case 'nw': cursor = 'nw-resize'; break;
          case 'se': cursor = 'se-resize'; break;
          case 'sw': cursor = 'sw-resize'; break;
      }
  }

  // Adaptive Grid Visualization
  const bgSize = SNAP_SIZE * viewport.scale;
  const majorBgSize = (SNAP_SIZE * 5) * viewport.scale;
  const minorAlpha = showGrid ? Math.max(0, Math.min(1, (viewport.scale - 0.5) * 4)) * (isDarkMode ? 0.05 : 0.08) : 0;
  const majorAlpha = showGrid ? (isDarkMode ? 0.08 : 0.12) : 0; 
  const gridColor = isDarkMode ? '161, 161, 170' : '82, 82, 91'; // Zinc 400 vs Zinc 600

  const gridBackground = showGrid ? {
    backgroundImage: `
        linear-gradient(to right, rgba(${gridColor}, ${majorAlpha}) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(${gridColor}, ${majorAlpha}) 1px, transparent 1px),
        linear-gradient(to right, rgba(${gridColor}, ${minorAlpha}) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(${gridColor}, ${minorAlpha}) 1px, transparent 1px)
    `,
    backgroundSize: `${majorBgSize}px ${majorBgSize}px, ${majorBgSize}px ${majorBgSize}px, ${bgSize}px ${bgSize}px, ${bgSize}px ${bgSize}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`
  } : {};

  return (
    <div 
      className={`w-full h-full bg-zinc-100 dark:bg-[#09090b] overflow-hidden relative touch-none transition-colors duration-300 ${isConnectionDraggingState ? 'select-none' : ''}`}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{ cursor, ...gridBackground }}
    >
      <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'absolute', willChange: 'transform' }}>
        <ConnectionLayer 
            connections={connections} nodes={nodes} tempConnection={tempConnection} 
            onSelectConnection={onSelectConnection} onUpdateConnectionLabel={onUpdateConnectionLabel} onDeleteConnection={onDeleteConnection}
        />
        {nodes.map((node) => (
          <WikiNodeComponent
            key={node.id} node={node} isSelected={!!node.selected}
            onUpdate={(id, updates) => {
                if(updates.content !== undefined) onUpdateContent(id, updates.content, updates.title);
                else if(updates.title !== undefined) onUpdateContent(id, node.content, updates.title);
                else if(updates.coverImage !== undefined) onUpdateImage(id, updates.coverImage);
                else if(updates.imageHeight !== undefined || updates.imageFit !== undefined || updates.imagePosition !== undefined) {
                    onUpdateImageSettings(id, updates.imageHeight || node.imageHeight || 160, updates.imageFit || node.imageFit || 'cover', updates.imagePosition || node.imagePosition || 'center');
                }
            }}
            onDelete={onDeleteNode} onSelect={onSelectNode}
            onDragStart={(e, id) => { if(isSpacePressed) return; e.stopPropagation(); isDraggingNode.current=true; draggedNodeId.current=id; onSelectNode(id); currentDragValues.current = {x:node.position.x, y:node.position.y, w:node.width, h:node.height} }}
            onExpandAI={onExpandAI} onEditAI={onEditNodeAI} onSetImage={onSetImage}
            onResizeStart={(e, id, dir) => { 
                e.stopPropagation(); 
                isResizingNode.current=true; 
                draggedNodeId.current=id; 
                resizeDirection.current = dir;
                currentDragValues.current = {x:node.position.x, y:node.position.y, w:node.width, h:node.height};
                setTick(t => t + 1); // Force re-render to update cursor
            }}
            onBranch={onBranchNode} 
            onDotDown={(e, nid, h) => { 
                e.preventDefault(); // Prevent text selection initiation
                e.stopPropagation(); 
                isDraggingConnection.current=true; 
                connectionStartId.current=nid; 
                connectionStartHandle.current=h; 
                setIsConnectionDraggingState(true); // Update UI state
            }} 
            onDotUp={(e, tid) => { if (isDraggingConnection.current && connectionStartId.current && connectionStartId.current !== tid) onConnectEnd(connectionStartId.current, tid); }}
            isFormatActive={node.selected === true} registerFormatRef={registerFormatRef}
            globalFont={globalFont}
          />
        ))}
      </div>
    </div>
  );
};
