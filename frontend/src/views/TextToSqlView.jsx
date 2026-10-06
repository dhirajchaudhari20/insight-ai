import React, { useState } from 'react';
import {
  Database,
  Play,
  Download,
  Sparkles,
  Zap,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Table,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { queryDatasetSql } from '../services/api';

const QUICK_QUERIES = [
  "Show top 10 records with highest numeric values",
  "Calculate average metric grouped by category",
  "Find records with values above the 90th percentile",
  "List records where any primary metric is 0 or abnormal",
  "Show count and distribution across all distinct categories"
];

export default function TextToSqlView({ data }) {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [customSql, setCustomSql] = useState('');
  const [useRawSql, setUseRawSql] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleRunQuery = async (queryText) => {
    const q = (queryText !== undefined ? queryText : (useRawSql ? customSql : naturalQuery)).trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await queryDatasetSql(
        useRawSql ? '' : q,
        useRawSql ? q : '',
        data.file_id,
        data
      );

      if (resp.success) {
        setResult(resp);
        if (!useRawSql && resp.sql_query) {
          setCustomSql(resp.sql_query);
        }
      } else {
        setError(resp.error || 'Query execution failed');
      }
    } catch (err) {
      setError(err.message || 'Error running SQL query.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    if (!result?.sql_query) return;
    navigator.clipboard.writeText(result.sql_query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResultCsv = () => {
    if (!result?.rows?.length) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map(row =>
      result.columns.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `insightai_sql_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Top Header Banner ── */}
      <div
        className="p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-bold text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>DuckDB In-Memory OLAP • Sub-Millisecond Speed</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autonomous Text-to-SQL Query Engine
          </h2>
          <p className="text-xs text-slate-400">
            Ask in plain English or write SQL directly. Groq translates your intent into vectorized DuckDB SQL instantly.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setUseRawSql(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !useRawSql
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Natural Language
          </button>
          <button
            onClick={() => setUseRawSql(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              useRawSql
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw SQL Mode
          </button>
        </div>
      </div>

      {/* ── Input Box & Actions ── */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
      >
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>{useRawSql ? 'Enter DuckDB SQL Statement:' : 'Enter Natural Language Query:'}</span>
            <span className="text-[11px] font-mono text-slate-500">Virtual Table: "dataset"</span>
          </label>

          <div className="relative">
            {useRawSql ? (
              <textarea
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                placeholder="SELECT category, AVG(total_amount) FROM dataset GROUP BY category ORDER BY 2 DESC LIMIT 10;"
                rows={3}
                className="w-full p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 placeholder-slate-600 border border-slate-700 focus:border-cyan-500 outline-none"
              />
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                  placeholder="e.g. Show top 10 highest revenue transactions where category is Electronics..."
                  className="w-full p-3.5 pr-28 rounded-xl bg-slate-950 text-xs text-white placeholder-slate-500 border border-slate-700 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={() => handleRunQuery()}
                  disabled={loading || !naturalQuery.trim()}
                  className="absolute right-2 btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Run Query</span>
                </button>
              </div>
            )}
          </div>

          {useRawSql && (
            <div className="flex justify-end">
              <button
                onClick={() => handleRunQuery()}
                disabled={loading || !customSql.trim()}
                className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Execute SQL</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        {!useRawSql && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Suggested Inquiries:</span>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNaturalQuery(q);
                    handleRunQuery(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Error Notification ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Query Execution Results ── */}
      {result && result.success && (
        <div
          className="rounded-2xl overflow-hidden space-y-4 p-5"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
        >
          {/* Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{result.total_matched_rows.toLocaleString()} Rows Returned</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{result.execution_time_ms} ms</span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Engine: {result.engine}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={exportResultCsv}
                className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Generated SQL Code Block */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400">
              <span>Executed SQL Query:</span>
            </div>
            <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
              {result.sql_query}
            </pre>
          </div>

          {/* Data Result Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[50vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-300">
                <tr>
                  {result.columns.map((col, idx) => (
                    <th key={idx} className="p-3 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {result.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    {result.columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-3 text-slate-200 whitespace-nowrap">
                        {String(row[col] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
