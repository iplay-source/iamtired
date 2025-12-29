
import React from 'react';
import { ToastType } from '../components/Toast';
import { loadFromDB } from './db';

interface PersistenceData {
    version: number;
    timestamp: number;
    tabState?: any;
    nodes?: any[];
    connections?: any[];
    [key: string]: any;
}

export const handleExportFile = async (saveData: (toLocalStorage: boolean) => Promise<PersistenceData | null>, filename?: string) => {
    const data = await saveData(false);
    if (!data) return;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let name = filename || `iamtired-backup-${new Date().toISOString().slice(0, 10)}`;
    // Ensure .json extension
    if (!name.toLowerCase().endsWith('.json')) {
        name += '.json';
    }
    
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

export const handleImportFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    loadData: (data: any) => void,
    addToast: (props: { title: string; message: string; type?: ToastType }) => void
) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            loadData(JSON.parse(evt.target?.result as string));
            addToast({ title: 'Import Successful', message: 'Graph data loaded from file.', type: 'success' });
        } catch (err) {
            addToast({ title: 'Import Failed', message: 'Error parsing JSON file.', type: 'error' });
        }
    };
    reader.readAsText(file);
};

export const handleSaveLocal = async (
    saveData: (toLocalStorage: boolean) => Promise<any>,
    addToast: (props: { title: string; message: string; type?: ToastType }) => void
) => {
    try {
        await saveData(true);
        addToast({ title: 'Saved Successfully', message: 'Graph data saved to browser storage.', type: 'success' });
    } catch (e) {
        addToast({ title: 'Save Failed', message: 'Could not save to browser storage.', type: 'error' });
    }
};

export const handleLoadLocal = async (
    loadData: (data: any) => void,
    addToast: (props: { title: string; message: string; type?: ToastType }) => void
) => {
    try {
        // First try IndexedDB
        let data = await loadFromDB('iamtired_save');
        
        // Fallback to localStorage
        if (!data) {
            const local = localStorage.getItem('iamtired_save');
            if (local) data = JSON.parse(local);
        }

        if (data) {
            loadData(data);
            addToast({ title: 'Load Successful', message: 'Graph data loaded from browser storage.', type: 'success' });
        } else {
            addToast({ title: 'No Save Found', message: 'No local save found in this browser.', type: 'warning' });
        }
    } catch (e) {
        addToast({ title: 'Load Failed', message: 'Failed to load local save.', type: 'error' });
    }
};
