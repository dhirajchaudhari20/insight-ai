import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  X,
  Play,
  ShoppingBag,
  Users,
  Megaphone,
  AlertCircle,
  HeartPulse,
  Landmark,
  Zap,
  CheckCircle2,
  ChevronRight,
  Layers,
  Cpu,
  WifiOff,
  Globe,
  Loader2
} from 'lucide-react';

const MULTI_FILE_DEMOS = [
  {
    key: 'sales_marketing',
    title: 'Cross-Domain: Sales + Marketing',
    domain: 'Multi-File Synthesis',
    subtitle: 'ecommerce_sales.csv + marketing_campaigns.csv',
    badge: 'Auto-Key Join',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0369a1, #1e3a8a)',
    metric: '2 files • 460 rows'
  },
  {
    key: 'multi_region',
    title: 'Dual-Region: East vs West Ops',
    domain: 'Enterprise Operations',
    subtitle: 'sales_east_region.csv + sales_west_region.csv',
    badge: 'Side-by-Side Matrix',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #6b21a8, #4c1d95)',
    metric: '2 files • 720 rows'
  },
  {
    key: 'enterprise_100k',
    title: '100,000 Records Big Data Benchmark',
    domain: 'High-Volume Scale Test',
    subtitle: 'Sub-second vectorized throughput test (100k rows)',
    badge: '⚡ 89k rows/sec',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #047857, #065f46)',
    metric: '100k rows • 9 cols'
  }
];

const SINGLE_DEMO_DATASETS = [
  {
    key: 'ecommerce_sales',
    title: 'E-Commerce Sales',
    domain: 'E-Commerce & Retail',
    subtitle: 'Orders, Revenue, Margins, Categories, Ratings',
    icon: ShoppingBag,
    gradient: 'linear-gradient(135deg, #1d3a8a, #312e81)',
    accent: '#4f87ff',
    rows: '260 rows',
    cols: '11 cols',
  },
  {
    key: 'marketing_campaigns',
    title: 'Marketing ROAS',
    domain: 'Digital Marketing',
    subtitle: 'Ad Spend, Impressions, Clicks, Conversions',
    icon: Megaphone,
    gradient: 'linear-gradient(135deg, #4c1d95, #701a75)',
    accent: '#a78bfa',
    rows: '200 rows',
    cols: '10 cols',
  },
  {
    key: 'saas_churn',
    title: 'SaaS Churn',
    domain: 'SaaS Subscriptions',
    subtitle: 'Tenure, MRR, Usage Logins, Support Tickets',
    icon: Users,
    gradient: 'linear-gradient(135deg, #064e3b, #134e4a)',
    accent: '#34d399',
    rows: '220 rows',
    cols: '10 cols',
  },
  {
    key: 'hospital_records',
    title: 'Clinical Records',
    domain: 'Healthcare',
    subtitle: 'Patients, Departments, Billing, Discharge',
    icon: HeartPulse,
    gradient: 'linear-gradient(135deg, #7f1d1d, #831843)',
    accent: '#f87171',
    rows: '40 rows',
    cols: '8 cols',
  }
];

