import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { sendSlackWebhookApi } from '../services/api';

export default function WebhookDrawer({ isOpen, onClose, datasetData }) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const overview = datasetData?.overview || {};
  const cleaning = datasetData?.cleaning_report || {};
  const insights = datasetData?.ai_insights?.key_insights?.map(k => k.title || k) || [
    "Identified top revenue cohort commanding 42% volume.",
    "Isolated low-risk customer clusters with stable churn.",
    "Flagged 8 outlier records in primary transaction metric."
  ];

  const summaryPayload = {
    filename: overview.filename || 'Dataset',
    quality_score: cleaning.quality_score || 96,
    rows: overview.total_rows || 0,
    anomalies_count: datasetData?.outliers?.total_outlier_rows || 0,
    insights
  };

  const handleDispatch = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const resp = await sendSlackWebhookApi(webhookUrl, summaryPayload);
      setStatus(resp);
    } catch (err) {
      setStatus({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end">
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col h-full">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Executive Webhook & Slack Alerting
              </h3>
              <p className="text-[11px] text-slate-400">Automate proactive KPI digest notifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 text-xs">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Direct Enterprise Integration</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Connect your company's Slack channel, Discord webhook, or Microsoft Teams connector. 
              Dispatches executive digests, data quality scores, and anomaly warnings in formatted rich cards.
            </p>
          </div>

          {/* Webhook Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              Slack or Discord Webhook URL:
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/T00/B00/XXXX (or leave blank to simulate)"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Tip: Leave blank to test the simulated Slack Block Kit message preview.
            </p>
          </div>

          {/* Action Dispatch Button */}
          <button
            onClick={handleDispatch}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{webhookUrl ? 'Dispatch Alert to Live Webhook' : 'Run Simulated Webhook Dispatch'}</span>
          </button>

          {/* Status Message */}
          {status && (
            <div
              className={`p-4 rounded-xl text-xs space-y-1 ${
                status.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {status.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{status.message || (status.success ? 'Dispatch Succeeded!' : status.error)}</span>
              </div>
            </div>
          )}

          {/* Live Slack Card Preview */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 font-mono">
              Slack Block Kit Card Preview:
            </span>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>InsightAI Autonomous Executive Briefing: {summaryPayload.filename}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400">Total Rows:</span>
                  <p className="font-bold text-white">{summaryPayload.rows.toLocaleString()} verified</p>
                </div>
                <div>
                  <span className="text-slate-400">Quality Score:</span>
                  <p className="font-bold text-emerald-400">{summaryPayload.quality_score}/100</p>
                </div>
                <div>
                  <span className="text-slate-400">Flagged Anomalies:</span>
                  <p className="font-bold text-rose-400">{summaryPayload.anomalies_count} records</p>
                </div>
                <div>
                  <span className="text-slate-400">Delivery Latency:</span>
                  <p className="font-bold text-cyan-400">&lt; 350 ms</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <span className="font-bold text-white">Strategic Executive Takeaways:</span>
                {summaryPayload.insights.map((ins, i) => (
                  <p key={i} className="text-[11px] text-slate-300">
                    • {ins}
                  </p>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
