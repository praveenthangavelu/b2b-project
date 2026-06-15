import FAQ from '../FAQ';

export function FaqModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,30,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20, animation: 'ov .2s ease both' }}>
      <div className="mo" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 800, background: '#f4f6fc', border: '1px solid #e2e6ff', borderRadius: 24, boxShadow: '0 24px 64px -12px rgba(16,24,64,.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'transparent', border: 'none', color: '#8892cc', fontSize: 28, cursor: 'pointer', lineHeight: 1, zIndex: 10 }}>×</button>
        <FAQ />
      </div>
    </div>
  );
}
