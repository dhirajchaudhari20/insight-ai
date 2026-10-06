import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, X, BrainCircuit, CheckCircle2, ChevronRight } from 'lucide-react';
import { voiceAssistant } from '../utils/voiceAssistant';
import { explainChartApi } from '../services/api';

export default function ExplainChartModal({ isOpen, onClose, chart, domain }) {
  const [explanationData, setExplanationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isOpen || !chart) {
      voiceAssistant.stop();
      setIsSpeaking(false);
      setExplanationData(null);
      return;
    }

    setLoading(true);
    explainChartApi(chart, domain)
      .then((data) => {
        setExplanationData(data);
      })
      .catch((err) => {
        console.error(err);
        setExplanationData({
          title: chart.title,
          explanation: `${chart.title} illustrates key distribution metrics across observed attributes. Takeaway: ${chart.takeaway}`,
          drivers: [
            `Evaluated across ${chart.data?.length || 0} comparative data points.`,
            'Direct alignment with business performance metrics.',
            'Actionable benchmark for operational strategy.'
          ],
          takeaway: chart.takeaway,
          narration_text: `${chart.title}. ${chart.takeaway}`
        });
      })
      .finally(() => setLoading(false));

    const unsubscribe = voiceAssistant.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
    });

    return () => {
      unsubscribe();
      voiceAssistant.stop();
    };
  }, [isOpen, chart, domain]);

  if (!isOpen || !chart) return null;

  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceAssistant.stop();
    } else if (explanationData?.narration_text) {
      voiceAssistant.speak(explanationData.narration_text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Interpretability Engine</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{chart.title}</h3>
            <p className="text-xs text-slate-400">{chart.subtitle || chart.category}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              }`}
              title={isSpeaking ? 'Stop voice readout' : 'Listen to AI explanation'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Read Aloud</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">Synthesizing statistical context...</p>
            </div>
          ) : (
            <>
              {/* Executive Interpretation */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Executive Interpretation
                </span>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {explanationData?.explanation}
                </p>
              </div>

              {/* Underlying Drivers */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Key Underlying Drivers
                </span>
                <div className="space-y-2">
                  {(explanationData?.drivers || []).map((driver, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Takeaway */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Strategic Takeaway</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {explanationData?.takeaway || chart.takeaway}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">Separation: Calculated Facts ➔ Grounded Reasoning</span>
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
