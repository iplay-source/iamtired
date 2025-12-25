
import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-600 dark:text-green-500" />,
    error: <AlertCircle size={18} className="text-red-600 dark:text-red-500" />,
    info: <Info size={18} className="text-blue-600 dark:text-blue-500" />,
    warning: <AlertTriangle size={18} className="text-amber-600 dark:text-amber-500" />
  };

  const borderLeftColors = {
    success: 'border-l-green-600 dark:border-l-green-500',
    error: 'border-l-red-600 dark:border-l-red-500',
    info: 'border-l-blue-600 dark:border-l-blue-500',
    warning: 'border-l-amber-600 dark:border-l-amber-500'
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 w-80 p-3 shadow-xl backdrop-blur-md bg-white/95 dark:bg-[#18181b]/95 border border-zinc-200 dark:border-white/10 ${borderLeftColors[toast.type]} border-l-4 animate-in slide-in-from-top-2 fade-in duration-300`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1 uppercase tracking-wide text-[10px]">{toast.title}</h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed break-words font-medium">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="shrink-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};
