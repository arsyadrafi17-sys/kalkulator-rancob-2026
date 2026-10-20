import React from 'react';
import { BarChart3, CheckCircle2, ChevronRight, Hash, ListFilter } from 'lucide-react';
import { DesignConfig, PostHocResult, PostHocType } from '../types';

interface TabPostHocProps {
  postHoc: PostHocResult;
  config: DesignConfig;
  onChangeMethod: (method: PostHocType) => void;
}

export const TabPostHoc: React.FC<TabPostHocProps> = ({
  postHoc,
  config,
  onChangeMethod,
}) => {
  const maxMean = Math.max(...postHoc.sortedMeans.map((m) => m.mean), 1);

  return (
    <div className="space-y-6">
      {/* Header and Method Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            Hasil Uji Lanjut (Post-Hoc Test)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Metode: <span className="font-semibold text-slate-800">{postHoc.methodName}</span> · Taraf Nyata α = 0.05
          </p>
        </div>

        {/* Method switcher buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onChangeMethod('bnt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              postHoc.method === 'bnt'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BNT 5% (LSD)
          </button>
          <button
            onClick={() => onChangeMethod('bnj')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              postHoc.method === 'bnj'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BNJ 5% (Tukey)
          </button>
          <button
            onClick={() => onChangeMethod('dmrt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              postHoc.method === 'dmrt'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DMRT 5% (Duncan)
          </button>
        </div>
      </div>

      {/* Grid: Ranked Means with Letters & Critical Values */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table 1: Ranked Means & Letters (2 cols wide) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              Tabel Rataan Perlakuan & Notasi Huruf
            </h3>
            <span className="text-[11px] text-slate-500">
              Diurutkan dari nilai tengah tertinggi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 text-center w-14">Rank</th>
                  <th className="py-2.5 px-4">Nama Perlakuan</th>
                  <th className="py-2.5 px-4 text-right">
                    Rata-rata ({config.unit})
                  </th>
                  <th className="py-2.5 px-4 text-center font-bold text-emerald-800 bg-emerald-50/50 border-l border-emerald-100 w-28">
                    Notasi Huruf
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {postHoc.sortedMeans.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      idx === 0 ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {item.mean.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-base text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">
                      {item.letters}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500">
            Angka-angka pada kolom rataan yang diikuti oleh huruf yang sama menunjukkan tidak berbeda nyata menurut uji {postHoc.methodName}.
          </div>
        </div>

        {/* Table 2: Critical Values */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
          <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Nilai Kritis Pembanding (α = 0.05)
            </h3>
          </div>

          <div className="p-4 space-y-4 text-xs flex-1">
            <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">KT Galat</span>
                <span className="font-mono font-bold text-slate-800">{postHoc.ktg.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">DB Galat</span>
                <span className="font-mono font-bold text-slate-800">{postHoc.dbg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Ulangan (r)</span>
                <span className="font-mono font-bold text-slate-800">{postHoc.r}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Sy = √(KTG/r)</span>
                <span className="font-mono font-bold text-emerald-700">{postHoc.sy.toFixed(4)}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Parameter</th>
                    <th className="py-2 px-2 text-right">Tabel</th>
                    <th className="py-2 px-3 text-right font-bold text-emerald-800">
                      Nilai Kritis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {postHoc.criticalValues.map((cv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-sans text-slate-700 font-medium">{cv.label}</td>
                      <td className="py-2 px-2 text-right text-slate-600">{cv.tabularValue.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 tabular-nums">
                        {cv.criticalDifference.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Visualisasi Rata-rata Perlakuan & Notasi Signifikansi
        </h3>

        <div className="h-64 flex items-end gap-3 pt-8 pb-4 px-2 border-b border-slate-200 overflow-x-auto">
          {postHoc.sortedMeans.map((item, idx) => {
            const heightPercent = maxMean > 0 ? (item.mean / maxMean) * 85 : 0;
            return (
              <div
                key={item.id}
                className="flex-1 min-w-[70px] max-w-[100px] flex flex-col items-center justify-end h-full group"
              >
                {/* Letter Annotation */}
                <span className="font-mono font-bold text-sm text-emerald-800 mb-1">
                  {item.letters}
                </span>

                {/* Mean value label */}
                <span className="font-mono text-[10px] text-slate-500 mb-1">
                  {item.mean.toFixed(2)}
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    idx === 0
                      ? 'bg-emerald-600 group-hover:bg-emerald-700 shadow-xs'
                      : 'bg-emerald-400/80 group-hover:bg-emerald-500'
                  }`}
                />

                {/* Treatment Name label */}
                <span
                  title={item.name}
                  className="mt-2 text-[11px] font-semibold text-slate-700 text-center truncate w-full"
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pairwise Difference Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            Matriks Perbandingan Selisih Nilai Tengah Pasangan Perlakuan (|Ȳi - Ȳj|)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 font-semibold text-slate-700">
                <th className="py-2.5 px-3 text-left">Perlakuan</th>
                {postHoc.sortedMeans.map((m) => (
                  <th key={m.id} className="py-2.5 px-3 font-mono text-[11px]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {postHoc.matrixDiff.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-left font-semibold text-slate-800 bg-slate-50/40">
                    {postHoc.sortedMeans[rIdx].name} ({postHoc.sortedMeans[rIdx].mean.toFixed(2)})
                  </td>
                  {row.map((cell, cIdx) => {
                    if (rIdx === cIdx) {
                      return (
                        <td key={cIdx} className="py-2.5 px-3 font-mono text-slate-300">
                          -
                        </td>
                      );
                    }
                    if (rIdx > cIdx) {
                      return (
                        <td key={cIdx} className="py-2.5 px-3 font-mono text-slate-300">
                          -
                        </td>
                      );
                    }
                    return (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3 font-mono tabular-nums text-xs font-semibold ${
                          cell.isSignificant
                            ? 'text-rose-700 bg-rose-50/50'
                            : 'text-slate-600'
                        }`}
                      >
                        {Math.abs(cell.diff).toFixed(3)}{' '}
                        {cell.isSignificant ? (
                          <span className="text-rose-600 font-bold">*</span>
                        ) : (
                          <span className="text-slate-400 font-normal text-[10px]">tn</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500">
          Tanda <strong>*</strong> menunjukkan selisih nilai tengah melampaui nilai kritis (berbeda nyata), sedangkan <strong>tn</strong> menunjukkan tidak berbeda nyata.
        </div>
      </div>

      {/* Summary Note */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-emerald-900 uppercase">Kesimpulan Uji Lanjut</h4>
          <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
            {postHoc.summaryText}
          </p>
        </div>
      </div>
    </div>
  );
};
