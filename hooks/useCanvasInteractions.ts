import React, { useRef, useCallback } from 'react';
import { Viewport, Position, ToolMode, HandlePosition, WikiNode } from '../types';
import { getHandlePosition, getClosestHandle } from '../utils/connectionUtils';
import { getAbsolutePosition } from '../utils/nodeUtils';
import { useNodeController } from './interactions/useNodeController';
import { useConnectionController } from './interactions/useConnectionController';
import { useViewController } from './interactions/useViewController';

interface UseCanvasInteractionsProps {
    nodes: WikiNode[];
    viewport: Viewport;
    snapToGrid: boolean;
    toolMode: ToolMode;
    isSpacePressed: boolean;
    onViewportChange: (v: Viewport) => void;
    onUpdatePosition: (id: string, pos: Position) => void;
    onUpdatePositions: (updates: { id: string, pos: Position }[]) => void;
    onUpdateSize: (id: string, w: number, h: number) => void;
    onSelectNode: (id: string) => void;
    onSelectNodes: (ids: string[]) => void;
    onSelectConnection: (id: string) => void;
    onConnectEnd: (sourceId: string, targetId: string, sourceHandle: HandlePosition, targetHandle: HandlePosition) => void;
    onReparentNode: (nodeId: string, newParentId: string | undefined) => void;
    onPanDraggingChange?: (isDragging: boolean) => void;
    onSelectionDraggingChange?: (isSelecting: boolean) => void;
}

export const useCanvasInteractions = (props: UseCanvasInteractionsProps) => {
    const { nodes, viewport, toolMode, isSpacePressed } = props;
    const lastMousePos = useRef<Position>({ x: 0, y: 0 });

    const nodeCtrl = useNodeController(props);
    const connCtrl = useConnectionController(props);
    const viewCtrl = useViewController(props);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        lastMousePos.current = { x: mouseX, y: mouseY };

        if (viewCtrl.handlePointerDown(e, mouseX, mouseY)) return;

        if (toolMode === ToolMode.SELECT && viewCtrl.multiSelectBounds) {
            const mx = (mouseX - viewport.x) / viewport.scale;
            const my = (mouseY - viewport.y) / viewport.scale;
            const mb = viewCtrl.multiSelectBounds;
            if (mx >= mb.x && mx <= mb.x + mb.width && my >= mb.y && my <= mb.y + mb.height) {
                const isOverNode = nodes.some(n => {
                    const abs = getAbsolutePosition(n, nodes);
                    return mx >= abs.x && mx <= abs.x + n.width && my >= abs.y && my <= abs.y + n.height;
                });
                if (!isOverNode) {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    // Since multi-selection drag is initiated on the canvas, pass the event to set capture on canvas
                    nodeCtrl.startNodeDrag(nodes.filter(n => n.selected)[0].id, nodes.filter(n => n.selected)[0], e);
                }
            }
        }
    }, [toolMode, nodes, viewport, viewCtrl, nodeCtrl]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const deltaX = mouseX - lastMousePos.current.x;
        const deltaY = mouseY - lastMousePos.current.y;
        lastMousePos.current = { x: mouseX, y: mouseY };

        if (viewCtrl.isDraggingCanvas.current || viewCtrl.selectionBox) {
            viewCtrl.handleMove(deltaX, deltaY, mouseX, mouseY);
        } else if (nodeCtrl.isDraggingNode.current || nodeCtrl.isResizingNode.current) {
            nodeCtrl.handleMove(deltaX, deltaY);
        } else if (connCtrl.isDraggingConnection.current || connCtrl.isClickConnectionActive) {
            connCtrl.handleMove(mouseX, mouseY);
        }
    }, [viewCtrl, nodeCtrl, connCtrl]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        // IMPORTANT: Pointer Capture Cleanup
        // Release capture if held by canvas to reset input state.
        if (e.pointerId !== undefined && (e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
        
        // Release capture if held by a child node or handle (event target)
        // This is crucial for node dragging/resizing where the node element itself holds capture.
        if (e.pointerId !== undefined && e.target instanceof Element && e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId);
        }

        viewCtrl.handleUp();
        nodeCtrl.handleUp();
        connCtrl.handleUp(e.clientX - rect.left, e.clientY - rect.top);
    }, [viewCtrl, nodeCtrl, connCtrl]);

    const handleNodeClick = (nodeId: string, e: React.PointerEvent) => {
        if (toolMode === ToolMode.PAN || isSpacePressed) return;
        const node = nodes.find(n => n.id === nodeId);
        const selectedNodes = nodes.filter(n => n.selected);
        const isGroup = selectedNodes.length > 1;
        const isMod = e.metaKey || e.ctrlKey || e.shiftKey;

        if (isMod) {
            if (node?.selected) props.onSelectNodes(selectedNodes.filter(n => n.id !== nodeId).map(n => n.id));
            else props.onSelectNodes([...selectedNodes.map(n => n.id), nodeId]);
            return;
        }
        if (isGroup && connCtrl.isClickConnectionActive && connCtrl.clickConnectionStart) {
             if (connCtrl.clickConnectionStart.nodeId !== nodeId) {
                 const target = nodes.find(n => n.id === nodeId);
                 if (target) {
                     const mouseCanvasX = (lastMousePos.current.x - viewport.x) / viewport.scale;
                     const mouseCanvasY = (lastMousePos.current.y - viewport.y) / viewport.scale;
                     const handle = getClosestHandle(target, { x: mouseCanvasX, y: mouseCanvasY }, nodes);
                     props.onConnectEnd(connCtrl.clickConnectionStart.nodeId, nodeId, connCtrl.clickConnectionStart.handle, handle);
                 }
             }
             connCtrl.cancelClickConnection();
             return;
        }
        if (isGroup) return;
        if (!node?.selected) props.onSelectNode(nodeId);
        
        if (connCtrl.isClickConnectionActive && connCtrl.clickConnectionStart) {
             if (connCtrl.clickConnectionStart.nodeId !== nodeId) {
                 const target = nodes.find(n => n.id === nodeId);
                 if (target) {
                     const mouseCanvasX = (lastMousePos.current.x - viewport.x) / viewport.scale;
                     const mouseCanvasY = (lastMousePos.current.y - viewport.y) / viewport.scale;
                     const handle = getClosestHandle(target, { x: mouseCanvasX, y: mouseCanvasY }, nodes);
                     props.onConnectEnd(connCtrl.clickConnectionStart.nodeId, nodeId, connCtrl.clickConnectionStart.handle, handle);
                 }
             }
             connCtrl.cancelClickConnection();
        }
    };

    return {
        ...nodeCtrl, ...connCtrl, ...viewCtrl,
        handlePointerDown, handlePointerMove, handlePointerUp, handleNodeClick,
        ...connCtrl.handlers // handlers for node/handle enter/leave
    };
};