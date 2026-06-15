import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useDismiss } from '../hooks/useDismiss';
import { C } from '../constants/theme';
import { csvCell, exportDate, triggerDownload } from '../utils/format';

const exportRow = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
  padding: '10px 13px', background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, color: C.g700,
};

export function ExportMenu({ columns, rows, style, up = true, label = '⬇ Export ▾', buttonStyle = {} }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const [hover, setHover] = useState(false);
  const disabled = !rows || rows.length === 0 || !columns || columns.length === 0;

  const downloadCSV = () => {
    const header = columns.map((c) => csvCell(c.label)).join(',');
    const lines = rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(','));
    const csv = '﻿' + [header, ...lines].join('\r\n');
    triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `prospecto-export-${exportDate()}.csv`);
    setOpen(false);
  };

  const downloadXLSX = () => {
    const aoa = [columns.map((c) => c.label), ...rows.map((r) => columns.map((c) => {
      const v = r[c.key];
      return v == null ? '' : v;
    }))];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, `prospecto-export-${exportDate()}.xlsx`);
    setOpen(false);
  };

  const baseBtnStyle = {
    width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: hover && !disabled
      ? (buttonStyle.background === 'transparent' ? C.lt : C.dk)
      : (buttonStyle.background || C.brand),
    color: buttonStyle.color || '#fff',
    border: buttonStyle.border || 'none',
    ...buttonStyle,
  };

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        className="bb"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={baseBtnStyle}
      >
        {label}
      </button>
      {open && !disabled && (
        <div style={{ position: 'absolute', ...(up ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }), right: 0, minWidth: 180, background: C.w, border: `1px solid ${C.g150}`, borderRadius: 10, boxShadow: '0 12px 32px -8px rgba(16,24,64,.28)', overflow: 'hidden', zIndex: 80 }}>
          <button type="button" onClick={downloadCSV} style={exportRow}>📄 Download CSV</button>
          <button type="button" onClick={downloadXLSX} style={{ ...exportRow, borderTop: `1px solid ${C.g100}` }}>📊 Download Excel (.xlsx)</button>
        </div>
      )}
    </div>
  );
}
