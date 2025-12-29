import React from 'react';
import { 
    Copy, Clipboard, Trash2, Plus, 
    Image as ImageIcon, Sparkles, Type, 
    FileText, Heading 
} from 'lucide-react';
import { ContextMenuItem, ContextMenuSection } from './ContextPrimitives';
import { NodeActions } from './sections/NodeActions';
import { SelectionActions } from './sections/SelectionActions';

interface ContextMenuContentProps {
    type: 'canvas' | 'node' | 'connection' | 'selection';
    nodeType?: 'text' | 'image' | 'title' | 'group';
    selectedText?: string;
    canPaste: boolean;
    hasMultiSelection?: boolean;
    onAction: (action: string) => void;
}

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({ type, nodeType, selectedText, canPaste, hasMultiSelection, onAction }) => {
    return (
        <>
            {/* TEXT SELECTION ACTIONS */}
            {selectedText && (
                <ContextMenuSection title="Selection">
                    <ContextMenuItem 
                        label="Copy Selection" 
                        icon={<Copy size={14} />}
                        onClick={() => onAction('copy-selection')}
                        subtitle={`"${selectedText.slice(0, 20)}${selectedText.length > 20 ? '...' : ''}"`}
                    />
                    {type === 'node' && (
                        <ContextMenuItem 
                            label="AI Expand" 
                            icon={<Sparkles size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-expand-selection')}
                            subtitle="Create new node from text"
                        />
                    )}
                </ContextMenuSection>
            )}

            {/* NODE ACTIONS */}
            {type === 'node' && nodeType && (
                <NodeActions nodeType={nodeType} onAction={onAction} />
            )}

            {/* SELECTION GROUP ACTIONS - Show if type is selection OR if we have multiple items selected even in node mode */}
            {(type === 'selection' || (type === 'node' && hasMultiSelection)) && (
                <SelectionActions onAction={onAction} />
            )}

            {/* CANVAS ACTIONS */}
            {type === 'canvas' && (
                <>
                    <ContextMenuSection title="Canvas">
                        <ContextMenuItem 
                            label="New Text Node" 
                            icon={<FileText size={14} />}
                            onClick={() => onAction('add-node')} 
                        />
                        <ContextMenuItem 
                            label="New Title Node" 
                            icon={<Heading size={14} />}
                            onClick={() => onAction('add-title-node')} 
                        />
                        <ContextMenuItem 
                            label="New Image Node" 
                            icon={<ImageIcon size={14} />}
                            onClick={() => onAction('add-image-node')} 
                        />
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                        <ContextMenuItem 
                            label="Paste" 
                            icon={<Clipboard size={14} />}
                            disabled={!canPaste}
                            onClick={() => onAction('paste')} 
                            subtitle={canPaste ? "Insert from clipboard" : "Clipboard empty"}
                        />
                    </ContextMenuSection>
                </>
            )}

            {/* CONNECTION ACTIONS */}
            {type === 'connection' && (
                <ContextMenuSection title="Connection">
                    <ContextMenuItem 
                        label="Edit Label" 
                        icon={<Type size={14} />}
                        onClick={() => onAction('edit-connection-label')} 
                    />
                    <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                    <ContextMenuItem 
                        label="Delete Connection" 
                        icon={<Trash2 size={14} />}
                        variant="danger"
                        onClick={() => onAction('delete')} 
                    />
                </ContextMenuSection>
            )}
        </>
    );
};