
import React from 'react';
import { Sparkles, Settings2, X, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onConfigure: () => void;
  onContinue: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onConfigure, onContinue }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[500px] glass-panel bg-white/95 dark:bg-[#09090b]/95 shadow-2xl overflow-hidden flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Graphic */}
        <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 text-white">
                <Sparkles size={32} />
                <h1 className="text-2xl font-bold tracking-tight">Welcome to iamtired</h1>
            </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                    The ultimate spatial knowledge engine. Infinite canvas meets deep document editing, powered by Generative AI.
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    To unlock features like <strong>Text Expansion</strong>, <strong>Image Generation</strong>, and <strong>Mind Map Branching</strong>, you'll need to configure your AI provider.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={onConfigure} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                    <Settings2 size={18} /> Configure AI Settings
                </button>
                
                <button 
                    onClick={onContinue} 
                    className="w-full py-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    Continue without AI <ArrowRight size={16} />
                </button>
            </div>

            <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
                Supports Gemini, OpenAI, Claude, OpenRouter & Local LLMs.
                <br/>
                Your keys are stored locally in your browser.
            </div>
        </div>
      </div>
    </div>
  );
};
