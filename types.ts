
export interface Position {
  x: number;
  y: number;
}

export interface WikiNode {
  id: string;
  type: 'text' | 'image';
  title: string;
  content: string; // Markdown content
  coverImage?: string; // Base64 or URL
  imageHeight?: number; // In pixels, default 160
  imageFit?: 'cover' | 'contain';
  imagePosition?: string; // e.g. 'center', 'top', 'bottom', etc.
  fontStyle?: 'sans' | 'serif' | 'mono';
  position: Position;
  width: number;
  height: number;
  selected?: boolean;
  isGenerating?: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  selected?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export enum ToolMode {
  SELECT = 'SELECT',
  PAN = 'PAN'
}

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'openrouter' | 'local';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}
