import React from 'react';
import {
  Server,
  Database,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  X,
  Layers,
  Sparkles,
  Workflow,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function CloudArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Cloud Enterprise Architecture</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Grounded Analytical Intelligence Engine
            </h3>
            <p className="text-xs text-slate-400">
              Senior engineer blueprint separating factual calculation from generative interpretation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Core Principle Alert */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>The Zero-Hallucination Architectural Principle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              &ldquo;Our analytical engine calculates verified facts; Gemini &amp; Vertex AI interpret those facts.&rdquo;
              The LLM never guesses metrics or performs arithmetic on raw tables; it receives verified mathematical facts.
            </p>
          </div>

          {/* Architecture Flow Visualization */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              End-to-End Google Cloud Data &amp; AI Flow
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Server className="w-4 h-4" />
                </div>
                <div className="font-bold text-white text-[13px]">1. Ingestion</div>
                <div className="text-[11px] text-blue-300 font-mono">Cloud Storage + Run</div>
                <p className="text-[11px] text-slate-400">
                  Zero-config schema detector infers domain, datatypes, and semantic roles without manual mapping.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div className="font-bold text-white text-[13px]">2. Clean &amp; Store</div>
                <div className="text-[11px] text-emerald-300 font-mono">Cloud SQL + ETL</div>
                <p className="text-[11px] text-slate-400">
                  Deduplicates, median-imputes nulls, stages relational schemas in Cloud SQL, and logs audit trails.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="font-bold text-white text-[13px]">3. Verification</div>
                <div className="text-[11px] text-indigo-300 font-mono">BigQuery ETL + ML</div>
                <p className="text-[11px] text-slate-400">
                  Executes automated ETL aggregations, correlation matrices, IQR outliers, and KMeans clustering.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="font-bold text-white text-[13px]">4. Intelligence</div>
                <div className="text-[11px] text-purple-300 font-mono">Vertex AI / Gemini</div>
                <p className="text-[11px] text-slate-400">
                  Interprets verified facts into proactive discoveries, executive briefings, and voice narration.
                </p>
              </div>

            </div>
          </div>

          {/* Component Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Google Cloud Role Mapping
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Google Cloud Storage: </span>
                  <span className="text-slate-300">Safely ingests raw spreadsheets, preserves original versions for audit compliance, and delivers isolated workspace staging.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Google Cloud Run: </span>
                  <span className="text-slate-300">Executes the stateless, autoscaling microservice engine that profiles and cleans tens of thousands of rows in sub-second latency.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Google Cloud SQL: </span>
                  <span className="text-slate-300">Provides enterprise relational transactional persistence, relational schema management, audit logging, and fast operational data indexing.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">BigQuery &amp; Automated ETL Pipelines: </span>
                  <span className="text-slate-300">Scalable data warehouse executing automated ETL jobs, SQL transformations, cross-dataset joins, KMeans centroids, and anomaly z-scores on petabyte scale.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Google Cloud Run (Frontend &amp; Backend Hosting): </span>
                  <span className="text-slate-300">Serverless container hosting for both React frontend and FastAPI microservice backend with automatic scale-to-zero and sub-second cold starts.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Vertex AI &amp; Gemini: </span>
                  <span className="text-slate-300">Contextual reasoning layer that receives deterministic facts from BigQuery/Cloud SQL to produce natural language narratives and conversational answers without hallucination.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Google Cloud Native • Enterprise Scale</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
