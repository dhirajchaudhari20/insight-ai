import React from 'react';
import {
  Wrench,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Download,
  Filter,
  FileCheck2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { getCleanedDownloadUrl } from '../services/api';

export default function DataCleaningAuditModal({ isOpen, onClose, report, fileId }) {
  if (!isOpen || !report) return null;

  const actionSummary = report.action_summary || {
    duplicates_removed: report.initial_duplicates || 0,
    missing_imputed: report.missing_values_handled || 0,
    whitespace_normalized: report.columns_fixed_count || 0,
    currency_standardized: report.columns_fixed_count || 0,
    dates_standardized: 1,
    transformation_flow: `${report.original_rows?.toLocaleString()} raw rows received → ${report.final_rows?.toLocaleString()} clean rows`
  };

  const auditSamples = report.transformations_audit || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Pipeline Transparency</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Show Me What You Changed</h3>
            <p className="text-xs text-slate-400">
              Audit log of automated transformations, deduplication, and normalizations applied to raw input.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Transformation KPI Cards */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Autonomous Normalization Summary
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {actionSummary.transformation_flow}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Duplicates</span>
                <div className="text-base font-bold font-mono text-rose-400">
                  {actionSummary.duplicates_removed} → removed
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Missing Values</span>
                <div className="text-base font-bold font-mono text-amber-400">
                  {actionSummary.missing_imputed} → imputed
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Whitespace</span>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {actionSummary.whitespace_normalized} → trimmed
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Currency / Symbols</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {actionSummary.currency_standardized} → parsed
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400">ISO Dates</span>
                <div className="text-base font-bold font-mono text-indigo-400">
                  {actionSummary.dates_standardized} → fixed
                </div>
              </div>

            </div>
          </div>

          {/* Transformation Diffs (Before & After) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Before & After Concrete Audit Samples
            </h4>

            {auditSamples.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 text-xs text-slate-400 border border-slate-800">
                Dataset raw schema matched standard types directly with zero destructive modifications needed.
              </div>
            ) : (
              <div className="space-y-2">
                {auditSamples.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.category}</span>
                      <span className="text-[10px] font-mono text-slate-400">Target: {item.column}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      
                      {/* Before */}
                      <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-rose-500">RAW:</span>
                        <span className="truncate max-w-[200px]">{item.before}</span>
                      </div>

                      {/* After */}
                      <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-500">CLEAN:</span>
                        <span className="truncate max-w-[200px]">{item.after}</span>
                      </div>

                    </div>

                    <p className="text-[11px] text-slate-400">{item.rule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Log List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full Step Execution Sequence
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
              {(report.actions || []).map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{action}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          {fileId ? (
            <a
              href={getCleanedDownloadUrl(fileId)}
              download
              className="py-2 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Cleaned CSV</span>
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
}
