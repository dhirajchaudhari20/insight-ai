import React from 'react';
import {
  Sparkles,
  Database,
  FileSpreadsheet,
  Activity,
  RefreshCw,
  Layers,
  Bot,
  ChevronDown,
  Cpu,
  Zap,
  WifiOff,
  Globe,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({
  activeDataset,
  onReset,
  healthInfo,
  onOpenUpload,
  onOpenArchitecture,
  onOpenChat,
  telemetry,
  isMultiFile,
  isOfflineMode,
  onToggleOfflineMode,
  currentUser,
  onLogout
}) {
  return (
    <header
      className="h-[60px] border-b sticky top-0 z-30 flex items-center px-4 sm:px-5 justify-between gap-3"
      style={{
        borderColor: 'var(--surface-border)',
        background: 'rgba(3, 6, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-lg animate-spin-slow opacity-60"
            style={{ background: 'conic-gradient(from 0deg, #4f87ff, #7c6bff, #22d3ee, #4f87ff)' }}
          />
          <div
            className="absolute inset-[2px] rounded-[6px] flex items-center justify-center"
            style={{ background: 'var(--surface-base)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="font-black tracking-tight text-white"
              style={{ fontSize: '15px', letterSpacing: '-0.03em' }}
            >
              InsightAI
            </span>
            <span className="badge badge-blue hidden sm:inline-flex">
              Autonomous Analyst
            </span>
          </div>
          <p className="hidden md:block mono" style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.04em' }}>
            Replaces 80% of analyst work
          </p>
        </div>
      </div>

      {/* ── Center Status: Dataset & Execution Telemetry ── */}
      {activeDataset && (
        <div className="hidden md:flex items-center gap-2.5">
          {/* Dataset info */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isMultiFile ? (
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span
              className="font-medium truncate"
              style={{ fontSize: '12px', color: '#cbd5e1', maxWidth: '160px' }}
            >
              {isMultiFile ? 'Multi-Dataset Matrix' : activeDataset.filename}
            </span>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 transition-all text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
              title="Change dataset or upload multiple files"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Change</span>
            </button>
          </div>

          {/* Sub-Second Vector Speed Badge */}
          {telemetry?.execution_time_ms && (
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#34d399',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
              title="Pipeline Execution Telemetry"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="font-bold">{telemetry.execution_time_ms}ms</span>
              {telemetry.throughput_rows_per_sec && (
                <span className="text-slate-400 font-normal">
                  ({telemetry.throughput_rows_per_sec.toLocaleString()} rows/s)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-2">
        {/* Offline Engine Toggle */}
        <button
          onClick={onToggleOfflineMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all text-xs font-semibold"
          style={{
            background: isOfflineMode ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
            border: isOfflineMode ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(100,116,139,0.2)',
            color: isOfflineMode ? '#34d399' : '#94a3b8'
          }}
          title="Toggle 100% In-Browser Offline Engine"
        >
          {isOfflineMode ? (
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="hidden sm:inline">
            {isOfflineMode ? 'Offline Engine' : 'Online API'}
          </span>
        </button>

        {/* Architecture button */}
        <button
          onClick={onOpenArchitecture}
          className="btn-ghost hidden sm:inline-flex"
          title="View Google Cloud Architecture"
        >
          <Layers className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
          <span className="hidden lg:inline">Architecture</span>
        </button>

        {/* AI Copilot chat */}
        {activeDataset && (
          <button
            onClick={onOpenChat}
            className="btn-ghost"
            style={{ color: '#a78bfa', borderColor: 'rgba(124,107,255,0.25)', background: 'rgba(124,107,255,0.06)' }}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Data Copilot</span>
          </button>
        )}

        {/* Upload CTA */}
        {!activeDataset && (
          <button onClick={onOpenUpload} className="btn-primary">
            <Database className="w-3.5 h-3.5" />
            Drop Spreadsheet
          </button>
        )}

        {/* Engine status indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[11px]"
          style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
        >
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">Engine:</span>
          <span className="font-semibold text-emerald-400 truncate max-w-[120px]">
            {isOfflineMode ? 'In-Browser' : (healthInfo?.ai_provider || 'Vector Engine')}
          </span>
        </div>

        {/* User Account & Sign Out */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(79, 135, 255, 0.08)', border: '1px solid rgba(79, 135, 255, 0.2)' }}
            >
              <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] border border-blue-500/30">
                {currentUser.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.displayName || currentUser.username || 'Admin'}
                </span>
                <span className="text-[9px] font-mono text-blue-400 uppercase tracking-wider leading-none">
                  {currentUser.role || 'Administrator'}
                </span>
              </div>
            </div>

            <button
              id="btn-navbar-logout"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
