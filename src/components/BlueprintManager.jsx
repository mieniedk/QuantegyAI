import React, { useState, useEffect, useCallback } from 'react';
import TeacherLayout from './TeacherLayout';
import {
  getBlueprints,
  createBlueprint,
  syncBlueprintToChild,
  getBlueprintChildren,
  getClasses,
} from '../utils/storage';

const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_DARK = '#1d4ed8';
const SLATE_50 = '#f8fafc';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_700 = '#334155';
const SLATE_900 = '#0f172a';
const GREEN = '#10b981';
const GREEN_BG = '#ecfdf5';
const RED = '#dc2626';

const BlueprintManager = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [classes, setClasses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [sourceClassId, setSourceClassId] = useState('');
  const [bpName, setBpName] = useState('');
  const [creating, setCreating] = useState(false);
  const [syncResults, setSyncResults] = useState({});
  const [syncing, setSyncing] = useState({});

  const refresh = useCallback(() => {
    setBlueprints(getBlueprints());
    setClasses(getClasses());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = () => {
    if (!sourceClassId) return;
    setCreating(true);
    const bp = createBlueprint(sourceClassId, bpName || undefined);
    if (bp) {
      setSourceClassId('');
      setBpName('');
      refresh();
    }
    setCreating(false);
  };

  const handleSync = (blueprintId, childClassId) => {
    const key = `${blueprintId}-${childClassId}`;
    setSyncing((p) => ({ ...p, [key]: true }));
    const result = syncBlueprintToChild(blueprintId, childClassId);
    setSyncResults((p) => ({ ...p, [key]: result }));
    setSyncing((p) => ({ ...p, [key]: false }));
    refresh();
  };

  const handleSyncAll = (bp) => {
    const children = getBlueprintChildren(bp.id);
    children.forEach((child) => handleSync(bp.id, child.id));
  };

  const handleAddChild = (blueprintId, childClassId) => {
    if (!childClassId) return;
    const result = syncBlueprintToChild(blueprintId, childClassId);
    setSyncResults((p) => ({ ...p, [`${blueprintId}-${childClassId}`]: result }));
    refresh();
  };

  const getSourceClassName = (classId) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : classId;
  };

  const availableClasses = (bp) => {
    const linked = new Set(bp.childClassIds || []);
    return classes.filter((c) => c.id !== bp.sourceClassId && !linked.has(c.id));
  };

  return (
    <TeacherLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: SLATE_900, margin: '0 0 4px' }}>
            📘 Blueprint Course Sync
          </h1>
          <p style={{ color: SLATE_500, fontSize: 14, margin: 0 }}>
            Create blueprint templates from existing classes and sync content to linked child classes.
          </p>
        </div>

        {/* ── Create Blueprint ── */}
        <div style={{
          background: '#fff', borderRadius: 14, border: `1px solid ${SLATE_200}`,
          padding: 24, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: SLATE_900, margin: '0 0 16px' }}>
            Create New Blueprint
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_500, marginBottom: 6 }}>
                Source Class
              </label>
              <select
                value={sourceClassId}
                onChange={(e) => setSourceClassId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${SLATE_200}`, fontSize: 14, background: '#fff',
                  color: SLATE_900, cursor: 'pointer',
                }}
              >
                <option value="">Select a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_500, marginBottom: 6 }}>
                Blueprint Name (optional)
              </label>
              <input
                type="text"
                value={bpName}
                onChange={(e) => setBpName(e.target.value)}
                placeholder="e.g. Algebra I Master"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${SLATE_200}`, fontSize: 14, color: SLATE_900,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!sourceClassId || creating}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: sourceClassId ? BLUE : SLATE_200,
                color: sourceClassId ? '#fff' : SLATE_400,
                fontWeight: 700, fontSize: 14, cursor: sourceClassId ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap', transition: 'background 0.15s',
              }}
            >
              {creating ? 'Creating...' : '📋 Create Blueprint'}
            </button>
          </div>
        </div>

        {/* ── Blueprint List ── */}
        {blueprints.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 14, border: `1px solid ${SLATE_200}`,
            padding: '48px 24px', textAlign: 'center', color: SLATE_400,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📘</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: SLATE_500 }}>No blueprints yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Create one above to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blueprints.map((bp) => {
              const isExpanded = expandedId === bp.id;
              const children = getBlueprintChildren(bp.id);
              const available = availableClasses(bp);

              return (
                <div key={bp.id} style={{
                  background: '#fff', borderRadius: 14,
                  border: `1px solid ${isExpanded ? BLUE : SLATE_200}`,
                  boxShadow: isExpanded ? `0 0 0 3px ${BLUE_LIGHT}` : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  overflow: 'hidden',
                }}>
                  {/* Blueprint Card Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : bp.id)}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '20px 24px', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0, color: '#fff',
                    }}>
                      📘
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: SLATE_900 }}>
                        {bp.name}
                      </div>
                      <div style={{ fontSize: 12, color: SLATE_500, marginTop: 2 }}>
                        Source: {getSourceClassName(bp.sourceClassId)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                      <Stat label="Children" value={children.length} />
                      <Stat label="Modules" value={(bp.snapshot?.modules || []).length} />
                      <Stat label="Created" value={new Date(bp.createdAt).toLocaleDateString()} />
                      <Stat label="Last Sync" value={bp.updatedAt ? new Date(bp.updatedAt).toLocaleDateString() : '—'} />
                      <span style={{
                        fontSize: 18, color: SLATE_400, transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        display: 'inline-block',
                      }}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* ── Sync Panel (expanded) ── */}
                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${SLATE_200}`, padding: 24 }}>
                      {/* Flow Diagram */}
                      <FlowDiagram bp={bp} children={children} getSourceClassName={getSourceClassName} />

                      {/* Sync Controls */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 16, marginTop: 20,
                      }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: SLATE_900, margin: 0 }}>
                          Linked Child Classes ({children.length})
                        </h3>
                        {children.length > 0 && (
                          <button
                            onClick={() => handleSyncAll(bp)}
                            style={{
                              padding: '8px 18px', borderRadius: 8, border: 'none',
                              background: GREEN, color: '#fff', fontWeight: 700,
                              fontSize: 13, cursor: 'pointer',
                            }}
                          >
                            🔄 Sync All
                          </button>
                        )}
                      </div>

                      {children.length === 0 ? (
                        <div style={{
                          padding: '24px 16px', textAlign: 'center', color: SLATE_400,
                          background: SLATE_50, borderRadius: 10, fontSize: 13,
                        }}>
                          No child classes linked yet. Add one below.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                          {children.map((child) => {
                            const key = `${bp.id}-${child.id}`;
                            const result = syncResults[key];
                            const isSyncing = syncing[key];
                            return (
                              <div key={child.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', borderRadius: 10,
                                background: SLATE_50, border: `1px solid ${SLATE_100}`,
                              }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 10,
                                  background: BLUE_LIGHT, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: 16, flexShrink: 0,
                                }}>
                                  📚
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: SLATE_900 }}>
                                    {child.name}
                                  </div>
                                  {result && (
                                    <div style={{
                                      fontSize: 12, color: GREEN, fontWeight: 600, marginTop: 2,
                                    }}>
                                      ✓ {result.synced} module{result.synced !== 1 ? 's' : ''} synced
                                    </div>
                                  )}
                                </div>
                                <span style={{
                                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                  background: result ? GREEN_BG : `${BLUE_LIGHT}`,
                                  color: result ? GREEN : BLUE,
                                }}>
                                  {result ? 'Synced' : 'Linked'}
                                </span>
                                <button
                                  onClick={() => handleSync(bp.id, child.id)}
                                  disabled={isSyncing}
                                  style={{
                                    padding: '8px 14px', borderRadius: 8, border: 'none',
                                    background: BLUE, color: '#fff', fontWeight: 600,
                                    fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                                  }}
                                >
                                  {isSyncing ? '...' : '🔄 Sync Now'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Child Class */}
                      {available.length > 0 && (
                        <AddChildDropdown
                          available={available}
                          onAdd={(classId) => handleAddChild(bp.id, classId)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

const Stat = ({ label, value }) => (
  <div style={{ textAlign: 'center', minWidth: 56 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: SLATE_900 }}>{value}</div>
    <div style={{ fontSize: 10, color: SLATE_400, fontWeight: 600 }}>{label}</div>
  </div>
);

const FlowDiagram = ({ bp, children, getSourceClassName }) => (
  <div style={{
    background: SLATE_50, borderRadius: 12, padding: 20,
    border: `1px dashed ${SLATE_200}`, position: 'relative', overflow: 'auto',
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: SLATE_400, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Blueprint Flow
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 'fit-content' }}>
      {/* Blueprint Source */}
      <div style={{
        padding: '14px 18px', borderRadius: 12,
        background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
        color: '#fff', minWidth: 160, textAlign: 'center', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
      }}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>📘</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{bp.name}</div>
        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
          {(bp.snapshot?.modules || []).length} modules &middot; Source: {getSourceClassName(bp.sourceClassId)}
        </div>
      </div>

      {children.length > 0 && (
        <>
          {/* Arrow */}
          <div style={{
            display: 'flex', alignItems: 'center', alignSelf: 'center',
            padding: '0 8px', flexShrink: 0,
          }}>
            <div style={{ width: 40, height: 2, background: BLUE }} />
            <div style={{
              width: 0, height: 0,
              borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
              borderLeft: `8px solid ${BLUE}`,
            }} />
          </div>

          {/* Children */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {children.map((child) => (
              <div key={child.id} style={{
                padding: '10px 16px', borderRadius: 10,
                background: '#fff', border: `1px solid ${SLATE_200}`,
                minWidth: 140, textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>📚</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: SLATE_900 }}>{child.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {children.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', alignSelf: 'center',
          padding: '0 16px', color: SLATE_400, fontSize: 13, fontStyle: 'italic',
        }}>
          ← No child classes linked
        </div>
      )}
    </div>
  </div>
);

const AddChildDropdown = ({ available, onAdd }) => {
  const [selectedId, setSelectedId] = useState('');
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'center',
      padding: '14px 16px', borderRadius: 10,
      background: SLATE_50, border: `1px solid ${SLATE_100}`,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: SLATE_700, whiteSpace: 'nowrap' }}>
        ➕ Add Class:
      </span>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: 8,
          border: `1px solid ${SLATE_200}`, fontSize: 13,
          background: '#fff', color: SLATE_900, cursor: 'pointer',
        }}
      >
        <option value="">Select a class to link...</option>
        {available.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button
        onClick={() => { if (selectedId) { onAdd(selectedId); setSelectedId(''); } }}
        disabled={!selectedId}
        style={{
          padding: '8px 18px', borderRadius: 8, border: 'none',
          background: selectedId ? BLUE : SLATE_200,
          color: selectedId ? '#fff' : SLATE_400,
          fontWeight: 700, fontSize: 13, cursor: selectedId ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
      >
        Link & Sync
      </button>
    </div>
  );
};

export default BlueprintManager;
