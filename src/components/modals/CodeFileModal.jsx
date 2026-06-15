import { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

export function CodeFileModal({ open, path, onClose }) {
  const [currentPath, setCurrentPath] = useState(path);
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && path) setCurrentPath(path);
  }, [open, path]);

  useEffect(() => {
    if (!open || !currentPath) return;
    async function loadContent() {
      setLoading(true);
      setError('');
      setContent('');
      setItems([]);
      setType('');
      try {
        const token = localStorage.getItem('prospecto_token');
        const res = await fetch(`${API_BASE}/files/content?path=${encodeURIComponent(currentPath)}`, {
          headers: { Authorization: 'Bearer ' + token },
        });
        if (res.ok) {
          const data = await res.json();
          setType(data.type);
          if (data.type === 'file') setContent(data.content);
          else setItems(data.items || []);
        } else {
          const errData = await res.json();
          setError(errData.error || 'Failed to read path');
        }
      } catch {
        setError('Network error reading path');
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [open, currentPath]);

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/');
    if (parts.length <= 1) return;
    setCurrentPath(parts.slice(0, -1).join('/'));
  };

  const hasParent = currentPath && currentPath.includes('/');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,30,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20, animation: 'ov .2s ease both' }}>
      <div className="mo" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 900, background: '#f4f6fc', border: '1px solid #e2e6ff', borderRadius: 24, boxShadow: '0 24px 64px -12px rgba(16,24,64,.25)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eef0f6', background: '#fff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0d1330', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {type === 'folder' ? '📁' : '📄'} {currentPath.split('/').pop() || 'Workspace'}
            </h3>
            <span style={{ fontSize: 11.5, color: '#6b7280' }}>{currentPath}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {type === 'file' && content && (
              <button onClick={handleCopy} style={{ background: copied ? '#22c55e' : '#3953fb', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', transition: 'background .15s' }}>
                {copied ? '✓ Copied' : 'Copy Code'}
              </button>
            )}
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8892cc', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 20, background: type === 'file' ? '#0d1330' : '#fff', color: type === 'file' ? '#f8f9fa' : '#0d1330', fontFamily: type === 'file' ? 'monospace' : 'inherit', fontSize: 13, lineHeight: 1.5 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#3953fb' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#3953fb', animation: 'sp 1s linear infinite', marginBottom: 12 }} />
              <div>Loading...</div>
            </div>
          )}
          {error && <div style={{ color: '#ef4444', padding: 20, textAlign: 'center', fontWeight: 600 }}>⚠️ {error}</div>}
          {!loading && type === 'file' && content && <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content}</pre>}
          {!loading && type === 'folder' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hasParent && (
                <div onClick={navigateUp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px dashed #d4dbf3', background: '#f8f9fc', cursor: 'pointer', fontWeight: 700, color: '#3953fb' }}>
                  <span>⬆</span><span>.. (Parent Directory)</span>
                </div>
              )}
              {items.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>This folder is empty</div>}
              {items.map(item => (
                <div key={item.path} onClick={() => setCurrentPath(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #e6e9f2', background: '#fff', cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f4f6fc'; e.currentTarget.style.borderColor = '#c7ceff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e6e9f2'; }}
                >
                  <span style={{ fontSize: 16 }}>{item.type === 'folder' ? '📁' : '📄'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0d1330' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{item.path}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#3953fb', fontWeight: 700 }}>Open →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
