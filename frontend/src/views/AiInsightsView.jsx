import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp,
  GitBranch, Users2, Lightbulb, ShieldCheck, Award,
  ChevronRight, ArrowUpRight, Zap, Activity
} from 'lucide-react';

const PRIORITY_STYLES = {
  High:   { bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.25)',  text: '#fca5a5',  dot: '#f43f5e' },
  Medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d',  dot: '#f59e0b' },
  Low:    { bg: 'rgba(79,135,255,0.08)', border: 'rgba(79,135,255,0.25)', text: '#93b8ff',  dot: '#4f87ff' },
};

const SEVERITY_STYLES = {
  High:   { bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.25)',  text: '#fca5a5'  },
  Medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d'  },
  Low:    { bg: 'rgba(79,135,255,0.08)', border: 'rgba(79,135,255,0.2)',  text: '#93b8ff'  },
};

const FINDING_COLORS = ['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b'];

function SectionHeader({ icon: Icon, iconColor, iconBg, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, border: `1px solid ${iconColor}33` }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <h3 className="font-bold text-white" style={{ fontSize: '14px', letterSpacing: '-0.02em' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span className="mono px-2 py-1 rounded-lg hidden sm:block"
          style={{ fontSize: '10px', fontWeight: 700, color: iconColor, background: iconBg, border: `1px solid ${iconColor}33` }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export default function AiInsightsView({ data }) {
  const [expandedRec, setExpandedRec] = useState(null);

  if (!data) return null;
  const { ai_insights } = data;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #0c1a3d 0%, #0d1526 60%, #080d1a 100%)',
          border: '1px solid rgba(79,135,255,0.2)',
          boxShadow: '0 0 60px rgba(79,135,255,0.06)',
        }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,107,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none rounded-2xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(79,135,255,0.1)', border: '1px solid rgba(79,135,255,0.2)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#93b8ff' }}>
                  {ai_insights?.generator || 'Autonomous Reasoning Engine'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399' }}>Zero-Hallucination Grounded</span>
            </div>
          </div>
          <div>
            <h2 className="font-black text-white mb-2" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>
              Executive Intelligence Synthesis
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.75, maxWidth: '680px' }}>
              {ai_insights?.executive_summary}
            </p>
          </div>
        </div>
      </div>

      {/* ── Key Findings ── */}
      <div className="rounded-2xl p-5 animate-fade-up"
        style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '60ms', animationFillMode: 'both' }}>
        <SectionHeader icon={Award} iconColor="#22d3ee" iconBg="rgba(34,211,238,0.08)"
          title="Top Key Findings" subtitle="Empirically grounded observations from your data" badge="Evidence-Backed" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(ai_insights?.key_insights || []).map((item, idx) => (
            <div key={idx} className="rounded-xl p-4 space-y-3 relative overflow-hidden"
              style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                style={{ background: FINDING_COLORS[idx % FINDING_COLORS.length] }} />
              <div className="pl-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: FINDING_COLORS[idx % FINDING_COLORS.length], background: `${FINDING_COLORS[idx % FINDING_COLORS.length]}18`,
                      border: `1px solid ${FINDING_COLORS[idx % FINDING_COLORS.length]}33` }}>
                    Finding #{idx + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: FINDING_COLORS[idx % FINDING_COLORS.length] }} />
                </div>
                <h4 className="font-bold text-white mb-1.5" style={{ fontSize: '13px', lineHeight: 1.3 }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>{item.insight}</p>
              </div>
              <div className="pl-3 pt-2" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <div className="flex items-start gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)' }}>
                  <Activity className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#22d3ee' }} />
                  <span className="mono" style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>{item.evidence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Anomalies + Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Anomalies */}
        <div className="rounded-2xl p-5 animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '120ms', animationFillMode: 'both' }}>
          <SectionHeader icon={AlertTriangle} iconColor="#fbbf24" iconBg="rgba(251,191,36,0.08)"
            title="Anomalies & Deviations" subtitle="Statistically significant outliers detected" badge="IQR Method" />
          <div className="space-y-2">
            {(ai_insights?.anomalies || []).map((a, i) => {
              const sev = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.Low;
              return (
                <div key={i} className="rounded-xl p-3 space-y-2"
                  style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ fontSize: '12px', color: '#f1f5f9' }}>{a.column}</span>
                    <span className="mono px-2 py-0.5 rounded-md"
                      style={{ fontSize: '10px', fontWeight: 700, color: sev.text, background: 'rgba(0,0,0,0.2)' }}>
                      {a.severity} Severity
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{a.description}</p>
                  <p className="mono" style={{ fontSize: '10px', color: '#475569' }}>
                    <span style={{ color: '#334155' }}>Observation: </span>{a.evidence}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trends */}
        <div className="rounded-2xl p-5 animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '160ms', animationFillMode: 'both' }}>
          <SectionHeader icon={TrendingUp} iconColor="#34d399" iconBg="rgba(52,211,153,0.08)"
            title="Trends & Momentum" subtitle="Directional signals with statistical support" badge="Time-Series" />
          <div className="space-y-2">
            {(ai_insights?.trends || []).map((t, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ fontSize: '12px', color: '#f1f5f9' }}>{t.metric}</span>
                  <span className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {t.direction}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{t.description}</p>
                <p className="mono" style={{ fontSize: '10px', color: '#475569' }}>
                  <span style={{ color: '#334155' }}>Evidence: </span>{t.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Relationships + Segments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Relationships */}
        <div className="rounded-2xl p-5 animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '200ms', animationFillMode: 'both' }}>
          <SectionHeader icon={GitBranch} iconColor="#7c6bff" iconBg="rgba(124,107,255,0.08)"
            title="Statistical Relationships" subtitle="Correlations (non-causal)" badge="Pearson r" />
          <div className="space-y-2">
            {(ai_insights?.relationships || []).map((r, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ fontSize: '12px', color: '#f1f5f9' }}>{r.features}</span>
                  <span className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, color: '#b5acff', background: 'rgba(124,107,255,0.1)', border: '1px solid rgba(124,107,255,0.2)' }}>
                    {r.strength} {r.direction}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{r.description}</p>
                <p className="mono" style={{ fontSize: '10px', color: '#475569' }}>
                  <span style={{ color: '#334155' }}>Coefficient: </span>{r.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Segments */}
        <div className="rounded-2xl p-5 animate-fade-up"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '240ms', animationFillMode: 'both' }}>
          <SectionHeader icon={Users2} iconColor="#a855f7" iconBg="rgba(168,85,247,0.08)"
            title="Behavioral Clusters" subtitle="KMeans-identified customer segments" badge="ML Clusters" />
          <div className="space-y-2">
            {(ai_insights?.segments || []).map((s, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ fontSize: '12px', color: '#f1f5f9' }}>{s.name}</span>
                  <span className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, color: '#d8b4fe', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    {s.share}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{s.characteristics}</p>
                <p className="mono" style={{ fontSize: '10px', color: '#475569' }}>
                  <span style={{ color: '#334155' }}>Centroid: </span>{s.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="rounded-2xl p-5 animate-fade-up"
        style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: '280ms', animationFillMode: 'both' }}>
        <SectionHeader icon={Lightbulb} iconColor="#fbbf24" iconBg="rgba(251,191,36,0.08)"
          title="Strategic Recommendations" subtitle="Actionable intelligence derived from data patterns" badge="Prioritized" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(ai_insights?.recommendations || []).map((rec, idx) => {
            const pri = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.Low;
            return (
              <div key={idx} className="rounded-xl p-4 space-y-3 relative"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)', cursor: 'pointer' }}
                onClick={() => setExpandedRec(expandedRec === idx ? null : idx)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: pri.dot }} />
                    <span className="mono" style={{ fontSize: '10px', fontWeight: 700, color: pri.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#334155', fontWeight: 500 }}>{rec.category}</span>
                </div>
                <p className="font-medium" style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>{rec.action}</p>
                {expandedRec === idx && rec.rationale && (
                  <div className="p-2.5 rounded-lg animate-fade-in"
                    style={{ background: 'rgba(79,135,255,0.06)', border: '1px solid rgba(79,135,255,0.15)' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.6 }}>{rec.rationale}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
