import { useState } from 'react';
import { C } from '../../constants/theme';
import { PACKAGES } from '../../constants/fields';

const fmt = (n) => n.toLocaleString();

export function BuyCreditsModal({ open, onClose, onPurchase }) {
  const [selected, setSelected] = useState('p5k');
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const pkg = PACKAGES.find((p) => p.id === selected);

  const confirm = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    onPurchase(pkg);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,30,.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20, animation: 'ov .2s ease both' }}>
      <div className="mo" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#161c3d', border: '1px solid #2a3360', borderRadius: 18, padding: 24, boxShadow: '0 24px 64px -12px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800 }}>Buy credits</h2>
            <p style={{ margin: '4px 0 0', color: '#8b95c9', fontSize: 13 }}>Credits never expire. Used for lookups &amp; validation.</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#5b66a0', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          {PACKAGES.map((p) => {
            const active = p.id === selected;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', padding: '14px 16px', borderRadius: 12, background: active ? `${C.brand}1f` : '#1c2347', border: `1.5px solid ${active ? C.brand : '#2a3360'}`, transition: 'all .15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? C.brand : '#3a4470'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.brand }} />}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{fmt(p.credits)} credits</div>
                    <div style={{ color: '#8b95c9', fontSize: 12 }}>${p.perK.toFixed(2)} per 1k</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.tag && <span style={{ background: `${C.brand}26`, color: '#818cf8', border: `1px solid ${C.brand}44`, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>{p.tag}</span>}
                  <span style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>${p.price}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={confirm} disabled={busy} style={{ marginTop: 20, width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: busy ? 'default' : 'pointer', background: busy ? '#2a3360' : `linear-gradient(90deg,${C.brand},#818cf8)`, color: '#fff', fontSize: 15, fontWeight: 700, transition: 'opacity .15s ease' }}>
          {busy ? 'Processing…' : `Pay $${pkg.price} — add ${fmt(pkg.credits)} credits`}
        </button>
        <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#5b66a0', fontSize: 11 }}>Secure checkout. Cancel anytime.</p>
      </div>
    </div>
  );
}
