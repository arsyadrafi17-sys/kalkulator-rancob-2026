import React from 'react';
import { AlertCircle, CheckCircle2, FileText, Info } from 'lucide-react';
import { AnovaResult, DesignConfig } from '../types';

interface TabAnovaProps {
  anova: AnovaResult;
  config: DesignConfig;
}

export const TabAnova: React.FC<TabAnovaProps> = ({ anova, config }) => {
  // Koefisien Keragaman interpretation
  const getKkLevel = (kk: number) => {
    if (kk < 5) return { label: 'Sangat Tinggi (Laboratorium/Kaca)', color: 'text-emerald-700' };
    if (kk <= 10) return { label: 'Tinggi (Kondisi Terkontrol Baik)', color: 'text-emerald-700' };
    if (kk <= 20) return { label: 'Sedang (Normal Percobaan Lapangan)', color: 'text-amber-700' };
    return { label: 'Rendah (Heterogenitas Lingkungan Besar)', color: 'text-rose-700' };
  };

  const kkInfo = getKkLevel(anova.kk);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Tabel Sidik Ragam (ANOVA) Baku
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Model: <span className="font-semibold text-slate-700">{config.name}</span> · Peubah:{' '}
            <span className="font-semibold text-slate-700">{config.variableName}</span> ({config.unit})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Koefisien Keragaman (KK)
            </span>
            <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
              {anova.kk.toFixed(2)} %
            </span>
          </div>
        </div>
      </div>

      {/* Main ANOVA Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3.5 px-4 min-w-[200px]">Sumber Keragaman (SK)</th>
                <th className="py-3.5 px-3 text-center min-w-[60px]">DB</th>
                <th className="py-3.5 px-3 text-right min-w-[110px]">Jumlah Kuadrat (JK)</th>
                <th className="py-3.5 px-3 text-right min-w-[110px]">Kuadrat Tengah (KT)</th>
                <th className="py-3.5 px-3 text-right min-w-[100px] text-emerald-900 bg-emerald-50/50 border-l border-emerald-100">
                  F Hitung
                </th>
                <th className="py-3.5 px-3 text-right min-w-[95px] text-slate-600 border-l border-slate-200/60">
                  F Tabel 0.05
                </th>
                <th className="py-3.5 px-3 text-right min-w-[95px] text-slate-600 border-l border-slate-200/60">
                  F Tabel 0.01
                </th>
                <th className="py-3.5 px-4 text-center min-w-[85px] border-l border-slate-200/60">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anova.rows.map((row, idx) => {
                const isTotal = row.sk.toLowerCase() === 'total';
                const isGalat = row.sk.toLowerCase().includes('galat');
                const isSignificant = row.ket === '**' || row.ket === '*';

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isTotal
                        ? 'bg-slate-50 font-bold border-t-2 border-slate-300'
                        : isSignificant
                        ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className={`py-3 px-4 ${isTotal ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                      {row.sk}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700">
                      {row.db}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {row.jk.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {row.kt > 0 ? row.kt.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-900 bg-emerald-50/30 border-l border-emerald-100">
                      {row.fHitung !== null ? row.fHitung.toFixed(3) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 border-l border-slate-200/60">
                      {row.fTabel05 !== null ? row.fTabel05.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 border-l border-slate-200/60">
                      {row.fTabel01 !== null ? row.fTabel01.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center border-l border-slate-200/60">
                      {row.ket === '**' ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                          ** (Sangat Nyata)
                        </span>
                      ) : row.ket === '*' ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
                          * (Nyata)
                        </span>
                      ) : row.ket === 'tn' ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-md">
                          tn (Tidak Nyata)
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend / Footer Note */}
        <div className="bg-slate-50/80 p-3.5 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Keterangan Statistik:</span>
            <span><strong className="text-rose-700">**</strong> = Berbeda Sangat Nyata (p &lt; 0.01)</span>
            <span><strong className="text-emerald-700">*</strong> = Berbeda Nyata (p &lt; 0.05)</span>
            <span><strong className="text-slate-600">tn</strong> = Tidak Nyata (p ≥ 0.05)</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Tingkat Presisi Uji: <span className={`font-semibold ${kkInfo.color}`}>{kkInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Agronomic Interpretation Summary */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4.5 space-y-2">
        <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Interpretasi Ilmiah Sidik Ragam
        </h3>
        <p className="text-xs text-emerald-950 leading-relaxed">
          {anova.hasSignificance ? (
            <>
              Berdasarkan hasil analisis sidik ragam (ANOVA) pada taraf kepercayaan 95% (α = 0.05) dan 99% (α = 0.01), faktor{' '}
              <strong>{anova.significantFactors.join(', ')}</strong> berpengaruh secara signifikan terhadap{' '}
              <strong>{config.variableName}</strong> (F-Hitung &gt; F-Tabel). Oleh karena itu, hipotesis nol (H₀) ditolak dan analisis dilanjutkan dengan{' '}
              <strong>Uji Lanjut (Post-Hoc Test)</strong> pada Tab 4 untuk mengetahui perlakuan mana yang memberikan respon terbaik.
            </>
          ) : (
            <>
              Berdasarkan hasil analisis sidik ragam (ANOVA), perlakuan tidak menunjukkan pengaruh yang berbeda nyata terhadap{' '}
              <strong>{config.variableName}</strong> pada taraf uji 5% (F-Hitung &lt; F-Tabel 0.05). Hal ini mengindikasikan variasi yang timbul lebih banyak dipengaruhi oleh galat lingkungan percobaan daripada perlakuan yang diterapkan.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
