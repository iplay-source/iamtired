import React, { useCallback } from 'react';
import { WikiNode, Connection, HandlePosition } from '../../types';
import { generateArticleContent, expandStub, refineContent, generateImageForArticle, searchImageForArticle } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

interface UseGraphAIProps {
    nodes: WikiNode[];
    setNodes: React.Dispatch<React.SetStateAction<WikiNode[]>>;
    updateNode: (id: string, updates: Partial<WikiNode>) => void;
    connectNodes: (s: string, t: string, sh: HandlePosition, th: HandlePosition) => void;
    generateId: () => string;
    getNextZIndex: () => number;
}

export const useGraphAI = ({ nodes, setNodes, updateNode, connectNodes, generateId, getNextZIndex }: UseGraphAIProps) => {
    const { addToast } = useToast();

    const handleAIError = useCallback((id: string, e: any, fallbackText?: string) => {
        const isApiKey = e.message?.includes('API Key missing');
        addToast({ 
            title: isApiKey ? 'AI Configuration' : 'AI Action Failed', 
            message: e.message, 
            type: isApiKey ? 'warning' : 'error' 
        }); 
        updateNode(id, { isGenerating: false, content: fallbackText !== undefined ? fallbackText : undefined });
    }, [addToast, updateNode]);

    const setNodeImage = useCallback(async (id: string, title: string, mode: 'generate' | 'search') => {
        updateNode(id, { isGenerating: true });
        try {
            const image = mode === 'generate' ? await generateImageForArticle(title) : await searchImageForArticle(title);
            updateNode(id, { isGenerating: false, coverImage: image || undefined });
        } catch (e: any) { 
            handleAIError(id, e);
        }
    }, [updateNode, handleAIError]);

    const expandNodeAI = useCallback(async (id: string, title: string, content: string) => {
        updateNode(id, { isGenerating: true });
        try { 
            updateNode(id, { content: await expandStub(title, content), isGenerating: false }); 
        } catch (e: any) { 
            handleAIError(id, e);
        }
    }, [updateNode, handleAIError]);

    const editNodeAI = useCallback(async (id: string, content: string, instruction: string) => {
        updateNode(id, { isGenerating: true });
        try { 
            updateNode(id, { content: await refineContent(content, instruction), isGenerating: false }); 
        } catch (e: any) { 
            handleAIError(id, e);
        }
    }, [updateNode, handleAIError]);

    const branchFromNode = useCallback(async (sourceId: string, text: string) => {
        const sourceNode = nodes.find(n => n.id === sourceId);
        if (!sourceNode || !text.trim()) return;
        const x = sourceNode.position.x + sourceNode.width + 100;
        const y = sourceNode.position.y + (Math.random() * 50);
        const newId = generateId();
        
        setNodes(prev => [...prev, { 
            id: newId, type: 'text', title: text.trim(), 
            content: 'Generating...', position: { x, y }, 
            width: 350, height: 250, imageHeight: 160, 
            isGenerating: true, zIndex: 2 // Default Z for text nodes
        }]);
        
        connectNodes(sourceId, newId, 'right', 'left');
        
        try {
            const content = await generateArticleContent(text.trim(), { title: sourceNode.title, content: sourceNode.content });
            updateNode(newId, { content, isGenerating: false });
        } catch (e: any) { 
            handleAIError(newId, e, 'Generation failed.');
        }
    }, [nodes, setNodes, connectNodes, updateNode, generateId, handleAIError]);

    return { setNodeImage, expandNodeAI, editNodeAI, branchFromNode };
};