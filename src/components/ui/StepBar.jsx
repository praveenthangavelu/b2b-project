import { C } from '../../constants/theme';

export function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
      {['Upload', 'Select Fields', 'Results'].map((s, i) => {
        const done = step > i, active = step === i, last = i === 2;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: last ? 0 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? C.gr : active ? C.brand : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, boxShadow: active ? `0 0 0 3px ${C.brand}28` : done ? `0 0 0 2px ${C.gr}22` : 'none', transition: 'all .3s' }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontSize: 9, fontWeight: done || active ? 700 : 500, color: done ? C.gr : active ? C.brand : C.g400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {!last && <div style={{ flex: 1, height: 2, margin: '0 7px', marginBottom: 12, background: done ? C.gr : '#e2e8f0', transition: 'background .4s', borderRadius: 99 }} />}
          </div>
        );
      })}
    </div>
  );
}
