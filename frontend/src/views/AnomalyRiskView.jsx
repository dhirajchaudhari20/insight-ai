import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Download,
  Filter,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronDown,
  Eye,
  Info
} from 'lucide-react';

export default function AnomalyRiskView({ data }) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeColumn, setActiveColumn] = useState('ALL');

  if (!data) return null;

  const { outliers, overview, statistics, cleaning_report } = data;
  const totalOutliers = outliers?.total_outlier_rows || 0;
  const percentageAffected = outliers?.percentage_affected || 0;
  const columnOutliers = outliers?.column_outliers || [];

  // Generate enriched anomaly records from the preview data or sample outliers
  const anomalyCards = columnOutliers.map((col, idx) => {
    const count = col.outlier_count || 0;
    const severity = count > 100 || percentageAffected > 5
      ? 'CRITICAL RISK'
      : count > 30 || percentageAffected > 2
      ? 'HIGH SEVERITY'
      : count > 0
      ? 'ELEVATED VARIANCE'
      : 'BENIGN';

    const severityStyle = {
      'CRITICAL RISK': { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', badge: 'bg-rose-500/20 text-rose-300' },
      'HIGH SEVERITY': { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#fb923c', badge: 'bg-orange-500/20 text-orange-300' },
      'ELEVATED VARIANCE': { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.35)', text: '#facc15', badge: 'bg-yellow-500/20 text-yellow-300' },
      'BENIGN': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399', badge: 'bg-emerald-500/20 text-emerald-300' }
    }[severity];

    const sampleVals = col.sample_values || [];
    const lowBound = col.lower_bound ?? 0;
    const upBound = col.upper_bound ?? 0;

    return {
      id: idx + 1,
      column_name: col.column_name,
      outlier_count: count,
      lower_bound: lowBound,
      upper_bound: upBound,
      severity,
      severityStyle,
      sample_values: sampleVals,
      hypothesis: `Observed spike deviation detected. Values such as [${sampleVals.slice(0, 3).join(', ')}] violate IQR boundaries [${lowBound}, ${upBound}]. Recommended for auditing against fraudulent transaction surges or logging anomalies.`
    };
  });

  const filteredCards = anomalyCards.filter(card => {
    if (selectedSeverity !== 'ALL' && card.severity !== selectedSeverity) return false;
    if (activeColumn !== 'ALL' && card.column_name !== activeColumn) return false;
    if (searchFilter && !card.column_name.toLowerCase().includes(searchFilter.toLowerCase()) && !card.hypothesis.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const exportAuditLog = () => {
    const csvContent = [
      "Column,Outlier Count,Severity,Lower Bound,Upper Bound,Sample Anomalies,Root Cause Hypothesis",
      ...anomalyCards.map(c =>
        `"${c.column_name}","${c.outlier_count}","${c.severity}","${c.lower_bound}","${c.upper_bound}","${c.sample_values.join('; ')}","${c.hypothesis.replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insightai_fraud_audit_log_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Top Threat Overview Header ── */}
      <div
        className="p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        }}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-bold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Isolation Forest & IQR Boundary Audit Center</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Automated Anomaly & Fraud Risk Radar
          </h2>
          <p className="text-xs text-slate-400">
            Automated multi-dimensional outlier detection separating genuine VIP surges from malicious risk or logging errors.
          </p>
        </div>

        <button
          onClick={exportAuditLog}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Anomaly Audit Log</span>
        </button>
      </div>

      {/* ── Risk Metric Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Anomalies</span>
          <div className="text-2xl font-black text-white">{totalOutliers.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Flagged across whole table</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dataset Risk Ratio</span>
          <div className="text-2xl font-black text-rose-400">{percentageAffected}%</div>
          <p className="text-[11px] text-slate-400">Of total observations affected</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Columns with Outliers</span>
          <div className="text-2xl font-black text-yellow-400">{columnOutliers.length}</div>
          <p className="text-[11px] text-slate-400">Violating IQR bounds</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Detection Alg</span>
          <div className="text-2xl font-black text-cyan-400">Dual-Pass</div>
          <p className="text-[11px] text-slate-400">Isolation Forest + Robust IQR</p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CRITICAL RISK', 'HIGH SEVERITY', 'ELEVATED VARIANCE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSeverity === sev
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search column or hypothesis..."
            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-rose-500 outline-none w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* ── Anomaly Root Cause Cards ── */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Critical Anomalies Found</h4>
            <p className="text-xs text-slate-400">
              All records for the selected filters conform to normal Gaussian and IQR distributions.
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="p-5 rounded-2xl space-y-3 transition-all"
              style={{
                background: card.severityStyle.bg,
                border: `1px solid ${card.severityStyle.border}`,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5" style={{ color: card.severityStyle.text }} />
                  <span className="font-bold text-white text-sm">
                    Anomaly Event in <span className="font-mono text-cyan-300">"{card.column_name}"</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${card.severityStyle.badge}`}>
                    {card.severity}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span>Count: <strong className="text-white">{card.outlier_count} records</strong></span>
                  <span>Bounds: [{card.lower_bound}, {card.upper_bound}]</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {card.hypothesis}
              </p>

              {card.sample_values.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Sample Extreme Values:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.sample_values.slice(0, 6).map((val, vi) => (
                      <span key={vi} className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-rose-300">
                        {String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
