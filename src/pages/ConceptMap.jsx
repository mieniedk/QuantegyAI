import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   CONCEPT MAP BUILDER — Students create visual concept maps
   Add nodes, connect them with labeled links, drag to arrange.
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'allen-ace-concept-maps';

function loadMap(studentId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const key = studentId || 'default';
    return data[key] || null;
  } catch {
    return null;
  }
}

function saveMap(studentId, map) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '{}';
    const data = JSON.parse(raw);
    const key = studentId || 'default';
    data[key] = { ...map, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save concept map:', err);
  }
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const NODE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16',
];

function generateId() {
  return 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

export default function ConceptMap({ embedded, onBack, studentId: propStudentId }) {
  const [searchParams] = useSearchParams();
  const studentId = propStudentId || searchParams.get('sid') || '';

  const [title, setTitle] = useState('My Concept Map');
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [linkLabel, setLinkLabel] = useState('');
  const [mode, setMode] = useState('add'); // 'add' | 'connect' | 'edit' | 'delete'
  const [dragState, setDragState] = useState(null);
  const canvasRef = useRef(null);

  // Load saved map
  useEffect(() => {
    const saved = loadMap(studentId);
    if (saved) {
      setTitle(saved.title || 'My Concept Map');
      setNodes(saved.nodes || []);
      setLinks(saved.links || []);
    }
  }, [studentId]);

  // Auto-save
  useEffect(() => {
    if (nodes.length === 0 && links.length === 0) return;
    const timer = setTimeout(() => {
      saveMap(studentId, { title, nodes, links });
    }, 500);
    return () => clearTimeout(timer);
  }, [studentId, title, nodes, links]);

  const handleCanvasClick = useCallback((e) => {
    if (!canvasRef.current || mode !== 'add') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pad = 40;
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft - pad - NODE_WIDTH / 2;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop - pad - NODE_HEIGHT / 2;
    const id = generateId();
    const color = NODE_COLORS[nodes.length % NODE_COLORS.length];
    setNodes((prev) => [...prev, { id, text: 'New concept', x, y, color }]);
    setSelectedNode(id);
  }, [mode, nodes.length]);

  const handleNodeClick = useCallback((e, nodeId) => {
    e.stopPropagation();
    if (mode === 'connect') {
      if (connectingFrom) {
        if (connectingFrom === nodeId) {
          setConnectingFrom(null);
          return;
        }
        const id = generateId();
        setLinks((prev) => [...prev, { id, from: connectingFrom, to: nodeId, label: linkLabel }]);
        setConnectingFrom(null);
        setLinkLabel('');
      } else {
        setConnectingFrom(nodeId);
      }
    } else if (mode === 'delete') {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setLinks((prev) => prev.filter((l) => l.from !== nodeId && l.to !== nodeId));
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  }, [mode, connectingFrom, linkLabel]);

  const handleNodeDoubleClick = useCallback((e, nodeId) => {
    e.stopPropagation();
    if (mode === 'edit' || mode === 'add') {
      const node = nodes.find((n) => n.id === nodeId);
      const newText = prompt('Edit concept text:', node?.text || '');
      if (newText != null && newText.trim()) {
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, text: newText.trim() } : n))
        );
      }
    }
  }, [nodes, mode]);

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (e.button !== 0 || mode === 'connect') return;
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragState({ nodeId, startX: node.x, startY: node.y, mouseX: e.clientX, mouseY: e.clientY });
  }, [nodes, mode]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.mouseX;
    const dy = e.clientY - dragState.mouseY;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragState.nodeId ? { ...n, x: dragState.startX + dx, y: dragState.startY + dy } : n
      )
    );
    setDragState((d) => ({ ...d, mouseX: e.clientX, mouseY: e.clientY, startX: d.startX + dx, startY: d.startY + dy }));
  }, [dragState]);

  const handleCanvasMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleLinkClick = useCallback((e, linkId) => {
    e.stopPropagation();
    if (mode === 'delete') {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } else {
      const link = links.find((l) => l.id === linkId);
      if (link) {
        const newLabel = prompt('Edit link label:', link.label || '');
        if (newLabel != null) {
          setLinks((prev) =>
            prev.map((l) => (l.id === linkId ? { ...l, label: newLabel } : l))
          );
        }
      }
    }
  }, [links, mode]);

  const getNodePos = (id) => nodes.find((n) => n.id === id);

  const getLinkPath = (link) => {
    const from = getNodePos(link.from);
    const to = getNodePos(link.to);
    if (!from || !to) return '';
    const x1 = from.x + NODE_WIDTH / 2;
    const y1 = from.y + NODE_HEIGHT / 2;
    const x2 = to.x + NODE_WIDTH / 2;
    const y2 = to.y + NODE_HEIGHT / 2;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} Q ${midX + 40} ${midY - 20} ${x2} ${y2}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
        fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {embedded && onBack ? (
            <button
              type="button"
              onClick={onBack}
              style={{
                color: '#64748b',
                background: 'none',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          ) : (
            <Link
              to={studentId ? `/student?sid=${studentId}` : '/student'}
              style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ← Back to Student
            </Link>
          )}
          <label htmlFor="concept-map-title" className="sr-only">Map title</label>
          <input id="concept-map-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Map title"
            aria-label="Concept map title"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 16,
              fontWeight: 700,
              minWidth: 180,
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'add', label: 'Add', icon: '➕' },
            { id: 'connect', label: 'Connect', icon: '🔗' },
            { id: 'edit', label: 'Edit', icon: '✏️' },
            { id: 'delete', label: 'Delete', icon: '🗑️' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              aria-label={`${m.label} mode. ${mode === m.id ? 'Selected' : 'Click to select'}`}
              onClick={() => {
                setMode(m.id);
                setConnectingFrom(null);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `2px solid ${mode === m.id ? '#2563eb' : '#e2e8f0'}`,
                background: mode === m.id ? '#eff6ff' : '#fff',
                color: mode === m.id ? '#2563eb' : '#475569',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {connectingFrom && (
        <div
          style={{
            padding: '10px 16px',
            background: '#fef3c7',
            borderBottom: '1px solid #fcd34d',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>Click another concept to connect. Optional label:</span>
          <input
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="e.g. includes, leads to"
            style={{
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 13,
              width: 180,
            }}
          />
          <button type="button" onClick={() => setConnectingFrom(null)} style={{ padding: '4px 10px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        role="application"
        aria-label="Concept map canvas. Click to add nodes. Use mode buttons to connect, edit, or delete."
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          flex: 1,
          overflow: 'auto',
          cursor: mode === 'add' ? 'crosshair' : 'default',
          padding: 40,
        }}
      >
        <svg
          width={Math.max(1200, 800)}
          height={Math.max(800, 600)}
          style={{
            display: 'block',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <g>
            {/* Links */}
            {links.map((link) => {
              const from = getNodePos(link.from);
              const to = getNodePos(link.to);
              if (!from || !to) return null;
              const path = getLinkPath(link);
              const midX = (from.x + NODE_WIDTH / 2 + to.x + NODE_WIDTH / 2) / 2;
              const midY = (from.y + NODE_HEIGHT / 2 + to.y + NODE_HEIGHT / 2) / 2;
              return (
                <g
                  key={link.id}
                  onClick={(e) => handleLinkClick(e, link.id)}
                  style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={connectingFrom === link.from || connectingFrom === link.to ? '#f59e0b' : '#64748b'}
                    strokeWidth={2}
                    strokeDasharray={connectingFrom ? '4 4' : 'none'}
                  />
                  {link.label && (
                    <text
                      x={midX}
                      y={midY - 6}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#475569"
                      fontWeight={600}
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => handleNodeClick(e, node.id)}
                onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{
                  cursor: mode === 'connect' ? 'pointer' : mode === 'delete' ? 'pointer' : 'grab',
                }}
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={10}
                  ry={10}
                  fill={node.color}
                  stroke={selectedNode === node.id ? '#0f172a' : 'rgba(0,0,0,0.1)'}
                  strokeWidth={selectedNode === node.id ? 3 : 1}
                />
                <text
                  x={NODE_WIDTH / 2}
                  y={NODE_HEIGHT / 2 + 5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={14}
                  fontWeight={700}
                >
                  {node.text}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: '12px 20px',
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <strong>Tip:</strong> Add mode: click canvas to add nodes. Connect: click two nodes to link. Edit: double-click a node. Delete: select Delete mode, then click nodes or links.
      </div>
    </div>
  );
}
