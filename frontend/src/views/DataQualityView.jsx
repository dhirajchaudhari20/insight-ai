import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Copy, CheckCircle2,
  Download, FileCheck2, Wrench, Hash, Shapes, Calendar
} from 'lucide-react';
import { getCleanedDownloadUrl } from '../services/api';
import DataCleaningAuditModal from '../components/DataCleaningAuditModal';

const TYPE_STYLES = {
  numeric:     { color: '#4f87ff', bg: 'rgba(79,135,255,0.1)',  border: 'rgba(79,135,255,0.25)',  label: 'Numeric'     },
  categorical: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', label: 'Categorical' },
  date:        { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', label: 'Date'        },
};

function getTypeStyle(type = '') {
  return TYPE_STYLES[type.toLowerCase()] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', label: type };
}

export default function DataQualityView({ data }) {
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  if (!data) return null;

  const { overview, cleaning_report, columns, file_id } = data;
  const score = cleaning_report?.quality_score || 90;
  const scoreColor = score >= 90 ? '#34d399' : score >= 75 ? '#4f87ff' : '#f59e0b';
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  const metrics = [
    { label: 'Original Rows',    value: cleaning_report?.original_rows?.toLocaleString(), sub: 'Pre-dedup',          color: '#4f87ff' },
    { label: 'Duplicates Purged',value: cleaning_report?.rows_removed,                    sub: 'Exact matches',      color: '#f43f5e' },
    { label: 'Values Imputed',   value: cleaning_report?.missing_values_handled,           sub: 'Median / mode',      color: '#fbbf24' },
    { label: 'Columns Fixed',    value: cleaning_report?.columns_fixed_count,              sub: 'Format normalized',  color: '#34d399' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Score + Cleaning Audit ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quality Score Card */}
        <div className="rounded-2xl p-6 flex flex-col items-center justify-between gap-4 text-center animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationFillMode: 'both' }}>
          <div>
            <p className="section-label mb-1">Health & Integrity</p>
            <h3 className="font-bold text-white" style={{ fontSize: '14px' }}>Data Quality Score</h3>
          </div>

          {/* Circular gauge */}
          <div className="relative w-36 h-36">
            <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="9" fill="transparent" />
              <circle cx="50" cy="50" r="40"
                stroke={scoreColor} strokeWidth="9" strokeLinecap="round" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="mono font-black" style={{ fontSize: '32px', color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600, letterSpacing: '0.05em', marginTop: '2px' }}>/100 pts</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, maxWidth: '180px' }}>
            {score >= 90 ? 'High reliability. Minimal artifacts detected.'
              : score >= 75 ? 'Good quality. Automated imputation applied.'
              : 'Moderate sparsity repaired via median/mode.'}
          </p>

          {file_id && (
            <a href={getCleanedDownloadUrl(file_id)} download
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', fontSize: '12px', fontWeight: 600, color: '#34d399' }}>
              <Download className="w-4 h-4" />
              Download Cleaned CSV
            </a>
          )}
        </div>

        {/* Cleaning Metrics */}
        <div className="lg:col-span-2 rounded-2xl p-5 space-y-4 animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '60ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,135,255,0.08)', border: '1px solid rgba(79,135,255,0.2)' }}>
                <Wrench className="w-4 h-4" style={{ color: '#4f87ff' }} />
              </div>
              <div>
                <h3 className="font-bold text-white" style={{ fontSize: '14px' }}>Cleaning Engine Audit</h3>
                <p style={{ fontSize: '11px', color: '#475569' }}>Automated transformations applied to your dataset</p>
              </div>
            </div>
            <button onClick={() => setIsAuditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <FileCheck2 className="w-3.5 h-3.5" />
              Show What Changed
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-3 space-y-1"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                <p className="section-label">{label}</p>
                <p className="mono font-black" style={{ fontSize: '20px', color, lineHeight: 1 }}>{value ?? '—'}</p>
                <p style={{ fontSize: '10px', color: '#334155' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Action log */}
          <div>
            <p className="section-label mb-2">Normalization Actions Executed</p>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {(cleaning_report?.actions || []).map((action, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#34d399' }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Column Type Table ── */}
      <div className="rounded-2xl p-5 animate-fade-up"
        style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '120ms', animationFillMode: 'both' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-white" style={{ fontSize: '14px' }}>Automatic Column Type Detective</h3>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
              Inferred from actual data cell values, format syntax & variance — not just column names.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: `${overview?.numeric_columns} Numeric`,     color: '#4f87ff', bg: 'rgba(79,135,255,0.08)',  border: 'rgba(79,135,255,0.2)'  },
              { label: `${overview?.categorical_columns} Cat`,     color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)'  },
              { label: `${overview?.date_columns || 0} Date`,      color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)'  },
            ].map(({ label, color, bg, border }) => (
              <span key={label} className="mono px-2.5 py-1 rounded-lg"
                style={{ fontSize: '11px', fontWeight: 700, color, background: bg, border: `1px solid ${border}` }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--surface-border)' }}>
          <table className="w-full text-left" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-01)', borderBottom: '1px solid var(--surface-border)' }}>
                {['Column Name', 'Type', 'Unique', 'Missing', 'Missing %', 'Sample Values'].map(h => (
                  <th key={h} className="mono py-3 px-4" style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(columns || []).map((col, idx) => {
                const ts = getTypeStyle(col.detected_type);
                return (
                  <tr key={idx}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: '#f1f5f9' }}>{col.column_name}</td>
                    <td className="py-3 px-4">
                      <span className="mono px-2 py-0.5 rounded-md"
                        style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: ts.color, background: ts.bg, border: `1px solid ${ts.border}` }}>
                        {ts.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 mono" style={{ color: '#64748b' }}>{col.unique_values}</td>
                    <td className="py-3 px-4 mono" style={{ color: '#64748b' }}>{col.missing_values}</td>
                    <td className="py-3 px-4 mono font-semibold"
                      style={{ color: col.percentage_missing > 0 ? '#fbbf24' : '#334155' }}>
                      {col.percentage_missing}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(col.sample_values || []).slice(0, 3).map((val, vi) => (
                          <span key={vi} className="mono px-1.5 py-0.5 rounded-md truncate"
                            style={{ maxWidth: '100px', fontSize: '10px', color: '#64748b', background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DataCleaningAuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} report={cleaning_report} fileId={file_id} />
    </div>
  );
}
