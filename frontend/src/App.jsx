import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import ProgressStepper from './components/ProgressStepper';
import CloudArchitectureModal from './components/CloudArchitectureModal';
import AiChatbotDrawer from './components/AiChatbotDrawer';

import DashboardView from './views/DashboardView';
import DataQualityView from './views/DataQualityView';
import AnalyticsView from './views/AnalyticsView';
import VisualizationsView from './views/VisualizationsView';
import AiInsightsView from './views/AiInsightsView';
import DataStoryView from './views/DataStoryView';
import MultiFileView from './views/MultiFileView';
import TextToSqlView from './views/TextToSqlView';
import AnomalyRiskView from './views/AnomalyRiskView';

import LoginPage from './views/LoginPage';

import {
  checkHealth,
  analyzeUploadedFile,
  analyzeMultipleUploadedFiles,
  analyzeDemoDataset,
  analyzeMultiDemoDataset
} from './services/api';

import {
  UploadCloud, Sparkles, ShieldCheck, TrendingUp, BarChart3, BrainCircuit,
  Zap, ArrowRight, Layers, FileSpreadsheet
} from 'lucide-react';

/* ── Empty-State Feature Pills ── */
const FEATURES = [
  { icon: Zap,          label: 'Sub-Second Speed',    desc: 'Vectorized parallel pipeline' },
  { icon: Layers,       label: 'Multi-File Matrix',   desc: 'Simultaneous cross-file joins' },
  { icon: ShieldCheck,  label: 'Auto Data Cleaning',  desc: 'Dedup, impute, IQR bounds' },
  { icon: TrendingUp,   label: 'ML Analytics',        desc: 'Clustering, correlation, outliers' },
  { icon: BarChart3,    label: 'Smart Charts',        desc: 'Optimal visualization choices' },
  { icon: BrainCircuit, label: '100% Offline Ready',  desc: 'Zero-cloud in-browser privacy' },
];

