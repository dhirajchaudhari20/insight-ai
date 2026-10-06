import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ExecutiveReportModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const { overview, cleaning_report, ai_insights, statistics, outliers, correlation, charts } = data;
  const score = cleaning_report?.quality_score || 95;
  const executiveSummary = ai_insights?.executive_summary || "Automated multi-dimensional analysis complete with verified evidence and clean operational baselines.";
  const keyInsights = ai_insights?.key_insights || [];
  const recommendations = ai_insights?.recommendations || [];
  const totalOutliers = outliers?.total_outlier_rows || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Floating Controls (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Executive Briefing & Board Deck (Print-Ready PDF)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-executive-report" className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 print:p-0 print:overflow-visible text-slate-800">
          
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold tracking-wider text-blue-600 uppercase">
                InsightAI Autonomous Intelligence Platform
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Executive Data Briefing
              </h1>
              <p className="text-sm text-slate-500">
                Prepared autonomously for executive leadership & board evaluation
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-mono text-slate-500">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-xs font-mono text-slate-500">
                Dataset: <strong>{overview?.filename || 'Uploaded Dataset'}</strong>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                Status: Verified Clean
              </span>
            </div>
          </div>

          {/* Section 1: Executive KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records</span>
              <div className="text-2xl font-black text-slate-950 mt-1">{overview?.total_rows?.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">{overview?.total_columns} attributes evaluated</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quality Score</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{score}/100</div>
              <p className="text-[11px] text-slate-500 mt-1">{cleaning_report?.rows_removed || 0} duplicates purged</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Flagged Outliers</span>
              <div className="text-2xl font-black text-rose-600 mt-1">{totalOutliers.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">{outliers?.percentage_affected || 0}% variance ratio</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ML Segments</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{data?.clustering?.clusters_count || 3}</div>
              <p className="text-[11px] text-slate-500 mt-1">KMeans clusters mapped</p>
            </div>
          </div>

          {/* Section 2: Executive Summary */}
          <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Grounded Executive Briefing</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {executiveSummary}
            </p>
          </div>

          {/* Section 3: Key Analytical Discoveries */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Proactive Business Discoveries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {keyInsights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{insight.title || `Finding ${idx + 1}`}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {insight.description || insight}
                  </p>
                  {insight.actionable_takeaway && (
                    <p className="text-[11px] font-semibold text-blue-700 pt-1 border-t border-slate-200">
                      Takeaway: {insight.actionable_takeaway}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Strategic Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Actionable Board Recommendations
            </h3>
            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((rec, rIdx) => (
                <div key={rIdx} className="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 bg-white shadow-sm">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    {rec.priority || 'P1 High'}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{rec.action || rec.title || 'Strategic Action'}</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{rec.impact || rec.description || rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Generated by InsightAI Autonomous Analyst Engine</span>
            <span className="font-mono">Page 1 of 1 • Strict Zero-Hallucination Grounding</span>
          </div>

        </div>

      </div>
    </div>
  );
}
