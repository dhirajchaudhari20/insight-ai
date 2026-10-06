import React, { useState } from 'react';
import { Sparkles, BarChart3, Filter, Bot } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, PieChart, Pie,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, ZAxis
} from 'recharts';
import ExplainChartModal from '../components/ExplainChartModal';

const PALETTE = ['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b','#f43f5e','#a855f7'];

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

function ChartRenderer({ chart, idx }) {
  const color = PALETTE[idx % PALETTE.length];
  const gradId = `vg-${idx}`;
  const commonGrid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />;
  const commonAxis = (
    <>
      <XAxis dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
      <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
    </>
  );

  if (chart.type === 'area') return (
    <AreaChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0}   />
        </linearGradient>
      </defs>
      {commonGrid}{commonAxis}
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey={chart.yAxisKey} stroke={color} strokeWidth={2}
        fillOpacity={1} fill={`url(#${gradId})`} dot={false}
        activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
    </AreaChart>
  );

  if (chart.type === 'donut') return (
    <PieChart>
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
      <Pie data={chart.data} dataKey={chart.yAxisKey} nameKey={chart.xAxisKey}
        cx="50%" cy="45%" innerRadius={50} outerRadius={78} paddingAngle={3} strokeWidth={0}>
        {chart.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
      </Pie>
    </PieChart>
  );

  if (chart.type === 'scatter') return (
    <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
      <XAxis type="number" dataKey={chart.xAxisKey} stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
      <YAxis type="number" dataKey={chart.yAxisKey} stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
      <ZAxis range={[40, 40]} />
      <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#334155' }} />
      <Scatter data={chart.data} fill={color} fillOpacity={0.7} />
    </ScatterChart>
  );

  return (
    <BarChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      {commonGrid}{commonAxis}
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey={chart.yAxisKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
        {chart.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
      </Bar>
    </BarChart>
  );
}

export default function VisualizationsView({ data }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedChart,  setSelectedChart]  = useState(null);
  if (!data) return null;

  const charts   = data.charts || [];
  const domain   = data.domain?.detected_domain || 'Enterprise';
  const categories = ['all', ...new Set(charts.map(c => c.category || 'General'))];
  const filtered   = activeCategory === 'all' ? charts : charts.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="font-black text-white" style={{ fontSize: '18px', letterSpacing: '-0.03em' }}>
            Automated Chart Recommendations
          </h2>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '3px', lineHeight: 1.5 }}>
            Optimal chart types selected from inferred column types, distributions & cross-feature relationships.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}>
          <Filter className="w-3.5 h-3.5 ml-1.5" style={{ color: '#334155' }} />
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-lg capitalize transition-all"
              style={{
                fontSize: '12px', fontWeight: 600,
                background: activeCategory === cat ? 'linear-gradient(135deg, #4f87ff, #7c6bff)' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#64748b',
                boxShadow: activeCategory === cat ? '0 2px 10px rgba(79,135,255,0.35)' : 'none',
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((chart, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          return (
            <div key={chart.id || idx}
              className="rounded-2xl p-5 space-y-4 flex flex-col animate-fade-up"
              style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="mono px-2 py-0.5 rounded-md"
                    style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      color, background: `${color}18`, border: `1px solid ${color}33` }}>
                    {chart.category || 'Auto'}
                  </span>
                  <h4 className="font-bold text-white mt-1.5" style={{ fontSize: '14px', letterSpacing: '-0.02em' }}>
                    {chart.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{chart.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => setSelectedChart(chart)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                    style={{ fontSize: '12px', fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}33` }}>
                    <Bot className="w-3.5 h-3.5" />
                    Explain
                  </button>
                  <span className="mono px-2 py-1 rounded-lg"
                    style={{ fontSize: '10px', fontWeight: 600, color: '#334155', background: 'var(--surface-01)', border: '1px solid var(--surface-border)' }}>
                    {chart.type}
                  </span>
                </div>
              </div>

              <div className="h-56 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartRenderer chart={chart} idx={idx} />
                </ResponsiveContainer>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{ background: 'var(--surface-01)', border: `1px solid ${color}22` }}>
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color, marginRight: '6px' }}>AI Insight:</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{chart.takeaway}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ExplainChartModal isOpen={!!selectedChart} onClose={() => setSelectedChart(null)} chart={selectedChart} domain={domain} />
    </div>
  );
}
