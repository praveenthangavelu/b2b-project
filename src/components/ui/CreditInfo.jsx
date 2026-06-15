import { C } from '../../constants/theme';
import { CREDITS } from '../../constants/fields';
import { useCredits } from '../../context/CreditsContext';

export function CreditInfo({ toolKey, mode }) {
  const info = CREDITS[toolKey];
  const { balance } = useCredits();
  if (!info) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span className="cr-badge">
        <span>🪙</span>
        1 {info.unit === 'email' ? 'email' : info.unit === 'phone_number' ? 'Phone Number' : 'LinkedIn Profile'}
        &nbsp;=&nbsp;
        <b>{info.cost} Credit{info.cost > 1 ? 's' : ''}</b>
      </span>
      {mode === 'bulk' && (
        <span className="cr-badge-blue">
          <span>📦</span>
          Bulk: credits deducted per {info.unit === 'phone_number' ? 'phone number' : info.unit === 'linkedin_profile' ? 'LinkedIn profile' : 'record'} processed
        </span>
      )}
      <span style={{ fontSize: 9, color: C.g400, marginLeft: 'auto' }}>
        Balance: <b style={{ color: C.brand }}>{balance.toLocaleString()} credits</b>
      </span>
    </div>
  );
}
