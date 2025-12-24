import { useState, useCallback } from 'react';
import { WikiNode, Position } from '../types';
import { generateArticleContent, expandStub, refineContent, generateImageForArticle, searchImageForArticle } from '../services/geminiService';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useNodes = () => {
  const [nodes, setNodes] = useState<WikiNode[]>([
    {
      id: 'welcome-node',
      type: 'text',
      title: 'iamtired',
      content: '## Infinite Canvas\n\n- **Space+Drag** to Pan\n- **Double Click** to Edit\n- **Select** text to Format\n\nDark mode enabled.',
      position: { x: 0, y: 0 },
      width: 400,
      height: 300,
      imageHeight: 160,
      selected: false,
      isGenerating: false,
    }
  ]);

  const addNode = useCallback(async (type: 'text' | 'image', title: string, content?: string, image?: string, pos?: Position) => {
    const id = generateId();
    const position = pos || { x: 0, y: 0 };
    
    const newNode: WikiNode = {
        id, type, title,
        content: content || '',
        coverImage: image,
        position,
        width: type === 'image' ? 300 : 350,
        height: 300,
        imageHeight: 160,
        imageFit: 'contain',
        isGenerating: false
    };

    if (type === 'text' && !content) {
        newNode.content = 'Loading...';
        newNode.isGenerating = true;
    }

    setNodes(prev => [...prev, newNode]);

    if (type === 'text' && !content) {
        const genContent = await generateArticleContent(title);
        setNodes(prev => prev.map(n => n.id === id ? { ...n, content: genContent, isGenerating: false } : n));
    }
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<WikiNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const setNodeImage = useCallback(async (id: string, title: string, mode: 'generate' | 'search') => {
    updateNode(id, { isGenerating: true });
    const image = mode === 'generate' ? await generateImageForArticle(title) : await searchImageForArticle(title);
    updateNode(id, { isGenerating: false, coverImage: image || undefined });
  }, [updateNode]);

  const expandNodeAI = useCallback(async (id: string, title: string, currentContent: string) => {
    updateNode(id, { isGenerating: true });
    const newContent = await expandStub(title, currentContent);
    updateNode(id, { content: newContent, isGenerating: false });
  }, [updateNode]);

  const editNodeAI = useCallback(async (id: string, currentContent: string, instruction: string) => {
    if (!instruction) return;
    updateNode(id, { isGenerating: true });
    const newContent = await refineContent(currentContent, instruction);
    updateNode(id, { content: newContent, isGenerating: false });
  }, [updateNode]);

  return { nodes, setNodes, addNode, updateNode, setNodeImage, expandNodeAI, editNodeAI, generateId };
};