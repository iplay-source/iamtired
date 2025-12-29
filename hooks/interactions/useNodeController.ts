import React, { useRef, useState, useCallback } from 'react';
import { WikiNode, Position, ResizeDirection, ToolMode } from '../../types';
import { snap } from '../../utils/gridUtils';
import { getAbsolutePosition } from '../../utils/nodeUtils';

const MIN_W = 250;
const MIN_H = 150;

interface UseNodeControllerProps {
    nodes: WikiNode[];
    viewport: { scale: number };
    snapToGrid: boolean;
    onUpdatePositions: (updates: { id: string, pos: Position }[]) => void;
    onUpdateSize: (id: string, w: number, h: number) => void;
    onUpdatePosition: (id: string, pos: Position) => void;
    onSelectNode: (id: string) => void;
    onSelectNodes: (ids: string[]) => void;
    onReparentNode: (nodeId: string, newParentId: string | undefined) => void;
}

// Helper to calculate effective z-index matching WikiNode logic
// Children effectively sit on top of parents (ParentZ + 1 at minimum)
const getEffectiveZ = (nodeId: string, allNodes: WikiNode[]): number => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return 0;
    
    let parentEffectiveZ = -Infinity;
    if (node.parentId) {
        parentEffectiveZ = getEffectiveZ(node.parentId, allNodes);
    }
    
    const storedZ = node.zIndex ?? 1;
    // Logic must match WikiNode.tsx: effective = max(stored, parent + 1)
    // If parent doesn't exist, parentEffectiveZ is -Infinity, so max is storedZ.
    return Math.max(storedZ, parentEffectiveZ !== -Infinity ? parentEffectiveZ + 1 : -Infinity);
};

