import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Viewport, Position, ToolMode, WikiNode } from '../../types';
import { useSelectionBox } from '../useSelectionBox';
import { getAbsolutePosition } from '../../utils/nodeUtils';

interface UseViewControllerProps {
    nodes: WikiNode[];
    viewport: Viewport;
    toolMode: ToolMode;
    isSpacePressed: boolean;
    onViewportChange: (v: Viewport) => void;
    onSelectNode: (id: string) => void;
    onSelectNodes: (ids: string[]) => void;
    onSelectionDraggingChange?: (isSelecting: boolean) => void;
    onPanDraggingChange?: (isDragging: boolean) => void;
}

export const useViewController = ({
    nodes, viewport, toolMode, isSpacePressed, onViewportChange, onSelectNode, onSelectNodes, onSelectionDraggingChange, onPanDraggingChange
}: UseViewControllerProps) => {
    const isDraggingCanvas = useRef(false);
    const [isSpacePanDragging, setIsSpacePanDragging] = useState(false);
    const { isSelecting, selectionBox, startSelection, updateSelection, endSelection } = useSelectionBox({ nodes, viewport, onSelectNodes, onSelectionDraggingChange });

    useEffect(() => { onPanDraggingChange?.(isSpacePanDragging); }, [isSpacePanDragging, onPanDraggingChange]);

    const multiSelectBounds = (() => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length <= 1) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedNodes.forEach(node => {
            const absPos = getAbsolutePosition(node, nodes);
            minX = Math.min(minX, absPos.x);
            minY = Math.min(minY, absPos.y);
            maxX = Math.max(maxX, absPos.x + node.width);
            maxY = Math.max(maxY, absPos.y + node.height);
        });
        const padding = 20;
        return { x: minX - padding, y: minY - padding, width: (maxX - minX) + (padding * 2), height: (maxY - minY) + (padding * 2) };
    })();

    const handlePointerDown = (e: React.PointerEvent, mouseX: number, mouseY: number) => {
        if (toolMode === ToolMode.PAN || isSpacePressed || e.button === 1) {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            isDraggingCanvas.current = true;
            if (isSpacePressed && e.button !== 1) {
                const mx = (mouseX - viewport.x) / viewport.scale;
                const my = (mouseY - viewport.y) / viewport.scale;
                const isOverNode = nodes.some(node => {
                    // For pan drag check, we usually want to know if we are over ANY node to prevent accidental pan when trying to drag node?
                    // But if Space is pressed, we force Pan anyway usually.
                    // The original code checked isOverNode to decide if we set isSpacePanDragging visual state maybe?
                    const abs = getAbsolutePosition(node, nodes);
                    return mx >= abs.x && mx <= abs.x + node.width && my >= abs.y && my <= abs.y + node.height;
                });
                if (!isOverNode) setIsSpacePanDragging(true);
            }
            return true;
        }
        if (toolMode === ToolMode.SELECT) {
            const mx = (mouseX - viewport.x) / viewport.scale;
            const my = (mouseY - viewport.y) / viewport.scale;
            
            const isOverNode = nodes.some(node => {
                // Ignore group nodes to allow selection start inside them
                if (node.type === 'group') return false; 
                
                const abs = getAbsolutePosition(node, nodes);
                return mx >= abs.x && mx <= abs.x + node.width && my >= abs.y && my <= abs.y + node.height;
            });
            
            const isOverMulti = multiSelectBounds && mx >= multiSelectBounds.x && mx <= multiSelectBounds.x + multiSelectBounds.width && my >= multiSelectBounds.y && my <= multiSelectBounds.y + multiSelectBounds.height;

            if (!isOverNode && !isOverMulti) {
                const selectedNodes = nodes.filter(n => n.selected);
                if (selectedNodes.length <= 1) {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    startSelection({ x: mouseX, y: mouseY });
                    onSelectNode(''); onSelectNodes([]);
                } else if (e.button !== 2) {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    startSelection({ x: mouseX, y: mouseY });
                }
            }
        }
        return false;
    };

    const handleMove = (deltaX: number, deltaY: number, mouseX: number, mouseY: number) => {
        if (isDraggingCanvas.current) {
            onViewportChange({ ...viewport, x: viewport.x + deltaX, y: viewport.y + deltaY });
        } else if (isSelecting.current) {
            updateSelection({ x: mouseX, y: mouseY });
        }
    };

    const handleUp = () => {
        if (isDraggingCanvas.current) { isDraggingCanvas.current = false; setIsSpacePanDragging(false); }
        if (isSelecting.current) endSelection();
    };

    return { isDraggingCanvas, selectionBox, multiSelectBounds, handlePointerDown, handleMove, handleUp };
};