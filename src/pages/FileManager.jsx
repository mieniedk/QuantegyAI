import React, { useState, useEffect, useCallback, useRef } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import {
  getFileLibrary, saveFileToLibrary, deleteFileFromLibrary,
  createFolder, getFilesInFolder, moveFile, renameFile, getFileUsage,
} from '../utils/storage';

const QUOTA_MB = 500;

function getFileIcon(file) {
  if (file.type === 'folder') return '\uD83D\uDCC1';
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) return '\uD83D\uDDBC\uFE0F';
  if (mime.startsWith('video/')) return '\uD83C\uDFA5';
  if (mime.startsWith('audio/')) return '\uD83C\uDFB5';
  if (mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) return '\uD83D\uDCCA';
  if (mime.includes('pdf')) return '\uD83D\uDCC4';
  return '\uD83D\uDCC4';
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTypeName(file) {
  if (file.type === 'folder') return 'Folder';
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) return 'Image';
  if (mime.startsWith('video/')) return 'Video';
  if (mime.startsWith('audio/')) return 'Audio';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) return 'Spreadsheet';
  if (mime.includes('text') || mime.includes('json') || mime.includes('javascript')) return 'Text';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return 'Archive';
  return 'Document';
}

const styles = {
  page: { minHeight: '100%' },
  quotaBar: {
    background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20,
    border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16,
  },
  quotaTrack: {
    flex: 1, height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap',
  },
  btn: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    color: '#334155', transition: 'all 0.15s',
  },
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    color: '#fff', transition: 'all 0.15s',
  },
  btnDanger: {
    padding: '6px 14px', borderRadius: 8, border: 'none', background: '#dc2626',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff',
  },
  container: {
    display: 'flex', gap: 0, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    overflow: 'hidden', minHeight: 520,
  },
  sidebar: {
    width: 240, minWidth: 240, borderRight: '1px solid #e2e8f0', background: '#fafbfc',
    padding: '16px 0', overflowY: 'auto',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  breadcrumb: {
    padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex',
    alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b', flexWrap: 'wrap',
  },
  breadcrumbLink: {
    color: '#2563eb', cursor: 'pointer', fontWeight: 500, background: 'none',
    border: 'none', fontSize: 13, padding: 0,
  },
  sortBar: {
    padding: '8px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12, padding: 20,
  },
  gridCard: (active, dragOver) => ({
    border: `2px solid ${dragOver ? '#2563eb' : active ? '#2563eb' : '#e2e8f0'}`,
    borderRadius: 10, padding: 16, cursor: 'pointer', textAlign: 'center',
    background: active ? '#eff6ff' : dragOver ? '#eff6ff' : '#fff',
    transition: 'all 0.15s', position: 'relative',
  }),
  listTable: { width: '100%', borderCollapse: 'collapse' },
  listRow: (active, dragOver) => ({
    cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
    background: active ? '#eff6ff' : dragOver ? '#eff6ff' : 'transparent',
    transition: 'background 0.1s',
  }),
  listCell: { padding: '10px 16px', fontSize: 13, color: '#334155' },
  preview: {
    width: 320, minWidth: 320, borderLeft: '1px solid #e2e8f0', background: '#fafbfc',
    padding: 20, overflowY: 'auto',
  },
  folderItem: (active, dragOver, depth) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px 7px ' + (16 + depth * 16) + 'px',
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? '#1d4ed8' : '#475569',
    background: active ? '#eff6ff' : dragOver ? '#dbeafe' : 'transparent',
    transition: 'background 0.1s',
  }),
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 10000,
  },
  dialog: {
    background: '#fff', borderRadius: 14, padding: 28, width: 420, maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 60, color: '#94a3b8', gap: 10,
  },
};

const FolderTreeItem = ({ folder, depth, allFiles, currentFolderId, onNavigate, onDrop }) => {
  const [expanded, setExpanded] = useState(false);
  const isActive = currentFolderId === folder.id;
  const children = allFiles.filter(f => f.type === 'folder' && f.parentId === folder.id);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div
        onClick={() => onNavigate(folder.id)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e, folder.id); }}
        style={styles.folderItem(isActive, dragOver, depth)}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
        onMouseLeave={(e) => { if (!isActive && !dragOver) e.currentTarget.style.background = 'transparent'; }}
      >
        {children.length > 0 ? (
          <span
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ cursor: 'pointer', fontSize: 9, color: '#94a3b8', width: 12, textAlign: 'center', flexShrink: 0 }}
          >
            {expanded ? '\u25BC' : '\u25B6'}
          </span>
        ) : (
          <span style={{ width: 12, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 15 }}>{'\uD83D\uDCC1'}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</span>
      </div>
      {expanded && children.map(child => (
        <FolderTreeItem
          key={child.id} folder={child} depth={depth + 1}
          allFiles={allFiles} currentFolderId={currentFolderId}
          onNavigate={onNavigate} onDrop={onDrop}
        />
      ))}
    </div>
  );
};

