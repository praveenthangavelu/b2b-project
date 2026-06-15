import { C } from '../../constants/theme';
import { ModeToggle } from './ModeToggle';

export function PageHeader({ title, icon, desc, mode, onMode, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexShrink: 0, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: accent + '18', border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.g800 }}>{title}</div>
          <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>{desc}</div>
        </div>
      </div>
      <ModeToggle mode={mode} onChange={onMode} />
    </div>
  );
}
