import { useState, useCallback, useRef, useEffect } from 'react';
import { Tab, TabState, createNewTab, createDefaultTab } from '../types/tabTypes';
import { WikiNode, Connection, Viewport } from '../types';

export const useTabs = () => {
    const [tabState, setTabState] = useState<TabState>(() => {
        const defaultTab = createDefaultTab();
        return { tabs: [defaultTab], activeTabId: defaultTab.id };
    });

    const getActiveTab = useCallback(() => {
        return tabState.tabs.find(t => t.id === tabState.activeTabId) || tabState.tabs[0];
    }, [tabState]);

    const addTab = useCallback(() => {
        const newTab = createNewTab(`Canvas ${tabState.tabs.length + 1}`);
        setTabState(prev => ({ tabs: [...prev.tabs, newTab], activeTabId: newTab.id }));
        return newTab.id;
    }, [tabState.tabs.length]);

    const closeTab = useCallback((tabId: string) => {
        setTabState(prev => {
            if (prev.tabs.length <= 1) return prev;
            const newTabs = prev.tabs.filter(t => t.id !== tabId);
            const closedIdx = prev.tabs.findIndex(t => t.id === tabId);
            const newActiveId = prev.activeTabId === tabId
                ? newTabs[Math.max(0, closedIdx - 1)]?.id || newTabs[0].id
                : prev.activeTabId;
            return { tabs: newTabs, activeTabId: newActiveId };
        });
    }, []);

    const switchTab = useCallback((tabId: string) => {
        setTabState(prev => ({ ...prev, activeTabId: tabId }));
    }, []);

    const updateTabTitle = useCallback((tabId: string, title: string) => {
        setTabState(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === tabId ? { ...t, title } : t)
        }));
    }, []);

    const updateActiveTabData = useCallback((nodes: WikiNode[], connections: Connection[], viewport: Viewport) => {
        setTabState(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === prev.activeTabId ? { ...t, nodes, connections, viewport } : t)
        }));
    }, []);

    const reorderTabs = useCallback((startIndex: number, endIndex: number) => {
        setTabState(prev => {
            const newTabs = Array.from(prev.tabs);
            const [removed] = newTabs.splice(startIndex, 1);
            newTabs.splice(endIndex, 0, removed);
            return { ...prev, tabs: newTabs };
        });
    }, []);

    const loadTabState = useCallback((newTabState: TabState) => {
        if (newTabState && newTabState.tabs && newTabState.tabs.length > 0) {
            setTabState(newTabState);
        }
    }, []);

    const getTabState = useCallback(() => tabState, [tabState]);

    return {
        tabs: tabState.tabs,
        activeTabId: tabState.activeTabId,
        activeTab: getActiveTab(),
        addTab,
        closeTab,
        switchTab,
        updateTabTitle,
        updateActiveTabData,
        loadTabState,
        reorderTabs,
        getTabState
    };
};