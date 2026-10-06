import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft, Play, Pause,
  Sparkles, AlertTriangle, TrendingUp, Users2, Lightbulb,
  CheckCircle2, BarChart3, Zap, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

const PALETTE = ['#4f87ff', '#7c6bff', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl"
      style={{ background: 'var(--surface-03)', border: '1px solid var(--surface-border)', fontSize: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      {label && <p style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#4f87ff', fontWeight: 600 }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

function buildStorySlides(data) {
  const { overview, ai_insights, cleaning_report, charts, domain } = data;
  const detectedDomain = domain?.detected_domain || 'Enterprise Analytics';
  const slides = [];

  // Slide 1: The dataset arrival
  slides.push({
    id: 'arrival',
    icon: Zap,
    iconColor: '#4f87ff',
    iconBg: 'rgba(79,135,255,0.1)',
    badge: 'Chapter 1',
    badgeColor: '#4f87ff',
    title: `A ${detectedDomain} Dataset Arrived`,
    subtitle: 'Zero-config autonomous profiling',
    narrative: `InsightAI received a raw, unfamiliar spreadsheet — "${overview?.filename}". Without any instructions, it autonomously identified the domain as ${detectedDomain}, mapped ${overview?.total_columns} columns to semantic roles, and prepared the data for analysis in seconds.`,
    stat: { value: overview?.total_rows?.toLocaleString(), label: 'raw records ingested', color: '#4f87ff' },
    tags: domain?.detected_semantic_tags?.slice(0, 6) || [],
    chart: null,
  });

  // Slide 2: Data cleaning story
  slides.push({
    id: 'cleaning',
    icon: CheckCircle2,
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.1)',
    badge: 'Chapter 2',
    badgeColor: '#34d399',
    title: 'The Data Was Messy. We Fixed It.',
    subtitle: 'Automated data cleaning pipeline',
    narrative: `The raw data had ${cleaning_report?.initial_duplicates || 0} duplicate records, ${cleaning_report?.missing_values_handled || 0} missing values, and formatting inconsistencies. InsightAI's cleaning engine automatically purged duplicates, imputed missing values using median/mode strategies, and standardized all formats — raising the data quality score to ${cleaning_report?.quality_score || 90}/100.`,
    stat: { value: `${cleaning_report?.quality_score || 90}/100`, label: 'data quality score achieved', color: '#34d399' },
    tags: cleaning_report?.actions?.slice(0, 4) || [],
    chart: null,
    metrics: [
      { label: 'Duplicates Removed', val: cleaning_report?.initial_duplicates || 0, color: '#f43f5e' },
      { label: 'Missing Imputed',    val: cleaning_report?.missing_values_handled || 0, color: '#fbbf24' },
      { label: 'Columns Fixed',      val: cleaning_report?.columns_fixed_count || 0, color: '#34d399' },
    ],
  });

  // Slide 3: Key finding
  const finding = ai_insights?.three_things_you_should_know?.[0] || ai_insights?.key_insights?.[0];
  if (finding) {
    slides.push({
      id: 'finding1',
      icon: AlertTriangle,
      iconColor: '#fbbf24',
      iconBg: 'rgba(251,191,36,0.1)',
      badge: 'Chapter 3',
      badgeColor: '#fbbf24',
      title: finding.headline || finding.title || 'Critical Discovery',
      subtitle: 'AI-surfaced anomaly — unprompted',
      narrative: finding.detail || finding.insight || '',
      stat: { value: finding.stat_badge || '!', label: 'statistical significance', color: '#fbbf24' },
      evidence: finding.evidence,
      chart: charts?.[0] || null,
    });
  }

  // Slide 4: Trend insight
  const trend = ai_insights?.trends?.[0];
  if (trend) {
    slides.push({
      id: 'trend',
      icon: TrendingUp,
      iconColor: '#22d3ee',
      iconBg: 'rgba(34,211,238,0.1)',
      badge: 'Chapter 4',
      badgeColor: '#22d3ee',
      title: `Momentum Signal: ${trend.metric || 'Key Metric'}`,
      subtitle: 'Trend analysis from time-series data',
      narrative: trend.description || '',
      stat: { value: trend.direction || '↑', label: 'trend direction identified', color: '#22d3ee' },
      evidence: trend.evidence,
      chart: charts?.[1] || null,
    });
  }

  // Slide 5: Segments
  const seg = ai_insights?.segments?.[0];
  if (seg) {
    slides.push({
      id: 'segments',
      icon: Users2,
      iconColor: '#a855f7',
      iconBg: 'rgba(168,85,247,0.1)',
      badge: 'Chapter 5',
      badgeColor: '#a855f7',
      title: `Segment Discovered: ${seg.name || 'Customer Cluster'}`,
      subtitle: 'KMeans ML clustering — zero manual labeling',
      narrative: seg.characteristics || '',
      stat: { value: seg.share || '–', label: 'of total population', color: '#a855f7' },
      evidence: seg.evidence,
      chart: null,
    });
  }

  // Slide 6: Recommendations
  const rec = ai_insights?.recommendations?.[0];
  slides.push({
    id: 'action',
    icon: Lightbulb,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.1)',
    badge: 'Final Chapter',
    badgeColor: '#f59e0b',
    title: 'What Should You Do Next?',
    subtitle: 'Data-driven strategic recommendations',
    narrative: rec?.action || ai_insights?.executive_summary || 'Based on the complete analysis, here are the prioritized actions your team should take immediately.',
    stat: { value: `${ai_insights?.recommendations?.length || 0}`, label: 'actionable recommendations', color: '#f59e0b' },
    recs: (ai_insights?.recommendations || []).slice(0, 3),
    chart: null,
  });

  return slides;
}

export default function DataStoryView({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!data) return null;

  const slides = buildStorySlides(data);
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isFirst = currentSlide === 0;
  const isLast  = currentSlide === slides.length - 1;

  useEffect(() => {
    setProgress(0);
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(c => c + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return p + 1;
      });
    }, 60); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [isPlaying, currentSlide]);

  const goTo = (idx) => { setCurrentSlide(idx); setProgress(0); };
  const prev  = () => !isFirst && goTo(currentSlide - 1);
  const next  = () => !isLast  && goTo(currentSlide + 1);

  const renderMiniChart = (chart) => {
    if (!chart?.data) return null;
    const color = '#4f87ff';
    return (
      <div className="h-48 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'area' ? (
            <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="story-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 9, fill: '#475569' }} />
              <YAxis stroke="#1e293b" tick={{ fontSize: 9, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={chart.yAxisKey} stroke={color} strokeWidth={2}
                fillOpacity={1} fill="url(#story-grad)" dot={false} />
            </AreaChart>
          ) : (
            <BarChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 9, fill: '#475569' }} />
              <YAxis stroke="#1e293b" tick={{ fontSize: 9, fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={chart.yAxisKey} radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chart.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Story Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(79,135,255,0.1)', border: '1px solid rgba(79,135,255,0.2)' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#4f87ff' }} />
          </div>
          <div>
            <h2 className="font-black text-white" style={{ fontSize: '16px', letterSpacing: '-0.03em' }}>
              Data Story Mode
            </h2>
            <p style={{ fontSize: '11px', color: '#475569' }}>
              Guided narrative walkthrough — {slides.length} chapters
            </p>
          </div>
        </div>

        {/* Play / Pause */}
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
          style={{
            fontSize: '12px', fontWeight: 600,
            background: isPlaying ? 'rgba(244,63,94,0.1)' : 'linear-gradient(135deg, #4f87ff, #7c6bff)',
            color: isPlaying ? '#fca5a5' : '#fff',
            border: isPlaying ? '1px solid rgba(244,63,94,0.3)' : 'none',
            boxShadow: isPlaying ? 'none' : '0 4px 16px rgba(79,135,255,0.4)',
          }}>
          {isPlaying ? <><Pause className="w-4 h-4" /> Pause Story</> : <><Play className="w-4 h-4" /> Auto-Play Story</>}
        </button>
      </div>

      {/* ── Chapter Progress Bar ── */}
      <div className="flex items-center gap-2">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex-1 relative h-1.5 rounded-full overflow-hidden transition-all"
            style={{ background: 'var(--surface-03)' }}>
            <div className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: i < currentSlide ? '#4f87ff'
                  : i === currentSlide ? `linear-gradient(90deg, #4f87ff ${progress}%, transparent ${progress}%)`
                  : 'transparent',
              }} />
          </button>
        ))}
      </div>

      {/* ── Main Story Card ── */}
      <div className="relative overflow-hidden rounded-2xl animate-fade-up"
        style={{
          background: 'var(--surface-02)',
          border: `1px solid ${slide.iconColor}33`,
          boxShadow: `0 0 40px ${slide.iconColor}08`,
          minHeight: '500px',
        }}>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${slide.iconColor}, transparent)` }} />

        {/* BG glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${slide.iconColor}06 0%, transparent 70%)` }} />

        <div className="relative z-10 p-7 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Left: Narrative */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="mono px-2.5 py-1 rounded-full"
                  style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: slide.iconColor, background: `${slide.iconColor}18`, border: `1px solid ${slide.iconColor}33` }}>
                  {slide.badge}
                </span>
                <span style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>{slide.subtitle}</span>
              </div>

              <div>
                <h3 className="font-black text-white mb-3" style={{ fontSize: '22px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {slide.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.8 }}>
                  {slide.narrative}
                </p>
              </div>

              {/* Stat highlight */}
              <div className="inline-flex flex-col p-4 rounded-2xl"
                style={{ background: `${slide.iconColor}0d`, border: `1px solid ${slide.iconColor}22` }}>
                <span className="mono font-black" style={{ fontSize: '36px', color: slide.iconColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {slide.stat.value}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{slide.stat.label}</span>
              </div>

              {/* Evidence */}
              {slide.evidence && (
                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: slide.iconColor }} />
                  <p className="mono" style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
                    <span style={{ color: '#334155' }}>Evidence: </span>{slide.evidence}
                  </p>
                </div>
              )}

              {/* Tags (for slide 1 & 2) */}
              {slide.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {slide.tags.map((t, i) => (
                    <span key={i} className="mono px-2 py-0.5 rounded-md"
                      style={{ fontSize: '10px', color: '#94a3b8', background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                      ✓ {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Visual */}
            <div className="space-y-4">
              {/* Chart */}
              {slide.chart && renderMiniChart(slide.chart)}

              {/* Metrics (cleaning slide) */}
              {slide.metrics && (
                <div className="grid grid-cols-3 gap-3">
                  {slide.metrics.map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-4 text-center"
                      style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                      <p className="mono font-black mb-1" style={{ fontSize: '28px', color, lineHeight: 1 }}>{val}</p>
                      <p style={{ fontSize: '10px', color: '#475569', lineHeight: 1.4 }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations (final slide) */}
              {slide.recs && slide.recs.length > 0 && (
                <div className="space-y-2">
                  {slide.recs.map((rec, i) => {
                    const color = ['#f43f5e', '#fbbf24', '#4f87ff'][i] || '#4f87ff';
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mono font-bold"
                          style={{ background: `${color}18`, color, fontSize: '11px' }}>
                          {i + 1}
                        </div>
                        <div>
                          <span className="mono" style={{ fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {rec.priority} Priority
                          </span>
                          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginTop: '2px' }}>{rec.action}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No visual fallback */}
              {!slide.chart && !slide.metrics && !slide.recs && (
                <div className="flex items-center justify-center h-52 rounded-2xl"
                  style={{ background: `${slide.iconColor}06`, border: `1px dashed ${slide.iconColor}22` }}>
                  <div className="text-center space-y-2">
                    <Icon className="w-12 h-12 mx-auto animate-float" style={{ color: slide.iconColor, opacity: 0.5 }} />
                    <p style={{ fontSize: '12px', color: '#334155' }}>
                      {currentSlide + 1} / {slides.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <button onClick={prev} disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
          style={{
            fontSize: '13px', fontWeight: 600,
            background: isFirst ? 'transparent' : 'var(--surface-02)',
            border: '1px solid var(--surface-border)',
            color: isFirst ? '#1e293b' : '#94a3b8',
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Chapter dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === currentSlide ? '24px' : '6px',
                height: '6px',
                background: i === currentSlide ? '#4f87ff' : i < currentSlide ? '#7c6bff' : 'var(--surface-03)',
              }} />
          ))}
        </div>

        <button onClick={next} disabled={isLast}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
          style={{
            fontSize: '13px', fontWeight: 600,
            background: isLast ? 'var(--surface-02)' : 'linear-gradient(135deg, #4f87ff, #7c6bff)',
            border: isLast ? '1px solid var(--surface-border)' : 'none',
            color: isLast ? '#334155' : '#fff',
            boxShadow: isLast ? 'none' : '0 4px 16px rgba(79,135,255,0.4)',
            cursor: isLast ? 'not-allowed' : 'pointer',
          }}>
          {isLast ? 'Story Complete' : 'Next Chapter'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
