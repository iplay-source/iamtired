import { useState, useCallback } from 'react';
import { WikiNode, Connection, Position } from '../types';

export interface ClipboardData {
    nodes: WikiNode[];
    connections: Connection[];
}

export const useClipboard = () => {
    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

    const copy = useCallback((selectedNodes: WikiNode[], allConnections: Connection[]) => {
        if (selectedNodes.length === 0) return;

        const nodeIds = new Set(selectedNodes.map(n => n.id));
        const relevantConnections = allConnections.filter(
            c => nodeIds.has(c.sourceId) && nodeIds.has(c.targetId)
        );

        setClipboard({
            nodes: JSON.parse(JSON.stringify(selectedNodes)),
            connections: JSON.parse(JSON.stringify(relevantConnections))
        });
    }, []);

    const paste = useCallback((
        mousePos: Position,
        generateId: () => string,
        onAddNodes: (nodes: WikiNode[]) => void,
        onAddConnections: (connections: Connection[]) => void,
        dataOverride?: ClipboardData
    ) => {
        const data = dataOverride || clipboard;
        if (!data || data.nodes.length === 0) return;

        // Calculate offset to paste at mouse position
        // Use the first node's position as reference
        const refX = data.nodes[0].position.x;
        const refY = data.nodes[0].position.y;
        
        const idMap: Record<string, string> = {};
        
        const newNodes: WikiNode[] = data.nodes.map(node => {
            const newId = generateId();
            idMap[node.id] = newId;
            
            return {
                ...node,
                id: newId,
                position: {
                    x: mousePos.x + (node.position.x - refX),
                    y: mousePos.y + (node.position.y - refY)
                },
                selected: true // Select newly pasted nodes
            };
        });

        const newConnections: Connection[] = data.connections.map(conn => ({
            ...conn,
            id: generateId(),
            sourceId: idMap[conn.sourceId],
            targetId: idMap[conn.targetId]
        }));

        onAddNodes(newNodes);
        onAddConnections(newConnections);
    }, [clipboard]);

    return {
        clipboard,
        copy,
        paste,
        canPaste: !!clipboard && clipboard.nodes.length > 0
    };
};