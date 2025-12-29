import React from 'react';
import { Sparkles, Settings2, X, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
    onConfigure: () => void;
    onContinue: () => void;
    globalFont: 'sans' | 'serif' | 'mono';
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onConfigure, onContinue, globalFont }) => {
    return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/20 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 font-sans`}>
            <div 
                className="w-[480px] shadow-2xl overflow-hidden flex flex-col relative force-glass" 
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header Graphic */}
                <div className="h-44 relative overflow-hidden border-b border-[var(--glass-border)]">
                    <img
                        src="/welcome_bg_v2.png"
                        alt="Welcome background"
                        className="absolute inset-0 w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>

                    <div className="relative z-10 h-full flex flex-col items-center justify-center gap-1.5 text-white">
                        <div className="p-2.5 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full mb-2 animate-pulse">
                            <Sparkles size={36} className="text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-mono font-bold tracking-tighter text-blue-50 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <span className="text-blue-500 opacity-60">_</span>iamtired
                        </h1>
                        <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            System.Initialized.v1.2
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col gap-8">
                    <div className="text-center space-y-4">
                        <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed text-[15px]">
                            The ultimate spatial knowledge engine. Organize with <strong>Drag & Drop tabs</strong>, navigate with <strong>Intelligent Scroll-Panning</strong>, and power your workflow with AI.
                        </p>
                        <div className="h-px w-12 bg-blue-500/30 mx-auto" />
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                            To unlock features like <strong>Text Expansion</strong>, and <strong>Mind Map Branching</strong>, you'll need to configure your AI provider.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfigure}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Settings2 size={18} /> Configure AI Settings
                        </button>

                        <button
                            onClick={onContinue}
                            className="w-full py-3 bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 font-medium flex items-center justify-center gap-2 transition-colors border border-zinc-200 dark:border-white/5"
                        >
                            Continue without AI <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wider font-medium uppercase">
                        Gemini • OpenAI • Claude • OpenRouter • Local LLMs
                    </div>
                </div>
            </div>
        </div>
    );
};