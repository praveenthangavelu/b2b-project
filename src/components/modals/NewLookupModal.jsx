import { useDismiss } from '../../hooks/useDismiss';

const BRAND = '#3953fb';

const tbOverlay = { position: 'fixed', inset: 0, background: 'rgba(16,24,64,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 300 };
const tbIconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#9aa3c7', fontSize: 22, lineHeight: 1, padding: 0 };
const tbLookupCard = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', borderRadius: 12, background: '#f8f9ff', border: '1px solid #e6e9ff', cursor: 'pointer' };

const LOOKUP_TYPES = [
  { id: 'email',    icon: '✉️', title: 'Email lookup',    sub: 'Find phone, LinkedIn & more from an email', nav: 'email' },
  { id: 'linkedin', icon: '💼', title: 'LinkedIn lookup', sub: 'Get email & phone from a LinkedIn URL',      nav: 'linkedin' },
  { id: 'bulk',     icon: '📋', title: 'Bulk validation', sub: 'Verify a list of emails at once',            nav: 'validate' },
];

export function NewLookupModal({ open, onClose, onNav }) {
  const ref = useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div style={tbOverlay}>
      <div ref={ref} style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 24px 64px -12px rgba(16,24,64,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: '#1e2547' }}>New lookup</h2>
          <button onClick={onClose} style={tbIconBtn}>×</button>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          {LOOKUP_TYPES.map((t) => (
            <button key={t.id} onClick={() => { onNav(t.nav); onClose(); }} style={tbLookupCard}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e2547' }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: '#8b93b8' }}>{t.sub}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: BRAND, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
