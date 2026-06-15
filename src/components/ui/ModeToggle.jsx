export function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-wrap">
      <button className={`mode-btn${mode === 'single' ? ' active' : ''}`} onClick={() => onChange('single')}>
        Single
      </button>
      <button className={`mode-btn${mode === 'bulk' ? ' active' : ''}`} onClick={() => onChange('bulk')}>
        Bulk
      </button>
    </div>
  );
}
