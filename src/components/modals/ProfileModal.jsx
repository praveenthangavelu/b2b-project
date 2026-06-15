import { C } from '../../constants/theme';
import { getInitials } from '../../utils/format';

export function ProfileModal({ open, onClose, user }) {
  if (!open) return null;
  const initials = getInitials(user?.name);
  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,30,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20, animation: 'ov .2s ease both' }}>
      <div className="mo" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e2e6ff', borderRadius: 18, padding: 24, boxShadow: '0 24px 64px -12px rgba(16,24,64,.25)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#1a2050', fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800 }}>Profile Details</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8892cc', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid #eef1f8', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${C.brand},#7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 12, boxShadow: '0 4px 14px rgba(57,83,251,.25)' }}>
            {initials}
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a2050' }}>{user?.name || 'User'}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5c6499' }}>{user?.email || 'No email provided'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#8892cc', fontWeight: 500 }}>Current Plan</span>
            <span style={{ background: `${C.brand}15`, color: C.brand, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {user?.plan ? `${user.plan} Plan` : 'Pro Plan'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#8892cc', fontWeight: 500 }}>Credits Available</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2050' }}>🪙 {(user?.credits || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#8892cc', fontWeight: 500 }}>Member Since</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2050' }}>{createdDate}</span>
          </div>
        </div>
        <button onClick={onClose} className="bb" style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700 }}>
          Close Profile
        </button>
      </div>
    </div>
  );
}
