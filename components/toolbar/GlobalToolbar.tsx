import React from 'react';
import { FontButton } from './FontButton';
import { ColorButton } from './ColorButton';
import { SizeDropdown } from './SizeDropdown';

const NEUTRAL_COLORS = [
  'var(--node-text-0)',
  'var(--node-text-1)',
  'var(--node-text-2)',
  'var(--node-text-3)',
  'var(--node-text-4)',
];

const headerSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 48, 56, 64, 72];
const bodySizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 36, 40];

interface GlobalToolbarProps {
  globalHeaderFont: 'sans' | 'serif' | 'mono';
  setGlobalHeaderFont: (font: 'sans' | 'serif' | 'mono') => void;
  globalHeaderFontSize: number;
  setGlobalHeaderFontSize: (size: number) => void;
  globalHeaderColor: string;
  setGlobalHeaderColor: (color: string) => void;

  globalBodyFont: 'sans' | 'serif' | 'mono';
  setGlobalBodyFont: (font: 'sans' | 'serif' | 'mono') => void;
  globalBodyFontSize: number;
  setGlobalBodyFontSize: (size: number) => void;
  globalColor: string;
  setGlobalColor: (color: string) => void;
}

export const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  globalHeaderFont, setGlobalHeaderFont, globalHeaderFontSize, setGlobalHeaderFontSize, globalHeaderColor, setGlobalHeaderColor,
  globalBodyFont, setGlobalBodyFont, globalBodyFontSize, setGlobalBodyFontSize, globalColor, setGlobalColor
}) => {
  return (
    <div className="flex flex-col gap-1 pointer-events-auto">
      {/* HEADER SETTINGS */}
      <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-32 shrink-0">GLOBAL HEADER</div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <FontButton font="sans" current={globalHeaderFont} onClick={() => setGlobalHeaderFont('sans')} label="sans" />
        <FontButton font="serif" current={globalHeaderFont} onClick={() => setGlobalHeaderFont('serif')} label="serif" />
        <FontButton font="mono" current={globalHeaderFont} onClick={() => setGlobalHeaderFont('mono')} label="mono" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <SizeDropdown value={globalHeaderFontSize} options={headerSizes} onChange={setGlobalHeaderFontSize} globalFont={globalHeaderFont} label="SIZE" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <div className="flex items-center gap-1.5 px-1.5">
          {NEUTRAL_COLORS.map(color => (
            <ColorButton key={color} color={color} current={globalHeaderColor} onClick={() => setGlobalHeaderColor(color)} />
          ))}
        </div>
      </div>

      {/* BODY SETTINGS */}
      <div className="flex items-center gap-0.5 glass-panel p-1 animate-in slide-in-from-bottom-2 duration-200 h-9 font-sans">
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 px-2 font-bold w-32 shrink-0">GLOBAL BODY</div>
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <FontButton font="sans" current={globalBodyFont} onClick={() => setGlobalBodyFont('sans')} label="sans" />
        <FontButton font="serif" current={globalBodyFont} onClick={() => setGlobalBodyFont('serif')} label="serif" />
        <FontButton font="mono" current={globalBodyFont} onClick={() => setGlobalBodyFont('mono')} label="mono" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <SizeDropdown value={globalBodyFontSize} options={bodySizes} onChange={setGlobalBodyFontSize} globalFont={globalBodyFont} label="SIZE" />
        <div className="w-px h-3 bg-zinc-200 dark:bg-white/10 mx-0.5 shrink-0"></div>
        <div className="flex items-center gap-1.5 px-1.5">
          {NEUTRAL_COLORS.map(color => (
            <ColorButton key={color} color={color} current={globalColor} onClick={() => setGlobalColor(color)} />
          ))}
        </div>
      </div>
    </div>
  );
};