export default function UploadModal({
  isOpen,
  onClose,
  onUploadFile,
  onUploadMultipleFiles,
  onSelectDemo,
  onSelectMultiDemo,
  isProcessing,
  isOfflineMode,
  onToggleOfflineMode
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [demoTab, setDemoTab] = useState('multi'); // 'multi' or 'single'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateFiles = (fileList) => {
    setError(null);
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const name = file.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.txt')) {
        setError(`"${file.name}" is not a supported CSV or Excel file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      validateFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      validateFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleTriggerAnalysis = () => {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length === 1) {
      onUploadFile(selectedFiles[0]);
    } else if (onUploadMultipleFiles) {
      onUploadMultipleFiles(selectedFiles);
    } else {
      onUploadFile(selectedFiles[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(3, 6, 15, 0.90)', backdropFilter: 'blur(20px)' }}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl p-6 sm:p-7 space-y-5 animate-fade-up max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--surface-02)',
          border: '1px solid var(--surface-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,135,255,0.15)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #4f87ff, #7c6bff, #22d3ee, #10b981)' }}
        />

        {/* Close button */}
        {onClose && !isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
            style={{ color: '#475569', background: 'var(--surface-03)', border: '1px solid var(--surface-border)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Processing Indicator Banner ── */}
        {isProcessing && (
          <div
            className="p-3.5 rounded-xl flex items-center justify-between gap-3 border animate-pulse"
            style={{
              background: 'rgba(79,135,255,0.12)',
              borderColor: 'rgba(79,135,255,0.4)',
            }}
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <div>
                <p className="text-xs font-bold text-white tracking-wide">
                  Ingesting & Profiling Dataset...
                </p>
                <p className="text-[11px] text-blue-200/80">
                  Zero-config schema inference, outlier scan, and ML segmentation running.
                </p>
              </div>
            </div>
            <span className="mono text-[10px] uppercase font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
              Active Stream
            </span>
          </div>
        )}

        {/* ── Hero Header ── */}
        <div className="text-center space-y-2 pt-1">
          <div className="flex items-center justify-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(79,135,255,0.08)', border: '1px solid rgba(79,135,255,0.2)' }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#93b8ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Simultaneous Multi-File & Big Data Engine
              </span>
            </div>

            {/* Offline toggle pill */}
            <button
              onClick={() => onToggleOfflineMode && onToggleOfflineMode()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-xs font-semibold"
              style={{
                background: isOfflineMode ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                border: isOfflineMode ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(100,116,139,0.25)',
                color: isOfflineMode ? '#34d399' : '#94a3b8'
              }}
              title="Toggle In-Browser Offline Engine"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isOfflineMode ? 'Offline Local Engine' : 'Online API Mode'}</span>
            </button>
          </div>

          <h2
            className="font-black text-white"
            style={{ fontSize: '24px', letterSpacing: '-0.03em', lineHeight: 1.2 }}
          >
            Drop Single or Multiple Spreadsheets.
            <br />
            <span className="gradient-brand-text">Auto-Profiled in Milliseconds.</span>
          </h2>

          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, maxWidth: '520px', margin: '0 auto' }}>
            Zero config. Upload 1 to 5+ datasets simultaneously for cross-file correlation & schema alignment,
            or test high-speed sub-second processing on 100k+ rows.
          </p>
        </div>

        {/* ── Multi-File Upload Zone ── */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          style={{ padding: '24px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(79,135,255,0.08)',
                border: '1px solid rgba(79,135,255,0.2)',
              }}
            >
              <UploadCloud className="w-6 h-6" style={{ color: '#4f87ff' }} />
            </div>
            <div className="space-y-1 text-center">
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
                Drop one or multiple CSV / Excel files here, or{' '}
                <span style={{ color: '#4f87ff', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  browse files
                </span>
              </p>
              <p className="mono" style={{ fontSize: '11px', color: '#475569' }}>
                Supports multi-file batch upload (CSV, XLSX) • Unlimited file size • Stream processed
              </p>
            </div>
          </div>
        </div>

        {/* ── Selected Files List Bar ── */}
        {selectedFiles.length > 0 && (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(79,135,255,0.06)', border: '1px solid rgba(79,135,255,0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'Dataset' : 'Datasets'} Selected ({formatFileSize(totalBytes)})
                </span>
              </div>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200"
                >
                  <span className="truncate max-w-[180px] font-medium">{file.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="p-0.5 hover:text-rose-400 text-slate-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleTriggerAnalysis}
                disabled={isProcessing}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Datasets...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {selectedFiles.length > 1
                        ? `Analyze ${selectedFiles.length} Datasets in Parallel`
                        : 'Analyze Dataset'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
            <span style={{ fontSize: '12px', color: '#fca5a5' }}>{error}</span>
          </div>
        )}

        {/* ── Demo Suites (Multi-File vs Single) ── */}
        <div
          className="space-y-3 pt-2"
          style={{ borderTop: '1px solid var(--surface-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDemoTab('multi')}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  demoTab === 'multi'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-File & Big Data Demos</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 font-mono">3</span>
              </button>

              <button
                onClick={() => setDemoTab('single')}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  demoTab === 'single'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Single Domain Benchmarks</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">1-click instant run</span>
          </div>

          {demoTab === 'multi' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MULTI_FILE_DEMOS.map((demo) => (
                <button
                  key={demo.key}
                  onClick={() => onSelectMultiDemo && onSelectMultiDemo(demo.key)}
                  disabled={isProcessing}
                  className="flex flex-col text-left p-3.5 rounded-xl transition-all group"
                  style={{
                    background: 'var(--surface-01)',
                    border: '1px solid var(--surface-border)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = demo.accent + '55';
                    e.currentTarget.style.background = 'var(--surface-02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                    e.currentTarget.style.background = 'var(--surface-01)';
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                      style={{ background: demo.accent + '15', color: demo.accent, border: `1px solid ${demo.accent}33` }}
                    >
                      {demo.badge}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{demo.metric}</span>
                  </div>

                  <p className="font-bold text-white text-xs mb-1 group-hover:text-blue-300 transition-colors">
                    {demo.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {demo.subtitle}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">Sub-Second Ready</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SINGLE_DEMO_DATASETS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.key}
                    onClick={() => onSelectDemo(demo.key)}
                    disabled={isProcessing}
                    className="flex flex-col text-left p-3 rounded-xl transition-all group"
                    style={{
                      background: 'var(--surface-01)',
                      border: '1px solid var(--surface-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = demo.accent + '44';
                      e.currentTarget.style.background = 'var(--surface-02)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--surface-border)';
                      e.currentTarget.style.background = 'var(--surface-01)';
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="p-1.5 rounded-lg" style={{ background: demo.gradient }}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{demo.rows}</span>
                    </div>
                    <p className="font-semibold text-white text-xs truncate">{demo.title}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{demo.domain}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
