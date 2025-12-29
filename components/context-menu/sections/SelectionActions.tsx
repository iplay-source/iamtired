import React from 'react';
import { Copy, Scissors, Trash2, AlignCenter, AlignLeft, AlignRight, Box } from 'lucide-react';
import { ContextMenuItem, ContextMenuSection } from '../ContextPrimitives';

interface SelectionActionsProps {
    onAction: (action: string) => void;
}

export const SelectionActions: React.FC<SelectionActionsProps> = ({ onAction }) => {
    return (
        <>
            <ContextMenuSection title="Selection Group">
                <ContextMenuItem 
                    label="Group Selection" 
                    icon={<Box size={14} />}
                    onClick={() => onAction('group-selection')} 
                />
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                <ContextMenuItem 
                    label="Duplicate Selection" 
                    icon={<Copy size={14} />}
                    onClick={() => onAction('duplicate')} 
                />
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                <ContextMenuItem 
                    label="Copy Selection" 
                    icon={<Copy size={14} />}
                    onClick={() => onAction('copy')} 
                />
                <ContextMenuItem 
                    label="Cut Selection" 
                    icon={<Scissors size={14} />}
                    onClick={() => onAction('cut')} 
                />
            </ContextMenuSection>

            <ContextMenuSection title="Align">
                <ContextMenuItem 
                    label="Vertical Center" 
                    icon={<AlignCenter size={14} className="rotate-90" />}
                    onClick={() => onAction('align-v-center')} 
                />
                <ContextMenuItem 
                    label="Horizontal Center" 
                    icon={<AlignCenter size={14} />}
                    onClick={() => onAction('align-h-center')} 
                />
                <ContextMenuItem 
                    label="Align Left" 
                    icon={<AlignLeft size={14} />}
                    onClick={() => onAction('align-left')} 
                />
                <ContextMenuItem 
                        label="Align Right" 
                        icon={<AlignRight size={14} />}
                        onClick={() => onAction('align-right')} 
                    />
                    <ContextMenuItem 
                        label="Align Top" 
                        icon={<AlignLeft size={14} className="rotate-90" />}
                        onClick={() => onAction('align-top')} 
                    />
                    <ContextMenuItem 
                        label="Align Bottom" 
                        icon={<AlignRight size={14} className="rotate-90" />}
                        onClick={() => onAction('align-bottom')} 
                    />
                </ContextMenuSection>

            <ContextMenuSection>
                <ContextMenuItem 
                    label="Delete Selection" 
                    icon={<Trash2 size={14} />}
                    variant="danger"
                    onClick={() => onAction('delete')} 
                />
            </ContextMenuSection>
        </>
    );
};