const MoveDialog = ({ file, allFiles, ownerId, onMove, onClose }) => {
  const [target, setTarget] = useState(null);
  const folders = allFiles.filter(f => f.type === 'folder' && f.id !== file.id);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
          Move "{file.name}"
        </h3>
        <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
          <div
            onClick={() => setTarget(null)}
            style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: target === null ? '#eff6ff' : 'transparent',
              color: target === null ? '#1d4ed8' : '#334155',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {'\uD83C\uDFE0'} Root (My Files)
          </div>
          {folders.map(f => (
            <div
              key={f.id}
              onClick={() => setTarget(f.id)}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                background: target === f.id ? '#eff6ff' : 'transparent',
                color: target === f.id ? '#1d4ed8' : '#334155',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {'\uD83D\uDCC1'} {f.name}
            </div>
          ))}
          {folders.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No folders available</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={styles.btn}>Cancel</button>
          <button type="button" onClick={() => onMove(file.id, target)} style={styles.btnPrimary}>
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};

const PreviewPanel = ({ file, onClose, onDownload, onDelete, onRename, onMove }) => {
  const [renaming, setRenaming] = useState(false);
  const [rName, setRName] = useState(file.name);
  const mime = (file.mimeType || '').toLowerCase();

  const renderPreview = () => {
    if (file.type === 'folder') {
      return <div style={{ fontSize: 64, textAlign: 'center', padding: 20 }}>{'\uD83D\uDCC1'}</div>;
    }
    if (mime.startsWith('image/') && file.url) {
      return (
        <img
          src={file.url} alt={file.name}
          style={{ width: '100%', borderRadius: 8, objectFit: 'contain', maxHeight: 240 }}
        />
      );
    }
    if (mime.startsWith('video/') && file.url) {
      return (
        <video
          controls src={file.url}
          style={{ width: '100%', borderRadius: 8, maxHeight: 240 }}
        />
      );
    }
    if (mime.startsWith('audio/') && file.url) {
      return (
        <div style={{ padding: '20px 0' }}>
          <audio controls src={file.url} style={{ width: '100%' }} />
        </div>
      );
    }
    if ((mime.includes('text') || mime.includes('json') || mime.includes('javascript') || mime.includes('csv')) && file.url) {
      try {
        const content = atob(file.url.split(',')[1] || '');
        return (
          <pre style={{
            background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 11,
            maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            border: '1px solid #e2e8f0',
          }}>
            {content.slice(0, 3000)}{content.length > 3000 ? '\n...' : ''}
          </pre>
        );
      } catch (err) { console.debug('Base64 decode failed:', err); }
    }
    return <div style={{ fontSize: 64, textAlign: 'center', padding: 20 }}>{getFileIcon(file)}</div>;
  };

  return (
    <div style={styles.preview}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Details</span>
        <button type="button" onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}
        >
          &times;
        </button>
      </div>
      {renderPreview()}
      <div style={{ marginTop: 16 }}>
        {renaming ? (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input
              value={rName} onChange={e => setRName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(file.id, rName); setRenaming(false); } if (e.key === 'Escape') setRenaming(false); }}
              autoFocus
              style={{ ...styles.input, flex: 1, padding: '6px 10px', fontSize: 13 }}
            />
            <button type="button" onClick={() => { onRename(file.id, rName); setRenaming(false); }}
              style={{ ...styles.btnPrimary, padding: '6px 12px', fontSize: 12 }}>Save</button>
          </div>
        ) : (
          <h4
            style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', cursor: 'pointer' }}
            onClick={() => { setRenaming(true); setRName(file.name); }}
            title="Click to rename"
          >
            {file.name}
          </h4>
        )}
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 2 }}>
          <div><strong>Type:</strong> {getTypeName(file)}</div>
          {file.type !== 'folder' && <div><strong>Size:</strong> {formatBytes(file.size)}</div>}
          <div><strong>Uploaded:</strong> {formatDate(file.uploadedAt)}</div>
          {file.mimeType && <div><strong>MIME:</strong> {file.mimeType}</div>}
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {file.type !== 'folder' && file.url && (
          <button type="button" onClick={() => onDownload(file)}
            style={{ ...styles.btn, justifyContent: 'center', width: '100%' }}>
            {'\u2B07\uFE0F'} Download
          </button>
        )}
        <button type="button" onClick={() => onMove(file)}
          style={{ ...styles.btn, justifyContent: 'center', width: '100%' }}>
          {'\uD83D\uDCC2'} Move to...
        </button>
        <button type="button" onClick={() => { setRenaming(true); setRName(file.name); }}
          style={{ ...styles.btn, justifyContent: 'center', width: '100%' }}>
          {'\u270F\uFE0F'} Rename
        </button>
        <button type="button" onClick={() => onDelete(file)}
          style={{ ...styles.btn, justifyContent: 'center', width: '100%', color: '#dc2626', borderColor: '#fecaca' }}>
          {'\uD83D\uDDD1\uFE0F'} Delete
        </button>
      </div>
    </div>
  );
};

