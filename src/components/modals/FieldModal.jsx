import { useState } from 'react';
import { C } from '../../constants/theme';

export function FieldModal({ fields, onClose, onConfirm, initial }) {
  const [sel, setSel] = useState(() => initial && initial.length ? initial : fields.slice(0, 5).map(f => f.id));
  const allIds = fields.map(f => f.id);
  const allOn = allIds.every(id => sel.includes(id));
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,50,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'ov .2s ease both' }}>
      <div className="mo" style={{ background: C.w, borderRadius: 16, boxShadow: '0 20px 70px rgba(10,15,50,.28)', width: 620, maxWidth: '92%', maxHeight: '82%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px 11px', borderBottom: `1px solid ${C.g150}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.g800 }}>Select Fields to Generate</div>
              <div style={{ fontSize: 10, color: C.g400, marginTop: 2 }}>Choose which data points to retrieve for each contact</div>
            </div>
            <button onClick={onClose} style={{ width: 27, height: 27, borderRadius: '50%', border: `1.5px solid ${C.g150}`, background: C.g50, cursor: 'pointer', fontSize: 14, color: C.g400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 10 }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <button onClick={() => setSel(allIds)} style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 7, cursor: 'pointer', border: `1.5px solid ${C.brand}`, background: allOn ? C.brand : C.lt, color: allOn ? '#fff' : C.brand, transition: 'all .14s' }}>All</button>
            <button onClick={() => setSel([])} className="bs" style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 7 }}>Clear</button>
            <span style={{ fontSize: 10, color: C.g400 }}>{sel.length} / {fields.length} selected</span>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '14px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {fields.map(f => {
              const on = sel.includes(f.id);
              return (
                <div key={f.id} className="fc" onClick={() => toggle(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 11, border: `2px solid ${on ? C.brand : C.g150}`, background: on ? C.lt : C.w, boxShadow: on ? `0 0 0 1px ${C.mid},0 3px 12px rgba(57,83,251,.1)` : '0 1px 4px rgba(57,83,251,.04)' }}>
                  <div style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `2px solid ${on ? C.brand : C.g300}`, background: on ? C.brand : C.w, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .14s' }}>
                    {on && <span className="ck" style={{ color: '#fff', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: on ? `${C.brand}18` : C.g50, border: `1.5px solid ${on ? `${C.brand}33` : C.g150}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all .14s' }}>{f.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: on ? C.brand : C.g700, marginBottom: 1 }}>{f.label}</div>
                    <div style={{ fontSize: 9, color: C.g400, lineHeight: 1.3 }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {sel.length > 0 && (
            <div className="fi" style={{ marginTop: 11, padding: '8px 12px', background: C.lt, border: `1px solid ${C.mid}`, borderRadius: 9, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.brand, marginRight: 2 }}>Will generate:</span>
              {sel.map(id => { const f = fields.find(x => x.id === id); return f ? <span key={id} style={{ fontSize: 9, fontWeight: 700, color: C.brand, background: C.w, border: `1px solid ${C.mid}`, borderRadius: 20, padding: '2px 8px' }}>{f.icon} {f.label}</span> : null; })}
            </div>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.g150}`, display: 'flex', gap: 8, flexShrink: 0, background: C.g50 }}>
          <button onClick={onClose} className="bs" style={{ flex: 1, borderRadius: 9, padding: '10px', fontSize: 12, fontWeight: 700 }}>Cancel</button>
          <button onClick={() => onConfirm(sel)} disabled={sel.length === 0} className="bb" style={{ flex: 2, borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 800 }}>
            {sel.length === 0 ? 'Select at least one field' : `Confirm ${sel.length} Field${sel.length > 1 ? 's' : ''} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
