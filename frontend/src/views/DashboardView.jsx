import React, { useState, useEffect } from 'react';
import {
  Database,
  Columns,
  Hash,
  Shapes,
  AlertTriangle,
  Copy,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  BrainCircuit,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Bot,
  Zap,
  Tag,
  Activity,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import AskTheDataBar from '../components/AskTheDataBar';
import ExplainChartModal from '../components/ExplainChartModal';
import DataCleaningAuditModal from '../components/DataCleaningAuditModal';
import { voiceAssistant } from '../utils/voiceAssistant';

const CHART_COLORS = ['#4f87ff', '#7c6bff', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e'];

const DOMAIN_COLOR_MAP = {
  'E-Commerce':    { accent: '#4f87ff', bg: 'rgba(79,135,255,0.08)',  border: 'rgba(79,135,255,0.2)'  },
  'Digital Marketing': { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  'Healthcare':    { accent: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  'Financial':     { accent: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  'SaaS':          { accent: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
};

function getDomainTheme(domain = '') {
  const key = Object.keys(DOMAIN_COLOR_MAP).find(k => domain.includes(k));
  return DOMAIN_COLOR_MAP[key] || { accent: '#4f87ff', bg: 'rgba(79,135,255,0.08)', border: 'rgba(79,135,255,0.2)' };
}

const StatCard = ({ icon: Icon, label, value, sub, iconColor, delay = 0 }) => (
  <div
    className="stat-card animate-fade-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="stat-label">{label}</span>
      <Icon className="w-4 h-4" style={{ color: iconColor }} />
    </div>
    <div className="stat-value mb-1">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl"
      style={{
        background: 'var(--surface-03)',
        border: '1px solid var(--surface-border)',
        fontSize: '12px',
        fontFamily: 'var(--font-sans)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#4f87ff', fontWeight: 600 }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardView({ data, onNavigate, onOpenFullChat }) {
  const [selectedChart, setSelectedChart] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = voiceAssistant.subscribe((s) => setIsSpeaking(s.isSpeaking));
    return () => unsub();
  }, []);

  if (!data) return null;

  const { overview, cleaning_report, ai_insights, charts, domain, file_id } = data;
  const primaryChart   = charts?.[0];
  const secondaryChart = charts?.[1];

  const detectedDomain    = domain?.detected_domain || overview?.detected_domain || 'Enterprise Analytics';
  const domainConfidence  = domain?.domain_confidence || 'High';
  const semanticTags      = domain?.detected_semantic_tags || [];
  const threeThings       = ai_insights?.three_things_you_should_know || [];
  const domainTheme       = getDomainTheme(detectedDomain);

  const handleVoice = () => {
    if (isSpeaking) voiceAssistant.stop();
    else if (ai_insights?.executive_summary) voiceAssistant.speak(ai_insights.executive_summary);
  };

  const renderChart = (chart, colorKey = '#4f87ff') => {
    if (!chart?.data) return null;
    return (
      <ResponsiveContainer width="100%" height="100%">
        {chart.type === 'area' ? (
          <AreaChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${colorKey.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={colorKey} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorKey} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
            <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={chart.yAxisKey}
              stroke={colorKey}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#grad-${colorKey.replace('#', '')})`}
              dot={false}
              activeDot={{ r: 4, fill: colorKey, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : chart.type === 'donut' ? (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chart.data}
              dataKey={chart.yAxisKey}
              nameKey={chart.xAxisKey}
              cx="50%" cy="50%"
              innerRadius={52} outerRadius={82}
              paddingAngle={3}
              strokeWidth={0}
            >
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
            <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={chart.yAxisKey} fill={colorKey} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── 1. Domain Profiler Banner ── */}
      <div
        className="rounded-2xl p-4 sm:p-5 animate-fade-up"
        style={{
          background: domainTheme.bg,
          border: `1px solid ${domainTheme.border}`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${domainTheme.accent}22`, border: `1px solid ${domainTheme.accent}44` }}
            >
              <Zap className="w-4 h-4" style={{ color: domainTheme.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-black text-white"
                  style={{ fontSize: '15px', letterSpacing: '-0.02em' }}
                >
                  {detectedDomain}
                </span>
                <span
                  className="mono px-2 py-0.5 rounded-md"
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: domainTheme.accent,
                    background: `${domainTheme.accent}18`,
                    border: `1px solid ${domainTheme.accent}33`,
                  }}
                >
                  Zero Config • {domainConfidence} Confidence
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Unseen dataset — autonomously profiled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mono" style={{ fontSize: '12px' }}>
            {[
              { v: overview?.total_rows?.toLocaleString(),  l: 'rows' },
              { v: overview?.total_columns,                 l: 'cols' },
            ].map(({ v, l }) => (
              <div
                key={l}
                className="px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}
              >
                <span className="font-bold text-white">{v}</span>{' '}
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {semanticTags.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-1.5 mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Tag className="w-3 h-3 flex-shrink-0" style={{ color: '#475569' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Inferred:
            </span>
            {semanticTags.slice(0, 10).map((tag, i) => (
              <span
                key={i}
                className="mono px-2 py-0.5 rounded-md"
                style={{
                  fontSize: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Executive Briefing ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-7 animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1526 50%, #080d1a 100%)',
          border: '1px solid rgba(79,135,255,0.15)',
          boxShadow: '0 0 60px rgba(79,135,255,0.06)',
          animationDelay: '60ms',
          animationFillMode: 'both',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,135,255,0.07) 0%, transparent 70%)' }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(79,135,255,0.1)', border: '1px solid rgba(79,135,255,0.2)' }}
            >
              <BrainCircuit className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#93b8ff' }}>
                {ai_insights?.generator || 'Autonomous Intelligence Briefing'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  ...(isSpeaking
                    ? { background: 'rgba(244,63,94,0.1)', color: '#f87171', border: '1px solid rgba(244,63,94,0.3)' }
                    : { background: 'rgba(79,135,255,0.08)', color: '#93b8ff', border: '1px solid rgba(79,135,255,0.2)' }
                  ),
                }}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={() => onNavigate('ai_insights')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
                style={{ fontSize: '12px', fontWeight: 600, color: '#4f87ff', background: 'rgba(79,135,255,0.06)', border: '1px solid rgba(79,135,255,0.15)' }}
              >
                <span>Full Insights</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h2
            className="font-black text-white mb-2"
            style={{ fontSize: '20px', letterSpacing: '-0.03em' }}
          >
            Autonomous Executive Briefing
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, maxWidth: '680px' }}>
            {ai_insights?.executive_summary}
          </p>
        </div>
      </div>

      {/* ── 3. "3 Things You Should Know" ── */}
      {threeThings.length > 0 && (
        <div
          className="rounded-2xl p-5 animate-fade-up"
          style={{
            background: 'var(--surface-02)',
            border: '1px solid var(--surface-border)',
            animationDelay: '120ms',
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <span style={{ fontSize: '15px' }}>🚨</span>
              </div>
              <div>
                <h3
                  className="font-bold text-white"
                  style={{ fontSize: '14px', letterSpacing: '-0.02em' }}
                >
                  3 Things You Should Know
                </h3>
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>
                  Proactively surfaced anomalies — no prompting required
                </p>
              </div>
            </div>
            <span
              className="mono hidden sm:block px-2 py-1 rounded-lg"
              style={{ fontSize: '10px', fontWeight: 700, color: '#22d3ee', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              Unprompted Discoveries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {threeThings.map((item, idx) => (
              <div key={idx} className="insight-card">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="mono px-2 py-0.5 rounded-md"
                    style={{
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: 'rgba(79,135,255,0.1)', color: '#93b8ff', border: '1px solid rgba(79,135,255,0.2)',
                    }}
                  >
                    {item.badge}
                  </span>
                  <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee' }}>
                    {item.stat_badge}
                  </span>
                </div>

                <h4
                  className="font-bold text-white mb-1.5"
                  style={{ fontSize: '13px', lineHeight: 1.3 }}
                >
                  {item.headline}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  {item.detail}
                </p>

                <div
                  className="mt-3 pt-3 space-y-2"
                  style={{ borderTop: '1px solid var(--surface-border)' }}
                >
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="w-full flex items-center justify-between transition-colors"
                    style={{ fontSize: '11px', fontWeight: 600, color: '#4f87ff' }}
                  >
                    <span>Why does this matter?</span>
                    {expandedIdx === idx
                      ? <ChevronUp className="w-3.5 h-3.5" />
                      : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedIdx === idx && (
                    <div
                      className="p-3 rounded-xl animate-fade-in"
                      style={{
                        background: 'var(--surface-01)',
                        border: '1px solid rgba(79,135,255,0.15)',
                        fontSize: '12px',
                        color: '#94a3b8',
                        lineHeight: 1.6,
                      }}
                    >
                      {item.why_it_matters}
                    </div>
                  )}

                  <p
                    className="mono truncate"
                    style={{ fontSize: '10px', color: '#334155' }}
                  >
                    Evidence: {item.evidence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Ask the Data ── */}
      <div className="animate-fade-up" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
        <AskTheDataBar datasetData={data} onOpenFullChat={onOpenFullChat} />
      </div>

      {/* ── 5. Stat Cards Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-label">Data Cleaning & Schema Audit</h3>
          <button
            onClick={() => setIsAuditOpen(true)}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}
          >
            <span>Show What Changed</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={Database}       label="Clean Rows"     value={overview?.total_rows?.toLocaleString()}       sub={`Pre-clean: ${cleaning_report?.original_rows?.toLocaleString() || '–'}`}  iconColor="#4f87ff" delay={0} />
          <StatCard icon={Columns}        label="Attributes"     value={overview?.total_columns}                      sub={`${overview?.numeric_columns} num · ${overview?.categorical_columns} cat`}   iconColor="#7c6bff" delay={40} />
          <StatCard icon={Hash}           label="Numeric Cols"   value={overview?.numeric_columns}                    sub="Stats & ML ready"                                                               iconColor="#34d399" delay={80} />
          <StatCard icon={Shapes}         label="Cohort Keys"    value={overview?.categorical_columns}                sub="Discrete segments"                                                              iconColor="#a855f7" delay={120} />
          <StatCard icon={AlertTriangle}  label="Missing Fixed"  value={cleaning_report?.missing_values_handled || 0} sub="Median/mode imputed"                                                           iconColor="#fbbf24" delay={160} />
          <StatCard icon={Copy}           label="Duplicates"     value={cleaning_report?.initial_duplicates || 0}     sub="Removed & cleaned"                                                             iconColor="#f43f5e" delay={200} />
        </div>
      </div>

      {/* ── 6. Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[primaryChart, secondaryChart].filter(Boolean).map((chart, i) => {
          const color = i === 0 ? '#4f87ff' : '#7c6bff';
          const badgeColor = i === 0
            ? { bg: 'rgba(79,135,255,0.1)', text: '#93b8ff', border: 'rgba(79,135,255,0.2)' }
            : { bg: 'rgba(124,107,255,0.1)', text: '#b5acff', border: 'rgba(124,107,255,0.2)' };

          return (
            <div
              key={i}
              className="rounded-2xl p-5 space-y-4 animate-fade-up"
              style={{
                background: 'var(--surface-02)',
                border: '1px solid var(--surface-border)',
                animationDelay: `${240 + i * 60}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
                  >
                    {chart.category}
                  </span>
                  <h4
                    className="font-bold text-white mt-1.5"
                    style={{ fontSize: '14px', letterSpacing: '-0.02em' }}
                  >
                    {chart.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{chart.subtitle}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setSelectedChart(chart)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      fontSize: '12px', fontWeight: 600, color: badgeColor.text,
                      background: badgeColor.bg, border: `1px solid ${badgeColor.border}`,
                    }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Explain</span>
                  </button>
                  <button
                    onClick={() => onNavigate('visualizations')}
                    className="p-1.5 rounded-xl transition-all"
                    style={{ background: 'var(--surface-03)', border: '1px solid var(--surface-border)', color: '#64748b' }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-56 w-full">
                {renderChart(chart, color)}
              </div>

              <div
                className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{chart.takeaway}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <ExplainChartModal
        isOpen={!!selectedChart}
        onClose={() => setSelectedChart(null)}
        chart={selectedChart}
        domain={detectedDomain}
      />
      <DataCleaningAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        report={cleaning_report}
        fileId={file_id}
      />
    </div>
  );
}
