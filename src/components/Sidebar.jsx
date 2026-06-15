import { useState } from 'react';
import { C } from '../constants/theme';
import { NAV } from '../constants/fields';
import { useCredits } from '../context/CreditsContext';
import { getInitials } from '../utils/format';

export function Sidebar({ active, onNav, user, onLogout, onBuyCredits, onProfile, onSettings }) {
  const { balance: credits } = useCredits();
  const [credHover, setCredHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [settingsHover, setSettingsHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  const initials = getInitials(user?.name);
  const creditPct = Math.min(100, Math.round((credits / 10000) * 100));
  const planLabel = user?.plan ? `${user.plan} Plan` : 'Pro Plan';

  return (
    <aside style={{ width: 210, flexShrink: 0, background: 'linear-gradient(180deg,#0f1438,#131d55)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', boxShadow: '4px 0 24px rgba(0,0,0,.22)' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .04, backgroundImage: 'radial-gradient(#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 9, padding: '0 15px', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0, position: 'relative' }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg,${C.brand},#6d28d9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(57,83,251,.55)', fontWeight: 900, fontSize: 14, color: '#fff' }}>P</div>
        <div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.4px' }}>Prosp<span style={{ color: '#818cf8' }}>ecto</span></div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,.28)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>B2B Intelligence</div>
        </div>
      </div>
      <div style={{ padding: '13px 15px 5px', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.14em' }}>Tools</span>
      </div>
      <nav style={{ flex: 1, padding: '0 9px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', overflowY: 'auto' }}>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} className="nb" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 11px', borderRadius: 10, border: 'none', background: on ? 'linear-gradient(135deg,rgba(57,83,251,.38),rgba(57,83,251,.2))' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)', fontSize: 12, fontWeight: on ? 700 : 500, cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${on ? C.brand : 'transparent'}`, boxShadow: on ? '0 4px 16px rgba(57,83,251,.2),inset 0 0 0 1px rgba(57,83,251,.28)' : 'none', transition: 'all .2s cubic-bezier(.22,1,.36,1)' }}>
              <span style={{ fontSize: 15, width: 19, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>{item.label}</div>
                {on && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1, fontWeight: 400 }}>{item.desc}</div>}
              </div>
              {on && <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: C.brand, boxShadow: `0 0 8px ${C.brand}`, animation: 'gl 2s ease infinite' }} />}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '10px 11px', position: 'relative' }}>
        <div role="button" tabIndex={0} onClick={onBuyCredits} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onBuyCredits()} onMouseEnter={() => setCredHover(true)} onMouseLeave={() => setCredHover(false)} style={{ background: 'rgba(57,83,251,.11)', border: `1px solid ${credHover ? C.brand : 'rgba(57,83,251,.18)'}`, borderRadius: 12, padding: '11px 13px', cursor: 'pointer', outline: 'none', boxShadow: credHover ? `0 6px 20px -8px ${C.brand}88` : 'none', transition: 'all .18s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Monthly Credits</span>
            <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 700 }}>{credits.toLocaleString()} / 10k</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${creditPct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.brand},#818cf8)` }} />
          </div>
          <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: credHover ? '#818cf8' : 'rgba(255,255,255,.32)', fontSize: 11, fontWeight: 600, transition: 'color .18s ease' }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span>Add credits
          </div>
        </div>
      </div>
      <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', borderTop: '1px solid rgba(255,255,255,.06)', position: 'relative', justifyContent: 'space-between' }}>
        <div role="button" tabIndex={0} onClick={onProfile} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onProfile && onProfile()} onMouseEnter={() => setProfileHover(true)} onMouseLeave={() => setProfileHover(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, padding: '4px 6px', borderRadius: 8, cursor: 'pointer', background: profileHover ? 'rgba(255,255,255,.06)' : 'transparent', transition: 'all .2s ease' }} title="View Profile">
          <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${C.brand},#6d28d9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10.5 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: profileHover ? '#fff' : 'rgba(255,255,255,.76)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color .2s ease' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 9, color: profileHover ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.3)', transition: 'color .2s ease' }}>{planLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" onClick={onSettings} onMouseEnter={() => setSettingsHover(true)} onMouseLeave={() => setSettingsHover(false)} title="Settings" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: settingsHover ? '#818cf8' : 'rgba(255,255,255,.28)', transform: settingsHover ? 'rotate(45deg)' : 'none', transition: 'transform .3s ease, color .2s ease' }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>⚙</span>
          </button>
          <button type="button" onClick={onLogout} onMouseEnter={() => setLogoutHover(true)} onMouseLeave={() => setLogoutHover(false)} title="Log out" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: logoutHover ? '#f87171' : 'rgba(255,255,255,.4)', transform: logoutHover ? 'translateX(2px)' : 'none', transition: 'transform .2s ease, color .2s ease' }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
