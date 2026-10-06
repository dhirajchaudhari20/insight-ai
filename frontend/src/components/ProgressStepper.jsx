import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, Brain, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Uploading Dataset',        icon: Database,    desc: 'Streaming file bytes to analytical engine',          color: '#4f87ff' },
  { id: 2, label: 'Understanding Schema',     icon: Brain,       desc: 'Inferring column types — numeric, date, categorical',      color: '#7c6bff' },
  { id: 3, label: 'Cleaning & Normalizing',   icon: ShieldCheck, desc: 'Deduplicating & smart median/mode imputation',             color: '#22d3ee' },
  { id: 4, label: 'Running ML Analytics',     icon: Brain,       desc: 'Correlations, IQR outliers, KMeans clustering, trends',    color: '#10b981' },
  { id: 5, label: 'Building Visualizations',  icon: BarChart3,   desc: 'Selecting optimal chart types & narrative takeaways',      color: '#f59e0b' },
  { id: 6, label: 'Synthesizing AI Insights', icon: Sparkles,    desc: 'Generating evidence-backed executive summary via LLM',     color: '#a855f7' },
];

export default function ProgressStepper({ currentStep, error, uploadProgress = 100 }) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (uploadProgress < 100) {
      setActiveStep(1);
    } else if (currentStep) {
      setActiveStep(currentStep);
    } else {
      const timers = [
        setTimeout(() => setActiveStep(2), 200),
        setTimeout(() => setActiveStep(3), 500),
        setTimeout(() => setActiveStep(4), 800),
        setTimeout(() => setActiveStep(5), 1100),
        setTimeout(() => setActiveStep(6), 1400),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [currentStep, uploadProgress]);

  // Overall pipeline progress
  const pipelineProgress = ((activeStep - 1) / (STEPS.length - 1)) * 100;
  // If we are uploading, override the top progress bar to show upload progress (scaled to 1st step)
  const displayProgress = uploadProgress < 100 
    ? (uploadProgress / STEPS.length)
    : pipelineProgress;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-full max-w-lg p-7 rounded-2xl space-y-6"
        style={{
          background: 'var(--surface-02)',
          border: '1px solid var(--surface-border)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'rgba(79,135,255,0.1)', border: '1px solid rgba(79,135,255,0.2)' }}
            >
              <div
                className="absolute inset-0 rounded-2xl animate-pulse"
                style={{ background: 'rgba(79,135,255,0.06)' }}
              />
              <Zap className="w-6 h-6 relative z-10" style={{ color: '#4f87ff' }} />
            </div>
          </div>

          <div>
            <h3
              className="font-black text-white"
              style={{ fontSize: '18px', letterSpacing: '-0.03em' }}
            >
              Analyzing Your Dataset
            </h3>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              InsightAI is running the full autonomous pipeline — data cleaning, ML analytics, and AI synthesis.
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '4px', background: 'var(--surface-03)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${displayProgress}%`,
                background: 'linear-gradient(90deg, #4f87ff, #7c6bff, #22d3ee)',
              }}
            />
          </div>

          <div
            className="mono"
            style={{ fontSize: '11px', color: '#4f87ff', fontWeight: 600 }}
          >
            {uploadProgress < 100 ? `Uploading (${uploadProgress}%)` : `Step ${activeStep} of ${STEPS.length}`}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-3 rounded-xl text-center"
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              fontSize: '13px',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        {/* Steps */}
        {!error && (
          <div className="space-y-2">
            {STEPS.map((step) => {
              const isDone    = activeStep > step.id || (step.id === 1 && uploadProgress === 100);
              const isCurrent = activeStep === step.id;
              const isPending = activeStep < step.id;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col gap-2 p-3 rounded-xl transition-all duration-300"
                  style={{
                    background: isCurrent
                      ? `${step.color}0d`
                      : isDone
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                    border: isCurrent
                      ? `1px solid ${step.color}33`
                      : '1px solid transparent',
                    opacity: isPending ? 0.35 : 1,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#34d399' }} />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: step.color }} />
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: '#334155' }} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="font-semibold truncate"
                          style={{
                            fontSize: '12px',
                            color: isDone ? '#94a3b8' : isCurrent ? '#f1f5f9' : '#334155',
                          }}
                        >
                          {step.label}
                        </p>
                        {isCurrent && step.id === 1 && uploadProgress < 100 && (
                          <span
                            className="mono flex-shrink-0 px-1.5 py-0.5 rounded-md"
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: step.color,
                              background: `${step.color}18`,
                            }}
                          >
                            {uploadProgress}%
                          </span>
                        )}
                        {isCurrent && (step.id !== 1 || uploadProgress === 100) && (
                          <span
                            className="mono flex-shrink-0 px-1.5 py-0.5 rounded-md"
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: step.color,
                              background: `${step.color}18`,
                            }}
                          >
                            Running…
                          </span>
                        )}
                        {isDone && (
                          <span
                            className="mono flex-shrink-0 px-1.5 py-0.5 rounded-md"
                            style={{ fontSize: '10px', fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.08)' }}
                          >
                            Done
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: '#334155', marginTop: '1px' }}>{step.desc}</p>
                    </div>
                  </div>
                  
                  {/* Embedded mini progress bar for active upload */}
                  {isCurrent && step.id === 1 && uploadProgress < 100 && (
                     <div className="ml-10 mt-1 rounded-full overflow-hidden" style={{ height: '3px', background: 'var(--surface-03)' }}>
                       <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, background: step.color }} />
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
