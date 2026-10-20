import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Info,
  Layers,
  RefreshCw,
  Sparkles,
  Sprout,
  Table,
} from 'lucide-react';
import { DesignConfig } from '../types';

interface TabSubSamplesProps {
  config: DesignConfig;
  numSamplePlants: number;
  onChangeNumSamplePlants: (n: number) => void;
  subSamples: number[][][]; // [rowIdx][colIdx][plantIdx]
  onChangeSubSample: (row: number, col: number, plantIdx: number, val: number) => void;
  onApplyAveragesToMatrix: () => void;
  onRandomizeSubSamples: () => void;
}

export const TabSubSamples: React.FC<TabSubSamplesProps> = ({
  config,
  numSamplePlants,
  onChangeNumSamplePlants,
  subSamples,
  onChangeSubSample,
  onApplyAveragesToMatrix,
  onRandomizeSubSamples,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const numRows = subSamples.length;
  const numCols = subSamples[0]?.length || 0;

  const handleApply = () => {
    onApplyAveragesToMatrix();
    setCopiedNotification('Rata-rata tanaman sampel berhasil disinkronkan ke Matriks Data ANOVA!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Sampling Bedengan
            </span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Input Data Tanaman Sampel per Bedengan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan hasil pengukuran individu tanaman sampel (misal 3 tanaman terpilih per bedengan). Sistem akan otomatis menghitung rata-ratanya untuk Matriks ANOVA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="font-semibold text-slate-700">Jumlah Sampel / Bedengan:</span>
            <select
              value={numSamplePlants}
              onChange={(e) => onChangeNumSamplePlants(Math.max(2, parseInt(e.target.value) || 3))}
              className="font-bold text-emerald-800 bg-white border border-slate-300 rounded px-2 py-0.5 cursor-pointer"
            >
              {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} Tanaman Sampel
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRandomizeSubSamples}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Acak Sampel Demo
          </button>

          <button
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Terapkan Rata-Rata ke Matriks Data
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{copiedNotification}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-normal">
            Buka Tab Matriks Data untuk melihat data yang telah diperbarui.
          </span>
        </div>
      )}

      {/* Explanatory Banner */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">
            Kaidah Pengukuran Tanaman Sampel (Gomez & Gomez):
          </p>
          <p className="leading-relaxed text-slate-700">
            Setiap baris di bawah ini mewakili 1 bedengan/plot percobaan. Ketikkan nilai pengamatan dari{' '}
            <strong>{numSamplePlants} tanaman sampel terpilih</strong> pada kolom Tanaman 1 s/d Tanaman {numSamplePlants}. Rata-rata plot di kolom paling kanan akan dihitung secara langsung dan menjadi input 1 angka pada tabel ANOVA.
          </p>
        </div>
      </div>

      {/* Sub-sample Grid Tables grouped by Replication / Block */}
      <div className="space-y-6">
        {Array.from({ length: numCols }).map((_, cIdx) => {
          const blockLabel =
            config.blockNames?.[cIdx] ||
            (config.type.includes('rak') || config.type.includes('split')
              ? `Kelompok ${cIdx + 1}`
              : `Ulangan ${cIdx + 1}`);

          return (
            <div
              key={cIdx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 tracking-wide uppercase flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  {blockLabel}
                </span>
                <span className="text-[11px] text-slate-500">
                  {numRows} Bedengan / Plot
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                      <th className="py-2.5 px-4 min-w-[170px]">Perlakuan (Plot)</th>
                      {Array.from({ length: numSamplePlants }).map((_, pIdx) => (
                        <th
                          key={pIdx}
                          className="py-2.5 px-2 text-center min-w-[90px] border-l border-slate-200/60"
                        >
                          Tanaman {pIdx + 1}
                        </th>
                      ))}
                      <th className="py-2.5 px-4 text-right min-w-[120px] font-bold text-emerald-900 bg-emerald-50/60 border-l border-emerald-100">
                        Rata-rata Plot (Ȳ)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from({ length: numRows }).map((_, rIdx) => {
                      const treatName =
                        config.treatmentNames?.[rIdx] || `Perlakuan ${rIdx + 1}`;
                      const plantVals = subSamples[rIdx]?.[cIdx] || [];
                      const plotSum = plantVals.reduce((sum, v) => sum + (v || 0), 0);
                      const plotAvg = plantVals.length > 0 ? plotSum / plantVals.length : 0;

                      return (
                        <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                            {rIdx + 1}
                          </td>
                          <td className="py-2 px-4 font-semibold text-slate-800">
                            {treatName}
                          </td>
                          {Array.from({ length: numSamplePlants }).map((_, pIdx) => {
                            const val = plantVals[pIdx] || 0;
                            return (
                              <td
                                key={pIdx}
                                className="py-1 px-1.5 text-center border-l border-slate-100"
                              >
                                <input
                                  type="number"
                                  step="any"
                                  value={val === 0 ? '0' : val || ''}
                                  onChange={(e) => {
                                    const num = parseFloat(e.target.value);
                                    onChangeSubSample(rIdx, cIdx, pIdx, isNaN(num) ? 0 : num);
                                  }}
                                  className="w-full text-center font-mono text-xs font-semibold py-1 px-1.5 bg-slate-50/80 border border-slate-200 rounded focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
                                />
                              </td>
                            );
                          })}
                          <td className="py-2 px-4 text-right font-mono font-bold text-emerald-800 bg-emerald-50/30 border-l border-emerald-100 tabular-nums">
                            {plotAvg.toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-600">
          Setelah memasukkan seluruh data tanaman sampel, klik tombol di kanan untuk menyinkronkan nilai rata-rata ke Matriks ANOVA.
        </span>
        <button
          onClick={handleApply}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <span>Terapkan Seluruh Rata-Rata ke Tab Matriks Data</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
