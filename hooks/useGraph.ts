
import { useCallback } from 'react';
import { useNodes } from './useNodes';
import { useConnections } from './useConnections';
import { WikiNode, Connection } from '../types';
import { generateArticleContent } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

export const useGraph = () => {
  const { nodes, setNodes, addNode, updateNode, setNodeImage, expandNodeAI, editNodeAI, generateId } = useNodes();
  const { connections, setConnections, connectNodes, updateConnectionLabel, deleteConnection, selectConnection } = useConnections(generateId);
  const { addToast } = useToast();

  const branchFromNode = useCallback(async (sourceId: string, text: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    let topic = text ? text.trim() : "";
    if (!topic) return;

    const existingBranches = connections.filter(c => c.sourceId === sourceId).length;
    const verticalOffset = (existingBranches * 280) - 280; 
    const x = sourceNode.position.x + sourceNode.width + 100;
    const y = sourceNode.position.y + verticalOffset + (Math.random() * 50);

    const newNodeId = generateId();
    // Add stub immediately
    setNodes(prev => [...prev, {
        id: newNodeId, type: 'text', title: topic, content: 'Generating...',
        position: { x, y }, width: 350, height: 250, imageHeight: 160, isGenerating: true
    }]);
    
    connectNodes(sourceId, newNodeId);

    // Pass both title and content for context-aware generation
    try {
        const content = await generateArticleContent(topic, { 
            title: sourceNode.title, 
            content: sourceNode.content 
        });
        
        updateNode(newNodeId, { content, isGenerating: false });
    } catch (e: any) {
        addToast({ title: 'Branch Failed', message: e.message || "Failed to generate branch content.", type: 'error' });
        // Set specific error message in the node so it's not stuck on "Generating..." but doesn't crash the UI
        updateNode(newNodeId, { content: "Content generation failed. Check your API settings.", isGenerating: false });
    }
  }, [nodes, connections, generateId, setNodes, connectNodes, updateNode, addToast]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
  }, [setNodes, setConnections]);

  const selectNode = useCallback((id: string | null) => {
    setNodes(prev => prev.map(n => ({ ...n, selected: n.id === id })));
    if (id) selectConnection(null);
  }, [setNodes, selectConnection]);

  const loadGraph = useCallback((newNodes: WikiNode[], newConnections: Connection[]) => {
    setNodes(newNodes);
    setConnections(newConnections);
  }, [setNodes, setConnections]);

  return {
    nodes, connections,
    addNode, updateNode, deleteNode, selectNode, branchFromNode, expandNodeAI, editNodeAI, setNodeImage,
    connectNodes, updateConnectionLabel, deleteConnection, selectConnection,
    loadGraph
  };
};
