import React, { useCallback } from 'react';
import { WikiNode, Position } from '../../types';
import { getAbsolutePosition } from '../../utils/nodeUtils';

interface UseGraphGroupingProps {
    nodes: WikiNode[];
    setNodes: React.Dispatch<React.SetStateAction<WikiNode[]>>;
    generateId: () => string;
    getNextZIndex: () => number;
}

export const useGraphGrouping = ({ nodes, setNodes, generateId, getNextZIndex }: UseGraphGroupingProps) => {
    const groupNodes = useCallback((ids: string[]) => {
        setNodes(prev => {
            const selectedNodes = prev.filter(n => ids.includes(n.id));
            if (selectedNodes.length === 0) return prev;

            const absoluteNodes = selectedNodes.map(n => ({
                node: n,
                absPos: getAbsolutePosition(n, prev)
            }));

            const minX = Math.min(...absoluteNodes.map(a => a.absPos.x));
            const minY = Math.min(...absoluteNodes.map(a => a.absPos.y));
            const maxX = Math.max(...absoluteNodes.map(a => a.absPos.x + a.node.width));
            const maxY = Math.max(...absoluteNodes.map(a => a.absPos.y + a.node.height));

            const padding = 40;
            const headerHeight = 48;
            const width = (maxX - minX) + (padding * 2);
            const height = (maxY - minY) + (padding * 2) + headerHeight;

            const groupId = generateId();
            const groupX = minX - padding;
            const groupY = minY - padding - headerHeight;

            const groupNode: WikiNode = {
                id: groupId,
                type: 'group',
                title: 'New Group',
                content: '',
                position: { x: groupX, y: groupY },
                width,
                height,
                zIndex: 1, // Default Z-index for groups
                selected: true
            };

            const updatedNodes = prev.map(n => {
                if (ids.includes(n.id)) {
                    const absPos = getAbsolutePosition(n, prev);
                    return { 
                        ...n, 
                        parentId: groupId, 
                        selected: false,
                        position: {
                            x: absPos.x - groupX,
                            y: absPos.y - groupY // Store strictly relative to group origin, not content area
                        }
                    };
                }
                return { ...n, selected: false };
            });
            return [...updatedNodes, groupNode];
        });
    }, [setNodes, generateId]);

    const ungroupNodes = useCallback((groupIds: string[]) => {
        setNodes(prev => {
            const groupsToUngroup = prev.filter(n => groupIds.includes(n.id) && n.type === 'group');
            if (groupsToUngroup.length === 0) return prev;

            let updatedNodes = [...prev];
            
            groupsToUngroup.forEach(group => {
                updatedNodes = updatedNodes.filter(n => n.id !== group.id);
                updatedNodes = updatedNodes.map(n => {
                    if (n.parentId === group.id) {
                        return {
                            ...n,
                            parentId: undefined,
                            position: {
                                x: group.position.x + n.position.x,
                                y: group.position.y + n.position.y
                            }
                        };
                    }
                    return n;
                });
            });

            return updatedNodes;
        });
    }, [setNodes]);

    const reparentNode = useCallback((nodeId: string, newParentId: string | undefined) => {
        setNodes(prev => {
            const node = prev.find(n => n.id === nodeId);
            if (!node) return prev;
            if (node.parentId === newParentId) return prev;

            const currentAbsPos = getAbsolutePosition(node, prev);
            let newPos = currentAbsPos;

            if (newParentId) {
                const parent = prev.find(n => n.id === newParentId);
                if (parent) {
                    const parentAbsPos = getAbsolutePosition(parent, prev);
                    newPos = {
                        x: currentAbsPos.x - parentAbsPos.x,
                        y: currentAbsPos.y - parentAbsPos.y
                    };
                }
            } 

            // Don't change Z-index on reparenting; allow WikiNode logic to handle hierarchy visuals
            return prev.map(n => n.id === nodeId ? { ...n, parentId: newParentId, position: newPos } : n);
        });
    }, [setNodes]);

    return { groupNodes, ungroupNodes, reparentNode };
};