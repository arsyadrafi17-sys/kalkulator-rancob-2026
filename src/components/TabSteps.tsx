import React from 'react';
import { BookOpen, Check, Copy } from 'lucide-react';
import { StepSection } from '../types';

interface TabStepsProps {
  steps: StepSection[];
}

export const TabSteps: React.FC<TabStepsProps> = ({ steps }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Langkah Perhitungan Matematis (Transparan)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Rincian penurunan rumus matematis, substitusi nilai pengamatan, dan kalkulasi tepat untuk laporan ilmiah atau skripsi.
        </p>
      </div>

      <div className="space-y-5">
        {steps.map((sec, sIdx) => (
          <div
            key={sIdx}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
          >
            <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                {sec.title}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {sec.items.map((item) => {
                const formattedRes =
                  typeof item.result === 'number'
                    ? item.result.toFixed(4)
                    : item.result;
                const copyText = `${item.name}: ${item.formula} = ${item.substitution} = ${formattedRes}`;

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                          {item.id.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800">
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
                        <span className="font-medium text-slate-500">Rumus:</span>
                        <code className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {item.formula}
                        </code>
                        <span className="text-slate-400">→</span>
                        <span className="font-medium text-slate-500">Substitusi:</span>
                        <code className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {item.substitution}
                        </code>
                      </div>

                      {item.note && (
                        <p className="text-[11px] text-emerald-700 font-medium pt-1">
                          {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Nilai Eksak
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                          {formattedRes}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.id, copyText)}
                        title="Salin hasil perhitungan ke clipboard"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