const FileManager = () => {
  const username = localStorage.getItem('quantegy-teacher-user');
  const ownerId = username || 'default';

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [movingFile, setMovingFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fileInputRef = useRef(null);

  const refresh = useCallback(() => {
    const files = getFileLibrary(ownerId);
    setAllFiles(files);
    if (selectedFile) {
      const updated = files.find(f => f.id === selectedFile.id);
      setSelectedFile(updated || null);
    }
  }, [ownerId, selectedFile?.id]);

  useEffect(() => { setAllFiles(getFileLibrary(ownerId)); }, [ownerId]);

  const currentFiles = allFiles.filter(f => (f.parentId || null) === (currentFolderId || null));

  const sorted = [...currentFiles].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    let cmp = 0;
    switch (sortBy) {
      case 'name': cmp = (a.name || '').localeCompare(b.name || ''); break;
      case 'size': cmp = (a.size || 0) - (b.size || 0); break;
      case 'date': cmp = new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0); break;
      case 'type': cmp = getTypeName(a).localeCompare(getTypeName(b)); break;
      default: break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const buildBreadcrumb = () => {
    const path = [];
    let fId = currentFolderId;
    while (fId) {
      const folder = allFiles.find(f => f.id === fId);
      if (!folder) break;
      path.unshift(folder);
      fId = folder.parentId || null;
    }
    return path;
  };
  const breadcrumb = buildBreadcrumb();

  const usage = getFileUsage(ownerId);
  const usedMB = parseFloat(usage.totalMB);
  const usagePct = Math.min((usedMB / QUOTA_MB) * 100, 100);
  const usageColor = usagePct > 80 ? '#dc2626' : usagePct > 50 ? '#f59e0b' : '#22c55e';

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        saveFileToLibrary({
          ownerId,
          name: file.name,
          type: 'file',
          parentId: currentFolderId || null,
          size: file.size,
          url: reader.result,
          mimeType: file.type,
        });
        setAllFiles(getFileLibrary(ownerId));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(ownerId, newFolderName.trim(), currentFolderId || null);
    setNewFolderName('');
    setShowNewFolder(false);
    setAllFiles(getFileLibrary(ownerId));
  };

  const handleDelete = (file) => {
    const toDelete = [file.id];
    const findChildren = (parentId) => {
      allFiles.filter(f => f.parentId === parentId).forEach(f => {
        toDelete.push(f.id);
        if (f.type === 'folder') findChildren(f.id);
      });
    };
    if (file.type === 'folder') findChildren(file.id);
    toDelete.forEach(id => deleteFileFromLibrary(id));
    setDeleteConfirm(null);
    setSelectedFile(null);
    setAllFiles(getFileLibrary(ownerId));
  };

  const handleRename = (fileId, newName) => {
    if (!newName.trim()) return;
    renameFile(fileId, newName.trim());
    setAllFiles(getFileLibrary(ownerId));
  };

  const handleMove = (fileId, newParentId) => {
    moveFile(fileId, newParentId);
    setShowMoveDialog(false);
    setMovingFile(null);
    setAllFiles(getFileLibrary(ownerId));
  };

  const handleDownload = (file) => {
    if (!file.url) return;
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
    setSelectedFile(null);
  };

  const handleItemClick = (file) => {
    if (file.type === 'folder') {
      navigateToFolder(file.id);
    } else {
      setSelectedFile(prev => prev?.id === file.id ? null : file);
    }
  };

  const handleDragStart = (e, file) => {
    e.dataTransfer.setData('text/plain', file.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTreeDrop = (e, folderId) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('text/plain');
    if (fileId && fileId !== folderId) {
      moveFile(fileId, folderId);
      setAllFiles(getFileLibrary(ownerId));
    }
  };

  const handleGridDrop = (e, targetFile) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    if (targetFile?.type !== 'folder') return;
    const fileId = e.dataTransfer.getData('text/plain');
    if (fileId && fileId !== targetFile.id) {
      moveFile(fileId, targetFile.id);
      setAllFiles(getFileLibrary(ownerId));
    }
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    setDragOverId(null);
    if (e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          saveFileToLibrary({
            ownerId,
            name: file.name,
            type: 'file',
            parentId: currentFolderId || null,
            size: file.size,
            url: reader.result,
            mimeType: file.type,
          });
          setAllFiles(getFileLibrary(ownerId));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const rootFolders = allFiles.filter(f => f.type === 'folder' && !f.parentId);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sortArrow = (col) => sortBy === col ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  return (
    <TeacherLayout>
      <div style={styles.page}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
              {'\uD83D\uDCC1'} File Manager
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Upload, organize and manage your teaching files
            </p>
          </div>
        </div>

        {/* Storage Quota */}
        <div style={styles.quotaBar}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
            {'\uD83D\uDCBE'} Storage
          </span>
          <div style={styles.quotaTrack}>
            <div style={{
              width: `${usagePct}%`, height: '100%', borderRadius: 4,
              background: usageColor, transition: 'width 0.3s, background 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', fontWeight: 500 }}>
            {usedMB.toFixed(1)} MB of {QUOTA_MB} MB
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            ({usage.count} files)
          </span>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            type="file" ref={fileInputRef} onChange={handleUpload} multiple
            style={{ display: 'none' }}
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.btnPrimary}>
            {'\u2B06\uFE0F'} Upload Files
          </button>
          <button type="button" onClick={() => setShowNewFolder(true)} style={styles.btn}>
            {'\uD83D\uDCC1'} New Folder
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{ ...styles.btn, background: viewMode === 'grid' ? '#eff6ff' : '#fff', color: viewMode === 'grid' ? '#2563eb' : '#334155' }}
          >
            {'\u25A6'} Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{ ...styles.btn, background: viewMode === 'list' ? '#eff6ff' : '#fff', color: viewMode === 'list' ? '#2563eb' : '#334155' }}
          >
            {'\u2630'} List
          </button>
        </div>

        {/* Main Container */}
        <div style={styles.container}>
          {/* Folder Tree Sidebar */}
          <div style={styles.sidebar}>
            <div style={{ padding: '0 16px 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Folders
            </div>
            <div
              onClick={() => navigateToFolder(null)}
              onDragOver={(e) => { e.preventDefault(); setDragOverId('root'); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => { e.preventDefault(); setDragOverId(null); const fid = e.dataTransfer.getData('text/plain'); if (fid) { moveFile(fid, null); setAllFiles(getFileLibrary(ownerId)); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13, fontWeight: !currentFolderId ? 600 : 500,
                color: !currentFolderId ? '#1d4ed8' : '#475569',
                background: !currentFolderId ? '#eff6ff' : dragOverId === 'root' ? '#dbeafe' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (currentFolderId) e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { if (currentFolderId && dragOverId !== 'root') e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 15 }}>{'\uD83C\uDFE0'}</span>
              <span>My Files</span>
            </div>
            {rootFolders.map(folder => (
              <FolderTreeItem
                key={folder.id} folder={folder} depth={1}
                allFiles={allFiles} currentFolderId={currentFolderId}
                onNavigate={navigateToFolder}
                onDrop={handleTreeDrop}
              />
            ))}
          </div>

          {/* Main Content */}
          <div style={styles.main}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
              <button type="button" onClick={() => navigateToFolder(null)} style={styles.breadcrumbLink}>
                My Files
              </button>
              {breadcrumb.map(folder => (
                <React.Fragment key={folder.id}>
                  <span style={{ color: '#cbd5e1' }}>/</span>
                  <button type="button" onClick={() => navigateToFolder(folder.id)} style={styles.breadcrumbLink}>
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                {sorted.length} item{sorted.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Sort Bar */}
            <div style={styles.sortBar}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#94a3b8', fontWeight: 500 }}>Sort:</span>
                {['name', 'size', 'date', 'type'].map(col => (
                  <button
                    key={col} type="button"
                    onClick={() => toggleSort(col)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
                      fontWeight: sortBy === col ? 700 : 500,
                      color: sortBy === col ? '#2563eb' : '#64748b', padding: 0, textTransform: 'capitalize',
                    }}
                  >
                    {col}{sortArrow(col)}
                  </button>
                ))}
              </div>
            </div>

            {/* File Area */}
            <div
              style={{ flex: 1, overflowY: 'auto' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleMainDrop}
            >
              {sorted.length === 0 ? (
                <div style={styles.empty}>
                  <span style={{ fontSize: 48 }}>{'\uD83D\uDCC2'}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>This folder is empty</span>
                  <span style={{ fontSize: 12 }}>Upload files or create a new folder to get started</span>
                  <span style={{ fontSize: 11, marginTop: 4 }}>You can also drag & drop files here</span>
                </div>
              ) : viewMode === 'grid' ? (
                <div style={styles.grid}>
                  {sorted.map(file => (
                    <div
                      key={file.id}
                      onClick={() => handleItemClick(file)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragOver={(e) => { if (file.type === 'folder') { e.preventDefault(); setDragOverId(file.id); } }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => handleGridDrop(e, file)}
                      style={styles.gridCard(selectedFile?.id === file.id, dragOverId === file.id)}
                      onMouseEnter={(e) => { if (selectedFile?.id !== file.id) e.currentTarget.style.borderColor = '#94a3b8'; }}
                      onMouseLeave={(e) => { if (selectedFile?.id !== file.id && dragOverId !== file.id) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      {file.type !== 'folder' && file.mimeType?.startsWith('image/') && file.url ? (
                        <div style={{
                          width: '100%', height: 80, borderRadius: 6, overflow: 'hidden', marginBottom: 8,
                          background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img src={file.url} alt="" role="presentation" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{ fontSize: 36, marginBottom: 8 }}>{getFileIcon(file)}</div>
                      )}
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: '#0f172a',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        {file.type === 'folder' ? 'Folder' : formatBytes(file.size)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table style={styles.listTable}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ ...styles.listCell, fontWeight: 600, color: '#64748b', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}>Name</th>
                      <th style={{ ...styles.listCell, fontWeight: 600, color: '#64748b', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', width: 100 }}>Type</th>
                      <th style={{ ...styles.listCell, fontWeight: 600, color: '#64748b', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', width: 100 }}>Size</th>
                      <th style={{ ...styles.listCell, fontWeight: 600, color: '#64748b', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', width: 130 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(file => (
                      <tr
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDragOver={(e) => { if (file.type === 'folder') { e.preventDefault(); setDragOverId(file.id); } }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => handleGridDrop(e, file)}
                        style={styles.listRow(selectedFile?.id === file.id, dragOverId === file.id)}
                        onMouseEnter={(e) => { if (selectedFile?.id !== file.id) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { if (selectedFile?.id !== file.id && dragOverId !== file.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ ...styles.listCell, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>
                            {file.type !== 'folder' && file.mimeType?.startsWith('image/') && file.url ? (
                              <img src={file.url} alt="" role="presentation" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                            ) : getFileIcon(file)}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </span>
                        </td>
                        <td style={{ ...styles.listCell, color: '#64748b', fontSize: 12 }}>{getTypeName(file)}</td>
                        <td style={{ ...styles.listCell, textAlign: 'right', color: '#64748b', fontSize: 12 }}>
                          {file.type === 'folder' ? '\u2014' : formatBytes(file.size)}
                        </td>
                        <td style={{ ...styles.listCell, textAlign: 'right', color: '#94a3b8', fontSize: 12 }}>
                          {formatDate(file.uploadedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {selectedFile && (
            <PreviewPanel
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
              onDownload={handleDownload}
              onDelete={(f) => setDeleteConfirm(f)}
              onRename={(id, name) => { handleRename(id, name); setAllFiles(getFileLibrary(ownerId)); }}
              onMove={(f) => { setMovingFile(f); setShowMoveDialog(true); }}
            />
          )}
        </div>

        {/* New Folder Dialog */}
        {showNewFolder && (
          <div style={styles.overlay} onClick={() => setShowNewFolder(false)}>
            <div style={styles.dialog} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Create New Folder
              </h3>
              <input
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                placeholder="Folder name..."
                autoFocus
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => setShowNewFolder(false)} style={styles.btn}>Cancel</button>
                <button type="button" onClick={handleCreateFolder} style={styles.btnPrimary}>Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div style={styles.overlay} onClick={() => setDeleteConfirm(null)}>
            <div style={styles.dialog} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'File'}?
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                {deleteConfirm.type === 'folder' && ' All files inside this folder will also be deleted.'}
                {' '}This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDeleteConfirm(null)} style={styles.btn}>Cancel</button>
                <button type="button" onClick={() => handleDelete(deleteConfirm)} style={styles.btnDanger}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Dialog */}
        {showMoveDialog && movingFile && (
          <MoveDialog
            file={movingFile}
            allFiles={allFiles}
            ownerId={ownerId}
            onMove={handleMove}
            onClose={() => { setShowMoveDialog(false); setMovingFile(null); }}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default FileManager;
