
import { WikiNode, Connection, Viewport } from '../types';

export interface Tab {
    id: string;
    title: string;
    nodes: WikiNode[];
    connections: Connection[];
    viewport: Viewport;
}

export interface TabState {
    tabs: Tab[];
    activeTabId: string;
}

export const createNewTab = (title: string = 'Untitled'): Tab => ({
    id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    nodes: [],
    connections: [],
    viewport: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150, scale: 1 }
});

export const createDefaultTab = (): Tab => {
    const defaultNode: WikiNode = {
        id: `node-${Date.now()}`,
        type: 'text',
        title: 'iamtired',
        content: `Welcome to **iamtired**!\n\n- **Space+Drag** to Pan\n- **Double Click** to Edit\n- **Select text** to Format\n\nDark mode enabled.`,
        position: { x: 0, y: 0 },
        width: 400,
        height: 300,
        zIndex: 1,
        imageHeight: 160,
        // Left undefined to inherit global defaults
    };

    return {
        id: `tab-${Date.now()}`,
        title: 'Canvas 1',
        nodes: [defaultNode],
        connections: [],
        viewport: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150, scale: 1 }
    };
};