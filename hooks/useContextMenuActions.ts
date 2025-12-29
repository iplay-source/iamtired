import React, { useCallback } from 'react';
import { WikiNode, Connection, Viewport } from '../types';
import { ToastType } from '../components/Toast';
import { ClipboardData } from './useClipboard';

interface UseContextMenuActionsProps {
    graph: {
        nodes: WikiNode[];
        connections: Connection[];
        viewport: Viewport;
        deleteNode: (id: string) => void;
        deleteConnection: (id: string) => void;
        branchFromNode: (id: string, text: string) => void;
        updateNode: (id: string, updates: Partial<WikiNode>) => void;
        updateConnection: (id: string, updates: Partial<Connection>) => void;
        addNode: (type: any, title: string, content?: string, image?: string, pos?: any) => void;
        setNodes: (val: any) => void;
        setConnections: (val: any) => void;
        generateId: () => string;
        groupNodes: (ids: string[]) => void;
        ungroupNodes: (ids: string[]) => void;
        editNodeAI: (id: string, content: string, instr: string) => void;
        setNodeImage: (id: string, title: string, mode: 'search') => void;
    };
    contextMenu: { visible: boolean; x: number; y: number; type: string; targetId?: string; selectedText?: string; };
    hideContextMenu: () => void;
    copy: (n: WikiNode[], c: Connection[]) => void;
    paste: (pos: {x: number, y: number}, genId: () => string, onN: (n: WikiNode[]) => void, onC: (c: Connection[]) => void, override?: ClipboardData) => void;
    addToast: (t: { title: string; message: string; type?: ToastType }) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const useContextMenuActions = ({
    graph, contextMenu, hideContextMenu, copy, paste, addToast, fileInputRef
}: UseContextMenuActionsProps) => {
    return useCallback(async (action: string) => {
        const { nodes, viewport } = graph;
        const selectedNodes = nodes.filter(n => n.selected);
        const targetNode = contextMenu.targetId ? nodes.find(n => n.id === contextMenu.targetId) : null;

        if (action === 'copy-selection' && contextMenu.selectedText) {
            navigator.clipboard.writeText(contextMenu.selectedText);
            addToast({ title: 'Copied', message: 'Selection copied', type: 'success' });
        }
        else if (action === 'ai-expand-selection' && targetNode && contextMenu.selectedText) {
            graph.branchFromNode(targetNode.id, contextMenu.selectedText);
        }
        else if (action === 'upload-image') fileInputRef.current?.click();
        else if (action === 'search-image' && targetNode) graph.setNodeImage(targetNode.id, targetNode.title, 'search');
        else if (action === 'generate-image' && targetNode) graph.updateNode(targetNode.id, { activeAIPanel: 'image-gen' });
        else if (action === 'copy' || action === 'cut' || action === 'duplicate') {
            let nodesToOp = selectedNodes.length > 0 ? selectedNodes : (targetNode ? [targetNode] : []);
            if (nodesToOp.length === 0) return;
            
            copy(nodesToOp, graph.connections);
            
            if (action === 'cut') {
                nodesToOp.forEach(n => graph.deleteNode(n.id));
            }
            else if (action === 'duplicate') {
                const canvasEl = document.querySelector('.canvas-container');
                const rect = canvasEl?.getBoundingClientRect() || { left: 0, top: 0 };
                const canvasMousePos = { x: (contextMenu.x - rect.left - viewport.x) / viewport.scale + 20, y: (contextMenu.y - rect.top - viewport.y) / viewport.scale + 20 };
                
                // Prepare immediate data to prevent state update lag
                const nodeIds = new Set(nodesToOp.map(n => n.id));
                const relevantConnections = graph.connections.filter(
                    c => nodeIds.has(c.sourceId) && nodeIds.has(c.targetId)
                );
                const duplicateData: ClipboardData = {
                    nodes: JSON.parse(JSON.stringify(nodesToOp)),
                    connections: JSON.parse(JSON.stringify(relevantConnections))
                };

                paste(
                    canvasMousePos, 
                    graph.generateId, 
                    (n) => graph.setNodes((p: any) => [...p.map((x: any) => ({ ...x, selected: false })), ...n]), 
                    (c) => graph.setConnections((p: any) => [...p, ...c]),
                    duplicateData
                );
            }
            if (action === 'copy') addToast({ title: 'Copied', message: `${nodesToOp.length} nodes copied`, type: 'success' });
        }
        else if (action === 'paste') {
            const canvasEl = document.querySelector('.canvas-container');
            const rect = canvasEl?.getBoundingClientRect() || { left: 0, top: 0 };
            const canvasMousePos = { x: (contextMenu.x - rect.left - viewport.x) / viewport.scale, y: (contextMenu.y - rect.top - viewport.y) / viewport.scale };
            paste(canvasMousePos, graph.generateId, (n) => graph.setNodes((p: any) => [...p.map((x: any) => ({ ...x, selected: false })), ...n]), (c) => graph.setConnections((p: any) => [...p, ...c]));
        }
        else if (action === 'delete') {
            if (contextMenu.type === 'node' && contextMenu.targetId) graph.deleteNode(contextMenu.targetId);
            else if (contextMenu.type === 'connection' && contextMenu.targetId) graph.deleteConnection(contextMenu.targetId);
            else if (contextMenu.type === 'selection') selectedNodes.forEach(n => graph.deleteNode(n.id));
        }
        else if (action === 'group-selection' && selectedNodes.length > 0) {
            graph.groupNodes(selectedNodes.map(n => n.id));
        }
        else if (action === 'ungroup' && contextMenu.targetId) {
            graph.ungroupNodes([contextMenu.targetId]);
            addToast({ title: 'Ungrouped', message: 'Group dispersed', type: 'success' });
        }
        else if (action.startsWith('add-')) {
            const canvasEl = document.querySelector('.canvas-container');
            const rect = canvasEl?.getBoundingClientRect() || { left: 0, top: 0 };
            const pos = { x: (contextMenu.x - rect.left - viewport.x) / viewport.scale, y: (contextMenu.y - rect.top - viewport.y) / viewport.scale };
            if (action === 'add-node') graph.addNode('text', 'Untitled', '', undefined, pos);
            else if (action === 'add-title-node') graph.addNode('title', 'Untitled', '', undefined, pos);
            else if (action === 'add-image-node') graph.addNode('image', 'Untitled', '', undefined, pos);
        }
        else if (action === 'branch' && targetNode) graph.updateNode(targetNode.id, { activeAIPanel: 'branch' });
        else if (action.startsWith('ai-') && targetNode) {
            if (action === 'ai-expand-node') graph.updateNode(targetNode.id, { activeAIPanel: 'expand' });
            else if (action === 'ai-edit-node') graph.updateNode(targetNode.id, { activeAIPanel: 'edit' });
            else if (action === 'ai-ask-image') graph.updateNode(targetNode.id, { activeAIPanel: 'ask' });
            else if (action === 'ai-analyze-image') graph.editNodeAI(targetNode.id, targetNode.content, "Analyze this image and describe what you see in detail.");
            else if (action === 'ai-expand-caption') graph.branchFromNode(targetNode.id, `Expand on this caption: ${targetNode.title}`);
        }
        else if (action === 'edit-connection-label' && contextMenu.targetId) {
            graph.updateConnection(contextMenu.targetId, { isEditing: true, selected: true });
        }
        else if (action.startsWith('align-') && selectedNodes.length > 1) {
            const GAP = 20;
            const sortedByPos = [...selectedNodes].sort((a, b) => (a.position.y !== b.position.y) ? a.position.y - b.position.y : a.position.x - b.position.x);
            const ref = sortedByPos[0];
            if (['align-left', 'align-right', 'align-v-center'].includes(action)) {
                const stack = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
                let curY = ref.position.y;
                stack.forEach(n => {
                    let x = n.position.x;
                    if (action === 'align-left') x = ref.position.x;
                    else if (action === 'align-right') x = ref.position.x + ref.width - n.width;
                    else x = ref.position.x + ref.width / 2 - n.width / 2;
                    graph.updateNode(n.id, { position: { x, y: curY } });
                    curY += n.height + GAP;
                });
            } else {
                const stack = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
                let curX = ref.position.x;
                stack.forEach(n => {
                    let y = n.position.y;
                    if (action === 'align-top') y = ref.position.y;
                    else if (action === 'align-bottom') y = ref.position.y + ref.height - n.height;
                    else y = ref.position.y + ref.height / 2 - n.height / 2;
                    graph.updateNode(n.id, { position: { x: curX, y } });
                    curX += n.width + GAP;
                });
            }
        }
        hideContextMenu();
    }, [graph, contextMenu, hideContextMenu, copy, paste, addToast]);
};