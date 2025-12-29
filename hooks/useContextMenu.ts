import React, { useState, useCallback, useEffect } from 'react';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    type: 'canvas' | 'node' | 'connection' | 'selection';
    targetId?: string;
    selectedText?: string;
}

export const useContextMenu = () => {
    const [state, setState] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        type: 'canvas'
    });

    const showContextMenu = useCallback((e: React.MouseEvent | MouseEvent, type: 'canvas' | 'node' | 'connection' | 'selection', targetId?: string) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedText = window.getSelection()?.toString();

        setState({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            type,
            targetId,
            selectedText: selectedText && selectedText.length > 0 ? selectedText : undefined
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        setState(prev => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        const handleScroll = () => hideContextMenu();
        const handleClick = () => hideContextMenu();

        if (state.visible) {
            window.addEventListener('scroll', handleScroll);
            window.addEventListener('click', handleClick);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
        };
    }, [state.visible, hideContextMenu]);

    return {
        contextMenu: state,
        showContextMenu,
        hideContextMenu
    };
};