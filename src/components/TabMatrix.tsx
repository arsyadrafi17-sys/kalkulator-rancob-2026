import React, { useRef } from 'react';
import {
  Calculator,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { AnovaResult, DesignConfig } from '../types';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelImporter';

interface TabMatrixProps {
  matrix: number[][];
  config: DesignConfig;
  anova: AnovaResult;
  onChangeCell: (row: number, col: number, val: number) => void;
  onImportData: (matrix: number[][], treatmentNames: string[], blockNames: string[]) => void;
  onRandomizeData: () => void;
  onClearData: () => void;
  onAddTreatment: () => void;
  onRemoveTreatment: () => void;
  onOpenTreatmentModal?: () => void;
}

export const TabMatrix: React.FC<TabMatrixProps> = ({
  matrix,
  config,
  anova,
  onChangeCell,
  onImportData,
  onRandomizeData,
  onClearData,
  onAddTreatment,
  onRemoveTreatment,
  onOpenTreatmentModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;

  // Calculate row totals and means
  const rowTotals = matrix.map((row) => row.reduce((sum, val) => sum + (val || 0), 0));
  const rowMeans = rowTotals.map((tot) => (numCols > 0 ? tot / numCols : 0));

  // Calculate col totals
  const colTotals: number[] = new Array(numCols).fill(0);
  for (let j = 0; j < numCols; j++) {
    for (let i = 0; i < numRows; i++) {
      colTotals[j] += matrix[i][j] || 0;
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseExcelFile(file);
      onImportData(res.matrix, res.treatmentNames, res.blockNames);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membaca file');
    }
  };

  return (
    <div className="space-y-5">
      {/* Action & Info Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Matriks Data Pengamatan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Peubah: <span className="font-semibold text-slate-800">{config.variableName}</span>{' '}
            ({config.unit}) · Total Observasi:{' '}
            <span className="font-mono font-semibold text-emerald-700">{anova.nTotal}</span> unit percobaan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
            id="tab-excel-upload"
          />

          <label
            htmlFor="tab-excel-upload"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Import Excel Lokal
          </label>

          <button
            onClick={() => downloadExcelTemplate(config.name)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Template
          </button>

          <button
            onClick={onRandomizeData}
            title="Isi data acak realistis untuk simulasi cepat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Acak Data
          </button>

          <button
            onClick={onClearData}
            title="Kosongkan seluruh nilai sel"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Kosongkan
          </button>
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-12 text-center text-slate-400 font-normal">#</th>
                <th className="py-3 px-4 min-w-[200px] font-bold text-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span>Perlakuan</span>
                    {onOpenTreatmentModal && (
                      <button
                        type="button"
                        onClick={onOpenTreatmentModal}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer"
                        title="Kustomisasi nama dan inisial perlakuan"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-600" />
                        <span>Ubah Nama</span>
                      </button>
                    )}
                  </div>
                </th>
                {Array.from({ length: numCols }).map((_, cIdx) => (
                  <th
                    key={cIdx}
                    className="py-3 px-3 text-center min-w-[95px] font-semibold text-slate-700 border-l border-slate-200/60"
                  >
                    {config.blockNames?.[cIdx] ||
                      (config.type.includes('rak') || config.type.includes('split')
                        ? `Kelompok ${cIdx + 1}`
                        : `Ulangan ${cIdx + 1}`)}
                  </th>
                ))}
                <th className="py-3 px-4 text-right min-w-[110px] font-bold text-emerald-800 bg-emerald-50/60 border-l border-emerald-100">
                  Total (Yi.)
                </th>
                <th className="py-3 px-4 text-right min-w-[110px] font-bold text-emerald-800 bg-emerald-50/60 border-l border-emerald-100">
                  Rata-rata (Ȳi)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row, rIdx) => {
                const treatmentLabel =
                  config.treatmentNames?.[rIdx] || `Perlakuan ${rIdx + 1}`;
                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400">
                      {rIdx + 1}
                    </td>
                    <td
                      onClick={onOpenTreatmentModal}
                      title="Klik untuk mengubah nama perlakuan"
                      className="py-2.5 px-4 font-medium text-slate-800 whitespace-nowrap cursor-pointer hover:text-emerald-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{treatmentLabel}</span>
                        {onOpenTreatmentModal && (
                          <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </div>
                    </td>
                    {row.map((cellVal, cIdx) => (
                      <td
                        key={cIdx}
                        className="py-1.5 px-2 text-center border-l border-slate-100"
                      >
                        <input
                          type="number"
                          step="any"
                          value={cellVal === 0 ? '0' : cellVal || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onChangeCell(rIdx, cIdx, isNaN(val) ? 0 : val);
                          }}
                          className="w-full text-center font-mono tabular-nums text-xs font-semibold py-1.5 px-2 bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900"
                        />
                      </td>
                    ))}
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-950 bg-emerald-50/30 border-l border-emerald-100">
                      {rowTotals[rIdx].toFixed(3)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">
                      {rowMeans[rIdx].toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total & Grand Mean Footer */}
            <tfoot>
              <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
                <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">∑</td>
                <td className="py-3 px-4 font-bold text-slate-900">Grand Total</td>
                {colTotals.map((tot, cIdx) => (
                  <td
                    key={cIdx}
                    className="py-3 px-2 text-center font-mono tabular-nums text-xs text-slate-800 border-l border-slate-200"
                  >
                    {tot.toFixed(3)}
                  </td>
                ))}
                <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-900 bg-emerald-100/70 border-l border-emerald-200 text-sm">
                  {anova.grandTotal.toFixed(3)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-800 bg-emerald-100/70 border-l border-emerald-200 text-sm">
                  {anova.grandMean.toFixed(3)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Manual row addition / deletion helpers for custom setups */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          💡 <strong>Tips:</strong> Klik sel data untuk mengedit langsung. Tekan tombol Tab untuk berpindah antar kolom secara cepat.
        </span>
        <div className="flex items-center gap-2">
          {config.type === 'ral_non_factorial' || config.type === 'rak_non_factorial' ? (
            <>
              <button
                onClick={onAddTreatment}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Perlakuan
              </button>
              <span>·</span>
              <button
                onClick={onRemoveTreatment}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
              >
                Hapus Baris Terakhir
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