export default function App() {
  const [currentUser,         setCurrentUser]         = useState(() => {
    try {
      const saved = localStorage.getItem('insightai_user') || sessionStorage.getItem('insightai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab,           setActiveTab]           = useState('dashboard');
  const [datasetData,         setDatasetData]         = useState(null);
  const [multiFileRootData,   setMultiFileRootData]   = useState(null);
  const [activeFileViewIndex, setActiveFileViewIndex] = useState(-1); // -1 = Combined / Multi-File Matrix
  const [isUploadOpen,        setIsUploadOpen]        = useState(false);
  const [isProcessing,        setIsProcessing]        = useState(false);
  const [processStep,         setProcessStep]         = useState(1);
  const [errorMessage,        setErrorMessage]        = useState(null);
  const [healthInfo,          setHealthInfo]          = useState(null);
  const [isArchModalOpen,     setIsArchModalOpen]     = useState(false);
  const [isChatDrawerOpen,    setIsChatDrawerOpen]    = useState(false);
  const [isOfflineMode,       setIsOfflineMode]       = useState(false);
  const [uploadProgress,      setUploadProgress]      = useState(0);

  useEffect(() => {
    checkHealth().then(setHealthInfo);
    if (currentUser && !datasetData) {
      setIsUploadOpen(true);
    }
  }, [currentUser]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      if (userData.rememberMe) {
        localStorage.setItem('insightai_user', JSON.stringify(userData));
        sessionStorage.removeItem('insightai_user');
      } else {
        sessionStorage.setItem('insightai_user', JSON.stringify(userData));
        localStorage.removeItem('insightai_user');
      }
    } catch (e) {
      console.warn('Storage error', e);
    }
    if (!datasetData) {
      setIsUploadOpen(true);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('insightai_user');
      sessionStorage.removeItem('insightai_user');
    } catch (e) {
      console.warn('Storage error', e);
    }
    setCurrentUser(null);
    setDatasetData(null);
    setMultiFileRootData(null);
    setIsUploadOpen(false);
  };

  const celebrate = () => confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.75 },
    colors: ['#4f87ff', '#7c6bff', '#22d3ee', '#10b981', '#f59e0b'],
  });

  const handleUploadFile = async (file) => {
    setIsProcessing(true);
    setProcessStep(1);
    setUploadProgress(0);
    setErrorMessage(null);
    try {
      const data = await analyzeUploadedFile(file, isOfflineMode, setUploadProgress);
      setDatasetData(data);
      setMultiFileRootData(null);
      setActiveFileViewIndex(-1);
      setActiveTab('dashboard');
      setIsUploadOpen(false);
      celebrate();
    } catch (err) {
      setErrorMessage(err.message || 'Error processing file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadMultipleFiles = async (files) => {
    setIsProcessing(true);
    setProcessStep(1);
    setUploadProgress(0);
    setErrorMessage(null);
    try {
      const data = await analyzeMultipleUploadedFiles(files, isOfflineMode);
      setDatasetData(data);
      if (data.is_multi_file) {
        setMultiFileRootData(data);
        setActiveFileViewIndex(-1);
        setActiveTab('multi_file');
      } else {
        setMultiFileRootData(null);
        setActiveFileViewIndex(-1);
        setActiveTab('dashboard');
      }
      setIsUploadOpen(false);
      celebrate();
    } catch (err) {
      setErrorMessage(err.message || 'Error processing multi-file batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectDemo = async (demoKey) => {
    setIsProcessing(true);
    setProcessStep(1);
    setUploadProgress(100);
    setErrorMessage(null);
    try {
      const data = await analyzeDemoDataset(demoKey);
      setDatasetData(data);
      setMultiFileRootData(null);
      setActiveFileViewIndex(-1);
      setActiveTab('dashboard');
      setIsUploadOpen(false);
      celebrate();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load demo dataset.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectMultiDemo = async (multiDemoKey) => {
    setIsProcessing(true);
    setProcessStep(1);
    setUploadProgress(100);
    setErrorMessage(null);
    try {
      const data = await analyzeMultiDemoDataset(multiDemoKey);
      setDatasetData(data);
      if (data.is_multi_file) {
        setMultiFileRootData(data);
        setActiveFileViewIndex(-1);
        setActiveTab('multi_file');
      } else {
        setMultiFileRootData(null);
        setActiveFileViewIndex(-1);
        setActiveTab('dashboard');
      }
      setIsUploadOpen(false);
      celebrate();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load multi-dataset demo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch between Combined view and Individual datasets in multi-file mode
  const handleSwitchDatasetContext = (index) => {
    setActiveFileViewIndex(index);
    if (!multiFileRootData) return;
    if (index === -1) {
      setDatasetData(multiFileRootData);
      setActiveTab('multi_file');
    } else {
      const singleFile = multiFileRootData.file_analyses[index];
      setDatasetData({
        ...singleFile,
        is_multi_file: true,
        multi_synthesis: multiFileRootData.multi_synthesis,
        file_analyses: multiFileRootData.file_analyses
      });
      setActiveTab('dashboard');
    }
  };

  const activeTelemetry = datasetData?.telemetry || multiFileRootData?.multi_synthesis?.telemetry;

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--surface-base)', color: '#cbd5e1' }}
    >
      <Navbar
        activeDataset={datasetData?.overview}
        onReset={() => setIsUploadOpen(true)}
        healthInfo={healthInfo}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenChat={() => setIsChatDrawerOpen(true)}
        telemetry={activeTelemetry}
        isMultiFile={Boolean(datasetData?.is_multi_file)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode(prev => !prev)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          datasetData={datasetData}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: '24px 28px' }}
        >
          {/* ── Multi-File Context Switcher Bar ── */}
          {multiFileRootData && multiFileRootData.file_analyses?.length > 1 && (
            <div
              className="mb-5 p-2 rounded-xl flex items-center gap-2 overflow-x-auto"
              style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(79,135,255,0.2)' }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Scope:</span>
              </div>

              <button
                onClick={() => handleSwitchDatasetContext(-1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeFileViewIndex === -1 && activeTab === 'multi_file'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Datasets Combined (Multi-File Matrix)</span>
              </button>

              {multiFileRootData.file_analyses.map((fileAnalysis, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSwitchDatasetContext(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeFileViewIndex === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[160px]">{fileAnalysis.overview.filename}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({fileAnalysis.overview.total_rows}r)</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Processing State ── */}
          {isProcessing ? (
            <ProgressStepper currentStep={processStep} error={errorMessage} uploadProgress={uploadProgress} />

          /* ── Empty State ── */
          ) : !datasetData ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
              {/* Hero copy */}
              <div className="text-center space-y-4 max-w-lg">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
                  style={{ background: 'rgba(79,135,255,0.08)', border: '1px solid rgba(79,135,255,0.2)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#4f87ff' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#93b8ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    AI Data Analyst • Multi-File & Offline Ready
                  </span>
                </div>

                <h1
                  className="font-black text-white"
                  style={{ fontSize: '36px', letterSpacing: '-0.04em', lineHeight: 1.1 }}
                >
                  Replaces the First
                  <br />
                  <span className="gradient-brand-text">80% of Analyst Work</span>
                </h1>

                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>
                  Drop single or multiple unfamiliar spreadsheets.
                  <br />
                  InsightAI profiles schemas, cleans data, computes cross-file correlations, and delivers executive answers in seconds.
                </p>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="btn-primary mx-auto"
                  style={{ marginTop: '8px', fontSize: '14px', padding: '12px 28px' }}
                >
                  <UploadCloud className="w-5 h-5" />
                  Drop Your Spreadsheet(s)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {FEATURES.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="card p-4 space-y-2"
                    style={{ cursor: 'default' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(79,135,255,0.08)', border: '1px solid rgba(79,135,255,0.15)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#4f87ff' }} />
                    </div>
                    <p className="font-semibold text-white" style={{ fontSize: '13px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>{desc}</p>
                  </div>
                ))}
              </div>

              {/* Process flow */}
              <div
                className="w-full max-w-2xl rounded-2xl p-5"
                style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)' }}
              >
                <p className="section-label mb-4 text-center">Continuous Parallel Pipeline</p>
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  {['Multi-File Ingest', 'Vector Profiler', 'IQR & Isolation Forest', 'Cross-Correlation', 'Executive Takeaway'].map((step, i, arr) => (
                    <React.Fragment key={step}>
                      <div className="text-center">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1.5 mono font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b'][i]}22, ${['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b'][i]}11)`,
                            border: `1px solid ${['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b'][i]}44`,
                            color: ['#4f87ff','#7c6bff','#22d3ee','#10b981','#f59e0b'][i],
                            fontSize: '11px',
                          }}
                        >
                          {i + 1}
                        </div>
                        <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{step}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#1e293b' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

          /* ── Active Views ── */
          ) : (
            <div>
              {activeTab === 'multi_file'     && (
                <MultiFileView
                  data={datasetData}
                  onSelectDataset={(singleData) => {
                    setDatasetData(singleData);
                    setActiveTab('dashboard');
                  }}
                />
              )}
              {activeTab === 'dashboard'      && <DashboardView data={datasetData} onNavigate={setActiveTab} onOpenFullChat={() => setIsChatDrawerOpen(true)} />}
              {activeTab === 'data_quality'   && <DataQualityView data={datasetData} />}
              {activeTab === 'analytics'      && <AnalyticsView data={datasetData} />}
              {activeTab === 'visualizations' && <VisualizationsView data={datasetData} />}
              {activeTab === 'ai_insights'    && <AiInsightsView data={datasetData} />}
              {activeTab === 'data_story'     && <DataStoryView data={datasetData} />}
              {activeTab === 'text_to_sql'    && <TextToSqlView data={datasetData} />}
              {activeTab === 'anomaly_risk'   && <AnomalyRiskView data={datasetData} />}
            </div>
          )}
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={datasetData ? () => setIsUploadOpen(false) : null}
        onUploadFile={handleUploadFile}
        onUploadMultipleFiles={handleUploadMultipleFiles}
        onSelectDemo={handleSelectDemo}
        onSelectMultiDemo={handleSelectMultiDemo}
        isProcessing={isProcessing}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode(prev => !prev)}
      />

      <CloudArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <AiChatbotDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        datasetData={datasetData}
      />
    </div>
  );
}
