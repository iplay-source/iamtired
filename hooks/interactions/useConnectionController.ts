import { useRef, useState, useCallback, useEffect } from 'react';
import { WikiNode, Position, HandlePosition } from '../../types';
import { getHandlePosition, getClosestHandle } from '../../utils/connectionUtils';

interface UseConnectionControllerProps {
    nodes: WikiNode[];
    viewport: { x: number, y: number, scale: number };
    onConnectEnd: (sourceId: string, targetId: string, sourceHandle: HandlePosition, targetHandle: HandlePosition) => void;
}

export const useConnectionController = ({ nodes, viewport, onConnectEnd }: UseConnectionControllerProps) => {
    const isDraggingConnection = useRef(false);
    const connectionStartId = useRef<string | null>(null);
    const connectionStartHandle = useRef<HandlePosition | null>(null);
    const connectionOverNodeId = useRef<string | null>(null);
    const connectionOverHandle = useRef<HandlePosition | null>(null);
    const connectionDragMoved = useRef(false);

    const [isConnectionDraggingState, setIsConnectionDraggingState] = useState(false);
    const [isClickConnectionActive, setIsClickConnectionActive] = useState(false);
    const [clickConnectionStart, setClickConnectionStart] = useState<{ nodeId: string, handle: HandlePosition } | null>(null);
    const [tempConnection, setTempConnection] = useState<{ start: Position, end: Position } | null>(null);
    const clickConnectionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelClickConnection = useCallback(() => {
        setIsClickConnectionActive(false); setClickConnectionStart(null); setTempConnection(null); setIsConnectionDraggingState(false);
        if (clickConnectionTimeout.current) clearTimeout(clickConnectionTimeout.current);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isClickConnectionActive) cancelClickConnection(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isClickConnectionActive, cancelClickConnection]);

    const startConnectionDrag = (nodeId: string, handle: HandlePosition) => {
        if (isClickConnectionActive) return;
        isDraggingConnection.current = true; connectionDragMoved.current = false;
        connectionStartId.current = nodeId; connectionStartHandle.current = handle;
        setIsConnectionDraggingState(true);
    };

    const handleDotClick = (nodeId: string, handle: HandlePosition) => {
        if (connectionDragMoved.current && !isClickConnectionActive) return;
        if (isClickConnectionActive && clickConnectionStart) {
            if (clickConnectionStart.nodeId !== nodeId) onConnectEnd(clickConnectionStart.nodeId, nodeId, clickConnectionStart.handle, handle);
            cancelClickConnection();
        } else {
            setIsClickConnectionActive(true); setClickConnectionStart({ nodeId, handle }); setIsConnectionDraggingState(true);
            if (clickConnectionTimeout.current) clearTimeout(clickConnectionTimeout.current);
            clickConnectionTimeout.current = setTimeout(cancelClickConnection, 30000);
            const sourceNode = nodes.find(n => n.id === nodeId);
            if (sourceNode) {
                const startPos = getHandlePosition(sourceNode, handle, nodes);
                setTempConnection({ start: startPos, end: startPos });
            }
        }
    };

    const handleMove = (mouseX: number, mouseY: number) => {
        const mouseCanvasX = (mouseX - viewport.x) / viewport.scale;
        const mouseCanvasY = (mouseY - viewport.y) / viewport.scale;
        
        if (isDraggingConnection.current && connectionStartId.current) {
            connectionDragMoved.current = true;
            const sourceNode = nodes.find(n => n.id === connectionStartId.current);
            const startPos = (sourceNode && connectionStartHandle.current) ? getHandlePosition(sourceNode, connectionStartHandle.current, nodes) : { x: 0, y: 0 };
            setTempConnection({ start: startPos, end: { x: mouseCanvasX, y: mouseCanvasY } });
        } else if (isClickConnectionActive && clickConnectionStart) {
            const sourceNode = nodes.find(n => n.id === clickConnectionStart.nodeId);
            const startPos = sourceNode ? getHandlePosition(sourceNode, clickConnectionStart.handle, nodes) : { x: 0, y: 0 };
            setTempConnection({ start: startPos, end: { x: mouseCanvasX, y: mouseCanvasY } });
        }
    };

    const handleUp = (mouseX: number, mouseY: number) => {
        if (isDraggingConnection.current && connectionStartId.current && connectionStartHandle.current) {
            if (connectionOverNodeId.current && connectionOverNodeId.current !== connectionStartId.current) {
                const targetId = connectionOverNodeId.current;
                const targetNode = nodes.find(n => n.id === targetId);
                if (targetNode) {
                    let finalTargetHandle = connectionOverHandle.current;
                    if (!finalTargetHandle) {
                        const mouseCanvasX = (mouseX - viewport.x) / viewport.scale;
                        const mouseCanvasY = (mouseY - viewport.y) / viewport.scale;
                        finalTargetHandle = getClosestHandle(targetNode, { x: mouseCanvasX, y: mouseCanvasY }, nodes);
                    }
                    onConnectEnd(connectionStartId.current, targetId, connectionStartHandle.current, finalTargetHandle);
                }
            }
        }
        isDraggingConnection.current = false;
        setTimeout(() => { connectionDragMoved.current = false; }, 0);
        if (!isClickConnectionActive) { setTempConnection(null); setIsConnectionDraggingState(false); }
        connectionStartId.current = null; connectionOverNodeId.current = null; connectionOverHandle.current = null;
    };

    const handlers = {
        handleNodePointerEnter: (id: string) => { if (isDraggingConnection.current) connectionOverNodeId.current = id; },
        handleNodePointerLeave: () => { if (isDraggingConnection.current) connectionOverNodeId.current = null; },
        handleHandlePointerEnter: (id: string, h: HandlePosition) => { if (isDraggingConnection.current) { connectionOverNodeId.current = id; connectionOverHandle.current = h; } },
        handleHandlePointerLeave: () => { if (isDraggingConnection.current) connectionOverHandle.current = null; }
    };

    return { 
        isDraggingConnection, isConnectionDraggingState, isClickConnectionActive, clickConnectionStart, tempConnection,
        startConnectionDrag, handleDotClick, handleMove, handleUp, cancelClickConnection, handlers 
    };
};