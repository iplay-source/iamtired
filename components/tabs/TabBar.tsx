import React, { useRef, useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Tab } from '../../types/tabTypes';
import { TabItem } from './TabItem';
import { TabListDropdown } from './TabListDropdown';

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string;
    onSwitchTab: (tabId: string) => void;
    onCloseTab: (tabId: string) => void;
    onNewTab: () => void;
    onRenameTab: (tabId: string, newTitle: string) => void;
    onReorderTabs: (startIndex: number, endIndex: number) => void;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSwitchTab, onCloseTab, onNewTab, onRenameTab, onReorderTabs, globalFont }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const listBtnRef = useRef<HTMLButtonElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [showTabList, setShowTabList] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            onReorderTabs(draggedIndex, index);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const updateScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
        }
    };

    useEffect(() => {
        updateScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);
            return () => { container.removeEventListener('scroll', updateScrollButtons); window.removeEventListener('resize', updateScrollButtons); };
        }
    }, [tabs.length]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    };

    const scrollBtnClass = "shrink-0 w-6 h-full flex items-center justify-center bg-zinc-50/80 dark:bg-[#0a0a0b]/90 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 border-r border-zinc-200/50 dark:border-white/5 transition-colors";
    const actionBtnClass = "shrink-0 w-9 h-full flex items-center justify-center bg-transparent hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 border-l border-zinc-200/50 dark:border-white/5 transition-colors duration-150";

    return (
        <div className="w-full h-9 flex items-stretch bg-zinc-50/80 dark:bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/5 z-50">
            {canScrollLeft && <button onClick={() => scroll('left')} className={scrollBtnClass}><ChevronLeft size={14} /></button>}

            <div ref={scrollContainerRef} className="flex-1 flex items-stretch overflow-x-auto scrollbar-hide">
                {tabs.map((tab, index) => (
                    <TabItem
                        key={tab.id}
                        tab={tab}
                        isActive={tab.id === activeTabId}
                        canClose={tabs.length > 1}
                        tabCount={tabs.length}
                        index={index}
                        onSwitch={() => onSwitchTab(tab.id)}
                        onClose={() => onCloseTab(tab.id)}
                        onRename={(newTitle) => onRenameTab(tab.id, newTitle)}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        draggedIndex={draggedIndex}
                        dragOverIndex={dragOverIndex}
                    />
                ))}
            </div>

            {canScrollRight && <button onClick={() => scroll('right')} className={scrollBtnClass.replace('border-r', 'border-l')}><ChevronRight size={14} /></button>}

            {/* Tab list button */}
            <div className="relative">
                <button
                    ref={listBtnRef}
                    onClick={() => setShowTabList(!showTabList)}
                    className={actionBtnClass}
                    title="All Tabs"
                >
                    <List size={16} />
                </button>
                {showTabList && (
                    <TabListDropdown
                        tabs={tabs}
                        activeTabId={activeTabId}
                        onSwitchTab={onSwitchTab}
                        onReorderTabs={onReorderTabs}
                        onClose={() => setShowTabList(false)}
                        anchorRect={listBtnRef.current?.getBoundingClientRect()}
                        globalFont={globalFont}
                    />
                )}
            </div>

            {/* New tab button */}
            <button onClick={onNewTab} className={actionBtnClass} title="New Tab"><Plus size={16} /></button>
        </div>
    );
};