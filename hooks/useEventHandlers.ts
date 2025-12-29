import React, { useEffect, useRef, useCallback } from 'react';
import { Viewport, ToolMode, Position } from '../types';

interface UseEventHandlersProps {
    viewport: Viewport;
    mousePosRef: React.MutableRefObject<{ x: number, y: number }>;
    setIsSpacePressed: (v: boolean) => void;
    setToolMode: (t: ToolMode) => void;
    handleSaveLocal: () => void;
    addNode: (type: 'text' | 'image' | 'title', title: string, content?: string, image?: string, pos?: Position) => void;
    onDeleteSelected: () => void;
}

export const useEventHandlers = ({
    viewport, mousePosRef, setIsSpacePressed, setToolMode, handleSaveLocal, addNode, onDeleteSelected
}: UseEventHandlersProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement as HTMLElement | null;
            const isEditing = activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'INPUT';
            if (e.code === 'Space' && !e.repeat && !isEditing) setIsSpacePressed(true);
            if (isEditing) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                onDeleteSelected();
            }

            if (e.key.toLowerCase() === 'v') setToolMode(ToolMode.SELECT);
            if (e.key.toLowerCase() === 'h') setToolMode(ToolMode.PAN);
            if (e.key.toLowerCase() === 't') {
                const mouseX = mousePosRef.current.x, mouseY = mousePosRef.current.y;
                const targetX = (mouseX - viewport.x) / viewport.scale, targetY = (mouseY - viewport.y) / viewport.scale;
                addNode('title', 'New Title', '', undefined, { x: targetX, y: targetY });
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSaveLocal(); }
        };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
        const handleWheel = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };

        const handlePaste = (e: ClipboardEvent) => {
            const activeEl = document.activeElement as HTMLElement | null;
            if (activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'INPUT') return;

            const items = e.clipboardData?.items;
            if (!items) return;

            const mouseX = mousePosRef.current.x, mouseY = mousePosRef.current.y;
            const targetX = (mouseX - viewport.x) / viewport.scale, targetY = (mouseY - viewport.y) / viewport.scale;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => { addNode('image', '', undefined, event.target?.result as string, { x: targetX, y: targetY }); };
                        reader.readAsDataURL(blob);
                        return;
                    }
                }
            }
            const textData = e.clipboardData?.getData('text/plain');
            if (textData && textData.trim().length > 0) addNode('text', 'Note', textData, undefined, { x: targetX, y: targetY });
        };

        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('wheel', handleWheel, { passive: false }); window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('wheel', handleWheel); window.removeEventListener('paste', handlePaste);
        };
    }, [viewport, addNode, handleSaveLocal, setIsSpacePressed, setToolMode, mousePosRef]);
};