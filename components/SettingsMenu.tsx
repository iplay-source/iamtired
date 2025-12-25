
import React, { useState, useEffect } from 'react';
import { AIConfig, AIProvider } from '../types';
import { X, Save, Key, Globe, Cpu, Settings2 } from 'lucide-react';

interface SettingsMenuProps {
  currentConfig: AIConfig;
  onSave: (config: AIConfig) => void;
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ currentConfig, onSave, onClose }) => {
  const [provider, setProvider] = useState<AIProvider>(currentConfig.provider);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl || '');
  const [model, setModel] = useState(currentConfig.model || '');

  // Reset fields when provider changes to defaults (optional, but helpful)
  useEffect(() => {
    if (provider === currentConfig.provider) {
        setApiKey(currentConfig.apiKey);
        setBaseUrl(currentConfig.baseUrl || '');
        setModel(currentConfig.model || '');
    } else {
        if (provider === 'local') setBaseUrl('http://localhost:11434/v1');
        else if (provider === 'openrouter') setBaseUrl('https://openrouter.ai/api/v1');
        else setBaseUrl('');
        
        setModel('');
        setApiKey('');
    }
  }, [provider, currentConfig]);

  const handleSave = () => {
    onSave({ provider, apiKey, baseUrl, model });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[400px] glass-panel p-4 flex flex-col gap-4 shadow-2xl bg-white/90 dark:bg-zinc-900/90" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings2 size={16} className="text-blue-600" />
                AI Configuration
            </h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <X size={16} />
            </button>
        </div>

        <div className="flex flex-col gap-4">
            {/* Provider Selection */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Provider</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['gemini', 'openai', 'claude', 'openrouter', 'local'] as AIProvider[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setProvider(p)}
                            className={`px-3 py-2 text-xs font-medium border capitalize transition-all
                                ${provider === p 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* API Key */}
            {provider !== 'local' && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Key size={12}/> API Key</label>
                    <input 
                        type="password" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter ${provider} API Key`}
                        className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-400"
                    />
                </div>
            )}

            {/* Base URL (Local/OpenRouter) */}
            {(provider === 'local' || provider === 'openrouter' || provider === 'openai') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Globe size={12}/> Base URL {provider === 'openai' && '(Optional)'}</label>
                    <input 
                        type="text" 
                        value={baseUrl} 
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder={provider === 'local' ? "http://localhost:11434/v1" : "https://api.openai.com/v1"}
                        className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-400"
                    />
                </div>
            )}

            {/* Model Name */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Cpu size={12}/> Model (Optional)</label>
                <input 
                    type="text" 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={
                        provider === 'gemini' ? 'gemini-3-flash-preview' :
                        provider === 'openai' ? 'gpt-4o' :
                        provider === 'claude' ? 'claude-3-5-sonnet-latest' :
                        'llama3'
                    }
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-400"
                />
            </div>
        </div>

        <button onClick={handleSave} className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
            <Save size={16} /> Save Configuration
        </button>
      </div>
    </div>
  );
};
