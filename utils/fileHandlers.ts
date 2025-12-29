import React from 'react';
import { ToastType } from '../components/Toast';

interface PersistenceData {
    version: number;
    timestamp: number;
    tabState?: any;
    nodes?: any[];
    connections?: any[];
    [key: string]: any;
}

export const handleExportFile = (saveData: (toLocalStorage: boolean) => PersistenceData, filename?: string) => {
    const data = saveData(false);
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

export const handleSaveLocal = (
    saveData: (toLocalStorage: boolean) => void,
    addToast: (props: { title: string; message: string; type?: ToastType }) => void
) => {
    saveData(true);
    addToast({ title: 'Saved Successfully', message: 'Graph data saved to browser storage.', type: 'success' });
};

export const handleLoadLocal = (
    loadData: (data: any) => void,
    addToast: (props: { title: string; message: string; type?: ToastType }) => void
) => {
    const saved = localStorage.getItem('iamtired_save');
    if (saved) {
        try {
            loadData(JSON.parse(saved));
            addToast({ title: 'Load Successful', message: 'Graph data loaded from browser storage.', type: 'success' });
        } catch (e) {
            addToast({ title: 'Load Failed', message: 'Failed to load local save.', type: 'error' });
        }
    } else {
        addToast({ title: 'No Save Found', message: 'No local save found in this browser.', type: 'warning' });
    }
};