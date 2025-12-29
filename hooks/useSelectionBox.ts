import { useState, useRef, useCallback, useEffect } from 'react';
import { Position, WikiNode, Viewport } from '../types';
import { getAbsolutePosition } from '../utils/nodeUtils';

interface UseSelectionBoxProps {
    nodes: WikiNode[];
    viewport: Viewport;
    onSelectNodes: (ids: string[]) => void;
    onSelectionDraggingChange?: (isSelecting: boolean) => void;
}

export const useSelectionBox = ({
    nodes,
    viewport,
    onSelectNodes,
    onSelectionDraggingChange
}: UseSelectionBoxProps) => {
    const isSelecting = useRef(false);
    const [selectionBox, setSelectionBox] = useState<{ start: Position, end: Position } | null>(null);

    const startSelection = useCallback((pos: Position) => {
        isSelecting.current = true;
        setSelectionBox({ start: pos, end: pos });
        onSelectionDraggingChange?.(true);
    }, [onSelectionDraggingChange]);

    const updateSelection = useCallback((pos: Position) => {
        if (!isSelecting.current) return;
        setSelectionBox(prev => {
            if (!prev) return { start: pos, end: pos };
            return { ...prev, end: pos };
        });
    }, []);

    const endSelection = useCallback(() => {
        if (!isSelecting.current || !selectionBox) {
            isSelecting.current = false;
            setSelectionBox(null);
            onSelectionDraggingChange?.(false);
            return;
        }

        const minX = (Math.min(selectionBox.start.x, selectionBox.end.x) - viewport.x) / viewport.scale;
        const maxX = (Math.max(selectionBox.start.x, selectionBox.end.x) - viewport.x) / viewport.scale;
        const minY = (Math.min(selectionBox.start.y, selectionBox.end.y) - viewport.y) / viewport.scale;
        const maxY = (Math.max(selectionBox.start.y, selectionBox.end.y) - viewport.y) / viewport.scale;

        const selectedIds = nodes
            .filter(node => {
                const absPos = getAbsolutePosition(node, nodes);
                const nodeMinX = absPos.x;
                const nodeMaxX = absPos.x + node.width;
                const nodeMinY = absPos.y;
                const nodeMaxY = absPos.y + node.height;
                
                return (
                    nodeMinX >= minX &&
                    nodeMaxX <= maxX &&
                    nodeMinY >= minY &&
                    nodeMaxY <= maxY
                );
            })
            .map(node => node.id);

        onSelectNodes(selectedIds);
        isSelecting.current = false;
        setSelectionBox(null);
        onSelectionDraggingChange?.(false);
    }, [nodes, selectionBox, onSelectNodes, onSelectionDraggingChange]);

    return {
        isSelecting: isSelecting,
        selectionBox,
        startSelection,
        updateSelection,
        endSelection
    };
};