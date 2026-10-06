import React, { useState } from 'react';
import {
  Calculator,
  GitCommit,
  AlertCircle,
  Network,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const CLUSTER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AnalyticsView({ data }) {
  const [subTab, setSubTab] = useState('stats');

  if (!data) return null;

  const { statistics, correlation, outliers, clustering, trends } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setSubTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            subTab === 'stats'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Descriptive Statistics</span>
        </button>

        <button
          onClick={() => setSubTab('correlations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            subTab === 'correlations'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Correlation Matrix</span>
        </button>

        <button
          onClick={() => setSubTab('outliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            subTab === 'outliers'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Outlier Analysis ({outliers?.total_outlier_rows || 0})</span>
        </button>

        <button
          onClick={() => setSubTab('clustering')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            subTab === 'clustering'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>KMeans Clustering</span>
        </button>

        <button
          onClick={() => setSubTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            subTab === 'trends'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Chronological Trends</span>
        </button>
      </div>

      {/* 1. Descriptive Statistics Sub-tab */}
      {subTab === 'stats' && (
        <div className="space-y-6">
          {/* Numeric Table */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Numeric Attributes (Descriptive Statistics)</h3>
                <p className="text-xs text-slate-400">
                  Measures of central tendency, spread, quartiles, and distribution skewness.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {statistics?.numeric_stats?.length || 0} numeric columns
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4">Count</th>
                    <th className="py-3 px-4">Mean</th>
                    <th className="py-3 px-4">Median</th>
                    <th className="py-3 px-4">Std Dev</th>
                    <th className="py-3 px-4">Min</th>
                    <th className="py-3 px-4">Max</th>
                    <th className="py-3 px-4">25% (Q1)</th>
                    <th className="py-3 px-4">75% (Q3)</th>
                    <th className="py-3 px-4">Skewness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(statistics?.numeric_stats || []).map((num, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white font-sans">{num.column_name}</td>
                      <td className="py-3 px-4">{num.count?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-cyan-300">{num.mean?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-300">{num.median?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{num.std?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{num.min?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{num.max?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{num.q25?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{num.q75?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          Math.abs(num.skewness) > 1.0 ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400'
                        }`}>
                          {num.skewness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categorical Distribution Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Categorical Frequency Distributions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(statistics?.categorical_stats || []).map((cat, i) => (
                <div key={i} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate">{cat.column_name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                      {cat.unique_count} distinct
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                    <span className="text-[11px] text-slate-400">Most Frequent Category:</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-white truncate max-w-[140px]">{cat.most_frequent}</span>
                      <span className="text-purple-400 font-mono font-bold">{cat.most_frequent_pct}% ({cat.most_frequent_count})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Sub-Cohorts</span>
                    {(cat.distribution || []).slice(0, 4).map((d, di) => (
                      <div key={di} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[130px]">{d.category}</span>
                          <span className="font-mono text-slate-400">{d.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(d.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Correlation Analysis Sub-tab */}
      {subTab === 'correlations' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Pearson Correlation Matrix</h3>
                <p className="text-xs text-slate-400">
                  Statistical co-movement scored between -1.0 (inverse) and +1.0 (positive).
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Correlation implies relationship, strictly not causation.</span>
              </div>
            </div>

            {/* Correlation Heatmap Grid */}
            {correlation?.columns?.length >= 2 ? (
              <div className="overflow-x-auto pt-2">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-mono text-slate-400 text-[11px]">Attribute</th>
                      {correlation.columns.map((c, i) => (
                        <th key={i} className="p-2 text-center font-mono text-slate-400 text-[11px] max-w-[100px] truncate" title={c}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.columns.map((rowCol, ri) => (
                      <tr key={ri}>
                        <td className="p-2 font-mono text-white text-[11px] font-semibold pr-4 whitespace-nowrap">
                          {rowCol}
                        </td>
                        {correlation.columns.map((colCol, ci) => {
                          const val = correlation.matrix?.[rowCol]?.[colCol] ?? 0;
                          
                          // Color according to positive vs negative correlation
                          let bgStyle = 'bg-slate-900/60 text-slate-400';
                          if (rowCol === colCol) {
                            bgStyle = 'bg-blue-600/30 text-blue-200 font-bold';
                          } else if (val >= 0.7) {
                            bgStyle = 'bg-emerald-600/40 text-emerald-200 font-bold';
                          } else if (val >= 0.4) {
                            bgStyle = 'bg-emerald-600/20 text-emerald-300';
                          } else if (val <= -0.7) {
                            bgStyle = 'bg-rose-600/40 text-rose-200 font-bold';
                          } else if (val <= -0.4) {
                            bgStyle = 'bg-rose-600/20 text-rose-300';
                          }

                          return (
                            <td key={ci} className="p-1 text-center">
                              <div
                                className={`w-14 h-9 flex items-center justify-center rounded-lg font-mono text-[11px] border border-slate-800 ${bgStyle}`}
                                title={`${rowCol} vs ${colCol}: ${val}`}
                              >
                                {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">{correlation?.message}</p>
            )}
          </div>

          {/* Top Ranked Relationships */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Top Identified Statistical Relationships</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(correlation?.top_relationships || []).map((rel, i) => (
                <div key={i} className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{rel.feature_a}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-bold text-white">{rel.feature_b}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      rel.strength === 'Strong'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      r = {rel.correlation > 0 ? `+${rel.correlation}` : rel.correlation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rel.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="capitalize">{rel.strength} Intensity</span>
                    <span>•</span>
                    <span className="capitalize">{rel.direction} Vector</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Outlier Analysis Sub-tab */}
      {subTab === 'outliers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Outlier Records</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {outliers?.total_outlier_rows?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-400">Flagged by 1.5 × IQR boundary</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Dataset Affected</span>
              <div className="text-2xl font-bold text-white font-mono">
                {outliers?.percentage_affected || 0}%
              </div>
              <p className="text-[11px] text-slate-400">Percentage of entire row volume</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Multivariate Outliers</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {outliers?.multivariate_outliers_count || 0}
              </div>
              <p className="text-[11px] text-slate-400">Identified via Isolation Forest</p>
            </div>
          </div>

          {/* Outlier Columns Breakdown Table */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Affected Columns & IQR Thresholds</h3>
            
            <div className="space-y-3">
              {(outliers?.column_outliers || []).map((col, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{col.column_name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono">
                        {col.outlier_count} records ({col.percentage}%)
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Normal Bound: [{col.lower_bound}, {col.upper_bound}]
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{col.description}</p>

                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400">Sample Extreme Values:</span>
                    <div className="flex gap-1.5 flex-wrap font-mono">
                      {(col.sample_values || []).map((sv, vi) => (
                        <span key={vi} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[11px]">
                          {sv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. KMeans Clustering Sub-tab */}
      {subTab === 'clustering' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Unsupervised Customer & Record Segmentation</h3>
                <p className="text-xs text-slate-400">{clustering?.message}</p>
              </div>
              {clustering?.is_applicable && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono">
                    Silhouette Score: {clustering.silhouette_score}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono">
                    {clustering.clusters_count} Clusters
                  </span>
                </div>
              )}
            </div>

            {clustering?.is_applicable ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {(clustering.clusters || []).map((cluster, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                        />
                        <h4 className="text-sm font-bold text-white">{cluster.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {cluster.percentage}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 font-medium">Profile: </span>
                      <span>{cluster.characteristics}</span>
                    </div>

                    <div className="space-y-1 pt-1 text-xs font-mono">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Centroid Coordinates:</span>
                      {Object.entries(cluster.centroids || {}).map(([k, v], ci) => (
                        <div key={ci} className="flex justify-between text-[11px]">
                          <span className="text-slate-400 truncate max-w-[140px]">{k}</span>
                          <span className="text-white font-medium">{v?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Info className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-300">{clustering?.message}</p>
                <p className="text-xs text-slate-500">
                  Clustering is activated when at least 2 distinct numeric attributes with significant variance and 15+ rows are detected.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Chronological Trends Sub-tab */}
      {subTab === 'trends' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Time Series Trajectory Analysis</h3>
                <p className="text-xs text-slate-400">{trends?.message}</p>
              </div>
              {trends?.is_applicable && (
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    trends.direction === 'Upward'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : trends.direction === 'Downward'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {trends.direction} ({trends.growth_rate_pct > 0 ? `+${trends.growth_rate_pct}` : trends.growth_rate_pct}%)
                  </span>
                </div>
              )}
            </div>

            {trends?.is_applicable ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  {trends.summary}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Period</th>
                        <th className="py-2.5 px-4">Total {trends.numeric_column}</th>
                        <th className="py-2.5 px-4">Average</th>
                        <th className="py-2.5 px-4">Volume Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {(trends.trend_data || []).map((t, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 font-semibold text-white">{t.period}</td>
                          <td className="py-2.5 px-4 text-cyan-300">{t.total?.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-slate-400">{t.average?.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-slate-400">{t.volume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Calendar className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-300">{trends?.summary || 'No date column available.'}</p>
                <p className="text-xs text-slate-500">
                  Time trend analysis requires at least one detected date column and one numeric metric.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
