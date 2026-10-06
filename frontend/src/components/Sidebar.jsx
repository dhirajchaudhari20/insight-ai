import {
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Sparkles,
  BookOpen,
  Download,
  FileText,
  UploadCloud,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Zap
} from 'lucide-react';
import { getCleanedDownloadUrl } from '../services/api';
import { downloadReportFile } from '../utils/reportGenerator';

const BASE_NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',       icon: LayoutDashboard, badge: 'Overview' },
  { id: 'data_quality',   label: 'Data Quality',    icon: ShieldCheck,     badgeKey: 'quality_score' },
  { id: 'analytics',      label: 'Analytics',       icon: TrendingUp,      badge: 'ML Engine' },
  { id: 'visualizations', label: 'Visualizations',  icon: BarChart3,       badgeKey: 'charts_count' },
  { id: 'ai_insights',    label: 'AI Insights',     icon: Sparkles,        badge: 'Evidence' },
  { id: 'data_story',     label: 'Data Story',      icon: BookOpen,        badge: '✨ New' },
  // New high‑impact features
  { id: 'text_to_sql',    label: 'Query Engine',    icon: FileText,       badge: 'SQL' },
  { id: 'anomaly_risk',   label: 'Anomaly Audit',   icon: Zap,            badge: 'Risk' },
];

export default function Sidebar({ activeTab, onSelectTab, datasetData, onOpenUpload }) {
  const qualityScore  = datasetData?.cleaning_report?.quality_score;
  const chartsCount   = datasetData?.charts?.length || 0;
  const isMultiFile   = Boolean(datasetData?.is_multi_file);

  const navItems = isMultiFile
    ? [{ id: 'multi_file', label: 'Multi-File Matrix', icon: Layers, badge: `${datasetData.multi_synthesis?.total_files || 2} Files` }, ...BASE_NAV_ITEMS]
    : BASE_NAV_ITEMS;

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col justify-between"
      style={{
        borderRight: '1px solid var(--surface-border)',
        background: 'rgba(8, 13, 26, 0.7)',
        backdropFilter: 'blur(16px)',
        minHeight: 'calc(100vh - 60px)',
      }}
    >
      {/* ── Top: Navigation ── */}
      <div className="p-3 space-y-5">

        {/* Section label */}
        <div>
          <p className="section-label px-2 mb-2">Navigation</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              let badgeText = item.badge;
              if (item.badgeKey === 'quality_score' && qualityScore !== undefined) {
                badgeText = `${qualityScore}%`;
              } else if (item.badgeKey === 'charts_count' && chartsCount > 0) {
                badgeText = `${chartsCount}`;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? '#4f87ff' : '#475569' }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {badgeText && (
                    <span
                      className="mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: isActive ? 'rgba(79,135,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#93b8ff' : '#475569',
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dataset summary card */}
        {datasetData && (
          <div className="space-y-2">
            <p className="section-label px-2">Current Dataset</p>
            <div
              className="rounded-xl p-3 space-y-3"
              style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
            >
              {/* Status + name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="badge badge-emerald text-[10px] px-2 py-0.5">
                    ✓ Processed
                  </span>
                </div>
                <p
                  className="font-semibold text-white truncate"
                  style={{ fontSize: '12px' }}
                  title={datasetData.overview?.filename}
                >
                  {datasetData.overview?.filename}
                </p>
              </div>

              {/* Stats grid */}
              <div
                className="grid grid-cols-2 gap-1.5 pt-2"
                style={{ borderTop: '1px solid var(--surface-border)' }}
              >
                {[
                  { label: 'Rows',   val: datasetData.overview?.total_rows?.toLocaleString(), color: '#93b8ff' },
                  { label: 'Cols',   val: datasetData.overview?.total_columns,                color: '#b5acff' },
                  { label: 'Num',    val: datasetData.overview?.numeric_columns,              color: '#6ee7b7' },
                  { label: 'Cat',    val: datasetData.overview?.categorical_columns,          color: '#d8b4fe' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-lg px-2 py-1.5" style={{ background: 'var(--surface-01)' }}>
                    <p className="section-label mb-0.5">{label}</p>
                    <p className="mono font-bold" style={{ fontSize: '13px', color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Actions ── */}
      <div
        className="p-3 space-y-1.5"
        style={{ borderTop: '1px solid var(--surface-border)', background: 'rgba(3,6,15,0.4)' }}
      >
        <p className="section-label px-2 mb-2">Exports</p>

        {datasetData?.file_id && (
          <a
            href={getCleanedDownloadUrl(datasetData.file_id)}
            download
            className="nav-item"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span style={{ fontSize: '12px' }}>Cleaned CSV</span>
            </div>
            <ArrowUpRight className="w-3 h-3" style={{ color: '#334155' }} />
          </a>
        )}

        {datasetData && (
          <button
            onClick={() => downloadReportFile(datasetData)}
            className="nav-item w-full"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: '#93b8ff' }} />
              <span style={{ fontSize: '12px' }}>Download Report</span>
            </div>
            <ArrowUpRight className="w-3 h-3" style={{ color: '#334155' }} />
          </button>
        )}

        <button
          onClick={onOpenUpload}
          className="btn-primary w-full justify-center mt-2"
          style={{ padding: '9px 16px', borderRadius: '10px', fontSize: '12px' }}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload New File
        </button>

        <div className="mt-4 pb-2 text-center">
          <p style={{ fontSize: '10px', color: '#64748b', opacity: 0.8 }}>
            Made by <span style={{ color: '#93b8ff', fontWeight: 'bold' }}>Team 404</span>
            <br />
            for Datathon 2026 SJCEM
          </p>
        </div>
      </div>
    </aside>
  );
}
