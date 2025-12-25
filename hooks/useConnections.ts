import { useState, useCallback } from 'react';
import { Connection } from '../types';

export const useConnections = (generateId: () => string) => {
  const [connections, setConnections] = useState<Connection[]>([]);

  const connectNodes = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setConnections(prev => {
        const exists = prev.find(c => (c.sourceId === sourceId && c.targetId === targetId) || (c.sourceId === targetId && c.sourceId === sourceId));
        if (exists) return prev;
        return [...prev, { id: generateId(), sourceId, targetId, label: '' }];
    });
  }, [generateId]);

  const updateConnectionLabel = useCallback((id: string, label: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, label } : c));
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  const selectConnection = useCallback((id: string | null) => {
    setConnections(prev => prev.map(c => ({ ...c, selected: c.id === id })));
  }, []);

  return { connections, setConnections, connectNodes, updateConnectionLabel, deleteConnection, selectConnection };
};