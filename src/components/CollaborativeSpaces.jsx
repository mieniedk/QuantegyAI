import React, { useState, useMemo } from 'react';
import {
  getClassSpaces,
  createSpace,
  deleteSpace,
  addMemberToSpace,
  removeMemberFromSpace,
  getPostsForSpace,
  addSpacePost,
  deleteSpacePost,
} from '../utils/storage';
import RichTextEditor from './RichTextEditor';

/* ═══════════════════════════════════════════════════════════
   COLLABORATIVE SPACES — Group workspaces within a class
   Teacher creates spaces, assigns students; members share a feed.
   ═══════════════════════════════════════════════════════════ */

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#14b8a6,#06b6d4)', 'linear-gradient(135deg,#f59e0b,#eab308)',
  'linear-gradient(135deg,#10b981,#22c55e)', 'linear-gradient(135deg,#8b5cf6,#a855f7)',
];
function avatarColor(id) {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function CollaborativeSpaces({ classId, cls, isTeacher = true, studentId = null, studentName = null }) {
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(r => r + 1);

  const spaces = useMemo(() => getClassSpaces(classId), [classId, refresh]);
  const students = cls?.students || [];
  const mySpaces = isTeacher ? spaces : spaces.filter(s => (s.memberIds || []).includes(studentId));

  const [showCreate, setShowCreate] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);

  return (
    <section aria-labelledby="spaces-heading">
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 id="spaces-heading" style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Collaborative Spaces</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            {isTeacher
              ? 'Create group workspaces for students to collaborate and share.'
              : 'Your group spaces — post updates and collaborate with teammates.'}
          </p>
        </div>
        {isTeacher && !showCreate && (
          <button
            type="button"
            aria-label="Create new collaborative space"
            onClick={() => setShowCreate(true)}
            style={{
              padding: '12px 22px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            + New Space
          </button>
        )}
      </div>

      {showCreate && isTeacher && (
        <CreateSpaceForm
          classId={classId}
          students={students}
          onCreated={(space) => {
            setSelectedSpaceId(space.id);
            setShowCreate(false);
            bump();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {spaces.length === 0 && !showCreate ? (
        <div style={{
          padding: 48,
          textAlign: 'center',
          background: 'linear-gradient(135deg,#f8fafc,#f5f3ff)',
          borderRadius: 16,
          border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#334155', marginBottom: 8 }}>No collaborative spaces yet</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            {isTeacher ? 'Create a space to give students a place to work together.' : 'Your teacher will add you to a space.'}
          </div>
          {isTeacher && (
            <button type="button" onClick={() => setShowCreate(true)} style={{
              padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              Create First Space
            </button>
          )}
        </div>
      ) : (
        <div role="list" aria-label="Collaborative spaces" style={{ display: 'grid', gap: 16 }}>
          {mySpaces.length === 0 && !isTeacher ? (
            <div style={{ padding: 24, textAlign: 'center', background: '#f8fafc', borderRadius: 12, color: '#64748b', fontSize: 14 }}>
              You are not in any spaces yet. Ask your teacher to add you.
            </div>
          ) : (
            mySpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                students={students}
                classId={classId}
                isTeacher={isTeacher}
                studentId={studentId}
                studentName={studentName}
                isExpanded={selectedSpaceId === space.id}
                onToggle={() => setSelectedSpaceId(selectedSpaceId === space.id ? null : space.id)}
                onUpdate={bump}
                refreshKey={refresh}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function CreateSpaceForm({ classId, students, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleStudent = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const space = createSpace({
      classId,
      name: name.trim(),
      description: description,
      memberIds: selectedIds,
    });
    onCreated(space);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      border: '2px solid #e0e7ff',
      boxShadow: '0 4px 20px rgba(99,102,241,0.1)',
      marginBottom: 24,
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#4338ca', marginBottom: 16 }}>Create Collaborative Space</div>
      <label htmlFor="space-name" className="sr-only">Space name</label>
      <input id="space-name"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Space name (e.g. Study Group A)" aria-label="Space name"
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #e2e8f0',
          fontSize: 16, fontWeight: 600, marginBottom: 12, boxSizing: 'border-box',
        }}
      />
      <label htmlFor="space-desc" className="sr-only">Description</label>
      <div style={{ marginBottom: 16 }}>
        <RichTextEditor value={description} onChange={setDescription} placeholder="Optional description… Or ✏️ Draw to add a drawing." compact minHeight={60} prominentDrawButton />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Add Members</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {students.map((s) => {
            const id = typeof s === 'string' ? s : s.id;
            const label = typeof s === 'string' ? s : s.name;
            const checked = selectedIds.includes(id);
            return (
              <label key={id} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                background: checked ? '#eef2ff' : '#f8fafc', borderRadius: 10,
                border: `2px solid ${checked ? '#6366f1' : '#e2e8f0'}`, cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
              }}>
                <input type="checkbox" checked={checked} onChange={() => toggleStudent(id)} />
                {label}
              </label>
            );
          })}
        </div>
        {students.length === 0 && (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>No students in class yet. Add students first.</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
          background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!name.trim()} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: name.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0',
          color: name.trim() ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: name.trim() ? 'pointer' : 'default',
        }}>
          Create Space
        </button>
      </div>
    </div>
  );
}

function SpaceCard({ space, students, classId, isTeacher, studentId, studentName, isExpanded, onToggle, onUpdate, refreshKey }) {
  const [postText, setPostText] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  const posts = useMemo(() => getPostsForSpace(space.id), [space.id, refreshKey]);

  const memberIds = space.memberIds || [];
  const memberList = memberIds.map(id => students.find(s => (typeof s === 'string' ? s : s.id) === id)).filter(Boolean);
  const canPost = isTeacher || memberIds.includes(studentId);
  const userId = isTeacher ? 'teacher' : studentId;
  const userName = isTeacher ? 'Teacher' : (studentName || 'Student');

  const handlePost = () => {
    if (!postText.replace(/<[^>]*>/g, '').trim() || !canPost) return;
    addSpacePost(space.id, { body: postText, authorId: userId, authorName: userName });
    setPostText('');
    onUpdate();
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: isExpanded ? '2px solid #6366f1' : '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
        onClick={onToggle}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          color: '#fff',
        }}>
          👥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{space.name}</div>
          {space.description && (
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{space.description}</div>
          )}
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            {memberList.length} members · {posts.length} posts
          </div>
        </div>
        <span style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: isExpanded ? '#eef2ff' : '#6366f1', color: isExpanded ? '#6366f1' : '#fff',
        }}>
          {isExpanded ? '▲ Close' : '▶ Open'}
        </span>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#fafbfd' }}>
          {/* Members */}
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setShowMembers(s => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              👥 Members {showMembers ? '▲' : '▶'}
            </button>
            {showMembers && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {memberList.map((s) => {
                  const id = typeof s === 'string' ? s : s.id;
                  const label = typeof s === 'string' ? s : s.name;
                  return (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                      background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
                      fontSize: 13, fontWeight: 600, color: '#334155',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: avatarColor(id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11, fontWeight: 800,
                      }}>
                        {label?.[0]?.toUpperCase() || '?'}
                      </div>
                      {label}
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => { removeMemberFromSpace(space.id, id); onUpdate(); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 14 }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
                {isTeacher && students.length > 0 && (
                  <AddMemberDropdown spaceId={space.id} students={students} memberIds={memberIds} onAdd={onUpdate} />
                )}
              </div>
            )}
          </div>

          {/* Feed */}
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: '#334155' }}>Feed</div>

          {canPost && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <RichTextEditor value={postText} onChange={setPostText} placeholder="Share an update with the group… Or ✏️ Draw to add a drawing." compact minHeight={60} prominentDrawButton />
              </div>
              <button
                type="button"
                onClick={handlePost}
                disabled={!postText.replace(/<[^>]*>/g, '').trim()}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: postText.replace(/<[^>]*>/g, '').trim() ? '#6366f1' : '#e2e8f0',
                  color: postText.replace(/<[^>]*>/g, '').trim() ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 13,
                  cursor: postText.replace(/<[^>]*>/g, '').trim() ? 'pointer' : 'default',
                }}
              >
                Post
              </button>
            </div>
          )}

          {posts.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
              No posts yet. Be the first to share!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map((post) => (
                <div key={post.id} style={{
                  padding: 14, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                  display: 'flex', gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: post.authorId === 'teacher' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : avatarColor(post.authorId),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                  }}>
                    {post.authorName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                      <strong>{post.authorName}</strong> · {timeAgo(post.createdAt)}
                    </div>
                    <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {post.body}
                    </div>
                  </div>
                  {(isTeacher || post.authorId === studentId) && (
                    <button
                      type="button"
                      onClick={() => { deleteSpacePost(post.id); onUpdate(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 14 }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isTeacher && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => { if (confirm('Delete this space and all its posts?')) { deleteSpace(space.id); onUpdate(); } }}
                style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                🗑 Delete Space
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMemberDropdown({ spaceId, students, memberIds, onAdd }) {
  const [show, setShow] = useState(false);
  const toAdd = students.filter(s => {
    const id = typeof s === 'string' ? s : s.id;
    return !memberIds.includes(id);
  });

  if (toAdd.length === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          padding: '6px 12px', borderRadius: 8, border: '1px dashed #6366f1',
          background: '#f5f3ff', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}
      >
        + Add member
      </button>
      {show && (
        <div style={{
          position: 'absolute', top: 32, left: 0, background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 160,
        }}>
          {toAdd.map((s) => {
            const id = typeof s === 'string' ? s : s.id;
            const label = typeof s === 'string' ? s : s.name;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { addMemberToSpace(spaceId, id); setShow(false); onAdd(); }}
                style={{
                  display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left',
                  background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#334155',
                }}
              >
                + {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
