import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuContent } from './context-menu/ContextMenuContent';

interface ContextMenuProps {
    x: number;
    y: number;
    type: 'canvas' | 'node' | 'connection' | 'selection';
    onClose: () => void;
    onAction: (action: string) => void;
    hasMultiSelection: boolean;
    canPaste: boolean;
    selectedText?: string;
    nodeType?: 'text' | 'image' | 'title' | 'group';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, type, onClose, onAction, hasMultiSelection, canPaste, selectedText, nodeType }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    const [menuRect, setMenuRect] = React.useState<{ width: number, height: number } | null>(null);

    useEffect(() => {
        if (menuRef.current) {
            setMenuRect({
                width: menuRef.current.offsetWidth,
                height: menuRef.current.offsetHeight
            });
        }
    }, [type, nodeType, selectedText, hasMultiSelection]); // Re-measure when content changes

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position if menu goes off-screen
    const menuWidth = menuRect?.width || 208; // default w-52 is 208px
    const menuHeight = menuRect?.height || 300;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > window.innerWidth) {
        adjustedX = x - menuWidth;
    }
    if (y + menuHeight > window.innerHeight) {
        adjustedY = window.innerHeight - menuHeight - 10;
    }
    
    // Ensure it doesn't go off the left or top either
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[1000] w-52 shadow-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-white/5 animate-in fade-in zoom-in-95 duration-100 force-glass"
            style={{
                top: adjustedY,
                left: adjustedX,
                backgroundColor: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >
            <ContextMenuContent 
                type={type} 
                nodeType={nodeType} 
                selectedText={selectedText} 
                canPaste={canPaste} 
                onAction={onAction}
                hasMultiSelection={hasMultiSelection} 
            />
        </div>,
        document.body
    );
};