export const useNodeController = ({
    nodes, viewport, snapToGrid, onUpdatePositions, onUpdateSize, onUpdatePosition, onSelectNode, onSelectNodes, onReparentNode
}: UseNodeControllerProps) => {
    const isDraggingNode = useRef(false);
    const isResizingNode = useRef(false);
    const draggedNodeId = useRef<string | null>(null);
    const resizeDirection = useRef<ResizeDirection>('se');
    const draggedNodesInitialPositions = useRef<{ id: string, pos: Position }[]>([]);
    const currentDragValues = useRef<{ x: number, y: number, w: number, h: number } | null>(null);
    const [, setTick] = useState(0); // Force render for cursor updates
    
    /**
     * CRITICAL: activeNodeId State
     * This state is used to lock interactions to a specific node during drag/resize operations.
     * When this is set, the Canvas component sets `isInteractive={false}` on all other nodes.
     * This ensures the drag operation is not interrupted if the cursor hovers over other UI elements.
     * DO NOT REMOVE or alter this behavior without ensuring global UI locking is preserved.
     */
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

    const startNodeDrag = (nodeId: string, node: WikiNode, e?: React.PointerEvent) => {
        isDraggingNode.current = true;
        draggedNodeId.current = nodeId;
        setActiveNodeId(nodeId);
        
        // IMPORTANT: Pointer Capture
        // setPointerCapture ensures that drag events continue to be delivered to this element
        // even if the cursor moves outside the browser window or over other DOM elements (like panels).
        // This prevents the drag from "breaking" abruptly.
        if (e) {
            e.stopPropagation();
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
        }
        
        const isCmdOrShift = e ? (e.metaKey || e.ctrlKey || e.shiftKey) : false;
        const selectedNodes = nodes.filter(n => n.selected);

        if (isCmdOrShift) {
            const isAlreadySelected = selectedNodes.some(n => n.id === nodeId);
            if (!isAlreadySelected) {
                draggedNodesInitialPositions.current = [...selectedNodes.map(n => ({ id: n.id, pos: { ...n.position } })), { id: nodeId, pos: { ...node.position } }];
            } else {
                draggedNodesInitialPositions.current = selectedNodes.map(n => ({ id: n.id, pos: { ...n.position } }));
            }
        } else {
            if (selectedNodes.length > 1 && selectedNodes.some(n => n.id === nodeId)) {
                draggedNodesInitialPositions.current = selectedNodes.map(n => ({ id: n.id, pos: { ...n.position } }));
            } else {
                if (!node.selected) onSelectNode(nodeId);
                draggedNodesInitialPositions.current = [{ id: nodeId, pos: { ...node.position } }];
            }
        }
        currentDragValues.current = { x: node.position.x, y: node.position.y, w: node.width, h: node.height };
    };

    const startResize = (nodeId: string, node: WikiNode, dir: ResizeDirection, e?: React.PointerEvent) => {
        isResizingNode.current = true; draggedNodeId.current = nodeId; resizeDirection.current = dir;
        currentDragValues.current = { x: node.position.x, y: node.position.y, w: node.width, h: node.height };
        setActiveNodeId(nodeId);
        
        // IMPORTANT: Pointer Capture
        // Essential for smooth resizing when the cursor moves faster than the element or goes off-screen.
        if (e) {
            e.stopPropagation();
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
        }

        setTick(t => t + 1);
    };

    const handleMove = (deltaX: number, deltaY: number) => {
        if (isDraggingNode.current && draggedNodeId.current) {
            const selectedIds = new Set(draggedNodesInitialPositions.current.map(p => p.id));
            const updates = draggedNodesInitialPositions.current.map(initial => {
                const node = nodes.find(n => n.id === initial.id);
                if (!node) return null;
                // Guardrail: Don't move child if parent is also selected and moving (group moves all)
                if (node.parentId && selectedIds.has(node.parentId)) return null;
                
                return { id: node.id, pos: { x: node.position.x + deltaX / viewport.scale, y: node.position.y + deltaY / viewport.scale } };
            }).filter(Boolean) as { id: string, pos: Position }[];
            
            if (updates.length > 0) {
                onUpdatePositions(updates);
                const primaryNode = nodes.find(n => n.id === draggedNodeId.current);
                if (primaryNode) currentDragValues.current = { x: primaryNode.position.x, y: primaryNode.position.y, w: primaryNode.width, h: primaryNode.height };
            }
        } else if (isResizingNode.current && draggedNodeId.current && currentDragValues.current) {
            const base = currentDragValues.current;
            let newX = base.x, newY = base.y, newW = base.w, newH = base.h;
            const dX = deltaX / viewport.scale, dY = deltaY / viewport.scale;
            const dir = resizeDirection.current;

            if (dir.includes('e')) newW = Math.max(MIN_W, base.w + dX);
            else if (dir.includes('w')) { const possibleW = Math.max(MIN_W, base.w - dX); if (possibleW !== MIN_W || base.w > MIN_W) { newX = base.x + (base.w - possibleW); newW = possibleW; } }
            if (dir.includes('s')) newH = Math.max(MIN_H, base.h + dY);
            else if (dir.includes('n')) { const possibleH = Math.max(MIN_H, base.h - dY); if (possibleH !== MIN_H || base.h > MIN_H) { newY = base.y + (base.h - possibleH); newH = possibleH; } }

            const diffX = newX - base.x, diffY = newY - base.y;
            currentDragValues.current = { x: newX, y: newY, w: newW, h: newH };
            
            const resizingNode = nodes.find(n => n.id === draggedNodeId.current);
            if (resizingNode?.type === 'group' && (diffX !== 0 || diffY !== 0)) {
                // If dragging Top/Left of a group, we must shift children opposite way to keep them visually stationary
                const childNodes = nodes.filter(n => n.parentId === draggedNodeId.current);
                const updates = childNodes.map(c => ({ id: c.id, pos: { x: c.position.x - diffX, y: c.position.y - diffY } }));
                if (updates.length > 0) onUpdatePositions(updates);
            }
            onUpdateSize(draggedNodeId.current, newW, newH);
            if (newX !== base.x || newY !== base.y) onUpdatePosition(draggedNodeId.current, { x: newX, y: newY });
        }
    };

    const handleUp = () => {
        if (snapToGrid && currentDragValues.current && draggedNodeId.current) {
            if (isDraggingNode.current) {
                const snappedUpdates = draggedNodesInitialPositions.current.map(initial => {
                    const node = nodes.find(n => n.id === initial.id);
                    if (!node) return null;
                    return { id: node.id, pos: { x: snap(node.position.x), y: snap(node.position.y) } };
                }).filter(Boolean) as { id: string, pos: Position }[];
                if (snappedUpdates.length > 0) onUpdatePositions(snappedUpdates);
            } else if (isResizingNode.current) {
                const newW = snap(currentDragValues.current.w), newH = snap(currentDragValues.current.h);
                const newX = snap(currentDragValues.current.x), newY = snap(currentDragValues.current.y);
                const diffX = newX - currentDragValues.current.x, diffY = newY - currentDragValues.current.y;
                if (diffX !== 0 || diffY !== 0) {
                    const resizingNode = nodes.find(n => n.id === draggedNodeId.current);
                    if (resizingNode?.type === 'group') {
                        const childNodes = nodes.filter(n => n.parentId === draggedNodeId.current);
                        const childUpdates = childNodes.map(c => ({ id: c.id, pos: { x: c.position.x - diffX, y: c.position.y - diffY } }));
                        if (childUpdates.length > 0) onUpdatePositions(childUpdates);
                    }
                }
                onUpdateSize(draggedNodeId.current, newW, newH);
                onUpdatePosition(draggedNodeId.current, { x: newX, y: newY });
            }
        }

        // Intelligent Reparenting Logic
        if (isDraggingNode.current && draggedNodesInitialPositions.current.length > 0) {
            const draggedNodes = draggedNodesInitialPositions.current
                .map(p => nodes.find(n => n.id === p.id))
                .filter((n): n is WikiNode => !!n);

            draggedNodes.forEach(node => {
                const absPos = getAbsolutePosition(node, nodes);
                const nodeCenter = { x: absPos.x + node.width / 2, y: absPos.y + node.height / 2 };
                
                // Find all valid candidates that contain the node center
                const candidates = nodes.filter(g => {
                    if (g.type !== 'group') return false;
                    if (g.id === node.id) return false;
                    
                    // Cycle check: g cannot be a descendant of node
                    let ancestor = g;
                    let isCycle = false;
                    while(ancestor.parentId) {
                        if (ancestor.parentId === node.id) { isCycle = true; break; }
                        const p = nodes.find(n => n.id === ancestor.parentId);
                        if (!p) break;
                        ancestor = p;
                    }
                    if (isCycle) return false;

                    const gAbs = getAbsolutePosition(g, nodes);
                    return (
                        nodeCenter.x >= gAbs.x &&
                        nodeCenter.x <= gAbs.x + g.width &&
                        nodeCenter.y >= gAbs.y &&
                        nodeCenter.y <= gAbs.y + g.height
                    );
                });

                if (candidates.length > 0) {
                    // Sort candidates by effective Z-Index descending (top-most visual group first)
                    // This prioritizes nested groups (children) over parents if dropping on both
                    candidates.sort((a, b) => getEffectiveZ(b.id, nodes) - getEffectiveZ(a.id, nodes));
                    
                    const bestParent = candidates[0];
                    if (node.parentId !== bestParent.id) {
                        onReparentNode(node.id, bestParent.id);
                    }
                } else if (node.parentId) {
                    // If no candidates found but node currently has a parent, it means dragged out
                    onReparentNode(node.id, undefined);
                }
            });
        }

        if (isResizingNode.current) { isResizingNode.current = false; setTick(t => t + 1); }
        isDraggingNode.current = false; draggedNodeId.current = null; currentDragValues.current = null;
        
        // Reset active node, unlocking global interactions
        setActiveNodeId(null);
    };

    return { isDraggingNode, isResizingNode, resizeDirection, startNodeDrag, startResize, handleMove, handleUp, activeNodeId };
};