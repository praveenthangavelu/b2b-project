import { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

export function SettingsModal({ open, onClose, user, token, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && user) {
      setName(user.name || '');
      setPassword('');
      setConfirmPassword('');
      setErr('');
      setSuccess('');
    }
  }, [open, user]);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');
    if (!name.trim()) { setErr('Name is required'); return; }
    if (password && password.length < 8) { setErr('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setErr('Passwords do not match'); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ name: name.trim(), ...(password ? { password } : {}) }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update settings');
      }
      const data = await res.json();
      if (data.user) {
        onUpdateUser(data.user);
        setSuccess('Settings updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,30,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20, animation: 'ov .2s ease both' }}>
      <div className="mo" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e2e6ff', borderRadius: 18, padding: 24, boxShadow: '0 24px 64px -12px rgba(16,24,64,.25)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#1a2050', fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800 }}>Account Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8892cc', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#5c6499' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" className="inp" style={{ padding: '10px 12px', borderRadius: 9, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#5c6499' }}>New Password (optional)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="inp" style={{ padding: '10px 12px', borderRadius: 9, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#5c6499' }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="inp" style={{ padding: '10px 12px', borderRadius: 9, fontSize: 13 }} />
          </div>
          {err && <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>{err}</div>}
          {success && <div style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>{success}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="bs" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700 }}>Cancel</button>
            <button type="submit" disabled={busy} className="bb" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700 }}>{busy ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
