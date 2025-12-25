
import React from 'react';
import { Connection, WikiNode, Position } from '../types';
import { ConnectionLine } from './ConnectionLine';

interface ConnectionLayerProps {
  connections: Connection[];
  nodes: WikiNode[];
  tempConnection: { start: Position, end: Position } | null;
  onSelectConnection: (id: string) => void;
  onUpdateConnectionLabel: (id: string, label: string) => void;
  onDeleteConnection: (id: string) => void;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  connections, nodes, tempConnection, onSelectConnection, onUpdateConnectionLabel, onDeleteConnection
}) => {
  const getNodeCenter = (nodeId: string): Position => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.position.x + node.width / 2, y: node.position.y + node.height / 2 };
  };

  const OFF = 50000;

  return (
    <svg className="absolute top-[-50000px] left-[-50000px] w-[100000px] h-[100000px] pointer-events-none overflow-visible">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-main)" fillOpacity="0.4" />
        </marker>
        <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>
      
      {connections.map(conn => {
        const start = getNodeCenter(conn.sourceId);
        const end = getNodeCenter(conn.targetId);
        if (start.x === 0 || end.x === 0) return null;

        return (
          <ConnectionLine 
            key={conn.id} id={conn.id} start={{ x: start.x + OFF, y: start.y + OFF }} end={{ x: end.x + OFF, y: end.y + OFF }}
            label={conn.label} isSelected={!!conn.selected}
            onSelect={(e) => { e.stopPropagation(); onSelectConnection(conn.id); }}
            onDeselect={() => onSelectConnection('')}
            onUpdateLabel={(val) => onUpdateConnectionLabel(conn.id, val)} onDelete={() => onDeleteConnection(conn.id)}
          />
        );
      })}

      {tempConnection && (
         <line 
            x1={tempConnection.start.x + OFF} y1={tempConnection.start.y + OFF} x2={tempConnection.end.x + OFF} y2={tempConnection.end.y + OFF}
            stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-selected)"
         />
      )}
    </svg>
  );
};
