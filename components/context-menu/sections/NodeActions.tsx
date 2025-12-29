import React from 'react';
import { 
    Copy, Scissors, Clipboard, Trash2, GitBranch, Plus, 
    Image as ImageIcon, Sparkles, Type, MessageSquare, Info, 
    FileText, Heading, Box
} from 'lucide-react';
import { ContextMenuItem, ContextMenuSection } from '../ContextPrimitives';

interface NodeActionsProps {
    nodeType: 'text' | 'image' | 'title' | 'group';
    onAction: (action: string) => void;
}

export const NodeActions: React.FC<NodeActionsProps> = ({ nodeType, onAction }) => {
    return (
        <>
            <ContextMenuSection title="Node Actions">
                {nodeType === 'group' && (
                    <>
                        <ContextMenuItem 
                            label="Ungroup" 
                            icon={<Box size={14} className="opacity-50" />}
                            onClick={() => onAction('ungroup')} 
                            subtitle="Move child nodes to canvas"
                        />
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                    </>
                )}
                <ContextMenuItem 
                    label="Duplicate Node" 
                    icon={<Copy size={14} />}
                    onClick={() => onAction('duplicate')} 
                />
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                <ContextMenuItem 
                    label="Copy Node" 
                    icon={<Copy size={14} />}
                    onClick={() => onAction('copy')} 
                />
                <ContextMenuItem 
                    label="Cut Node" 
                    icon={<Scissors size={14} />}
                    onClick={() => onAction('cut')} 
                />
                
                {(nodeType === 'text' || nodeType === 'title') && (
                    <>
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                        <ContextMenuItem 
                            label="Copy Heading" 
                            icon={<Heading size={14} />}
                            onClick={() => onAction('copy-heading-only')} 
                        />
                        <ContextMenuItem 
                            label="Cut Heading" 
                            icon={<Scissors size={14} />}
                            onClick={() => onAction('cut-heading-only')} 
                        />
                        <ContextMenuItem 
                            label="Paste Heading" 
                            icon={<Clipboard size={14} />}
                            onClick={() => onAction('paste-heading')} 
                        />
                    </>
                )}
                
                {nodeType === 'text' && (
                    <>
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                        <ContextMenuItem 
                            label="Copy Body" 
                            icon={<FileText size={14} />}
                            onClick={() => onAction('copy-body-only')} 
                        />
                        <ContextMenuItem 
                            label="Cut Body" 
                            icon={<Scissors size={14} />}
                            onClick={() => onAction('cut-body-only')} 
                        />
                        <ContextMenuItem 
                            label="Paste Body" 
                            icon={<Clipboard size={14} />}
                            onClick={() => onAction('paste-body')} 
                        />
                    </>
                )}

                {nodeType === 'image' && (
                    <>
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                        <ContextMenuItem 
                            label="Replace Image" 
                            icon={<Plus size={14} />}
                            onClick={() => onAction('upload-image')} 
                            subtitle="Select local file to replace current image"
                        />
                        <ContextMenuItem 
                            label="Copy Image" 
                            icon={<ImageIcon size={14} />}
                            onClick={() => onAction('copy-image-data')} 
                        />
                        <ContextMenuItem 
                            label="Copy Caption" 
                            icon={<FileText size={14} />}
                            onClick={() => onAction('copy-caption-only')} 
                        />
                    </>
                )}
            </ContextMenuSection>

            {/* AI ACTIONS */}
            <ContextMenuSection title="AI Actions">
                {nodeType !== 'image' && (
                    <ContextMenuItem 
                        label="Branch Topic" 
                        icon={<GitBranch size={14} />}
                        variant="ai"
                        onClick={() => onAction('branch')} 
                        subtitle="Create AI branch"
                    />
                )}
                {nodeType === 'text' && (
                    <>
                        <ContextMenuItem 
                            label="Expand with AI" 
                            icon={<Sparkles size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-expand-node')} 
                            subtitle="Generate more details"
                        />
                        <ContextMenuItem 
                            label="Edit with AI" 
                            icon={<Type size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-edit-node')} 
                            subtitle="Rewrite or refine text"
                        />
                        <ContextMenuItem 
                            label="Generate AI Image" 
                            icon={<Sparkles size={14} />}
                            variant="ai"
                            onClick={() => onAction('generate-image')} 
                            subtitle="Create image with AI"
                        />
                    </>
                )}
                {nodeType === 'image' && (
                    <>
                        <ContextMenuItem 
                            label="Analyze Image" 
                            icon={<Info size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-analyze-image')} 
                            subtitle="Describe image content"
                        />
                        <ContextMenuItem 
                            label="Expand on Caption" 
                            icon={<Sparkles size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-expand-caption')} 
                            subtitle="AI details from caption"
                        />
                        <ContextMenuItem 
                            label="Ask about Image" 
                            icon={<MessageSquare size={14} />}
                            variant="ai"
                            onClick={() => onAction('ai-ask-image')} 
                            subtitle="Ask AI specific questions"
                        />
                        <ContextMenuItem 
                            label="Regenerate" 
                            icon={<Sparkles size={14} />}
                            variant="ai"
                            onClick={() => onAction('generate-image')} 
                            subtitle="AI Generate new image"
                        />
                    </>
                )}
            </ContextMenuSection>

            <ContextMenuSection>
                <ContextMenuItem 
                    label="Delete Node" 
                    icon={<Trash2 size={14} />}
                    variant="danger"
                    onClick={() => onAction('delete')} 
                />
            </ContextMenuSection>
        </>
    );
};