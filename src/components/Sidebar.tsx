import React, { useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  FileUp,
  FolderOpen,
  HelpCircle,
  Layers,
  RefreshCw,
  Settings2,
  Sparkles,
  Tag,
  Wand2,
} from 'lucide-react';
import { DesignConfig, DesignType, PostHocType } from '../types';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelImporter';
import { generateTreatmentLabels } from '../utils/fieldRandomizer';
import { calculateRecommendedReplications } from '../utils/replicationRecommender';

interface SidebarProps {
  config: DesignConfig;
  onChangeConfig: (newConfig: Partial<DesignConfig>) => void;
  postHocMethod: PostHocType;
  onChangePostHocMethod: (method: PostHocType) => void;
  onLoadPreset: () => void;
  onImportData: (matrix: number[][], treatmentNames: string[], blockNames: string[]) => void;
  onApplyRecommendedR: (recommendedR: number) => void;
  onOpenTreatmentModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onChangeConfig,
  postHocMethod,
  onChangePostHocMethod,
  onLoadPreset,
  onImportData,
  onApplyRecommendedR,
  onOpenTreatmentModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Compute replication recommendation
  const rec = calculateRecommendedReplications(config);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const res = await parseExcelFile(file);
      onImportData(res.matrix, res.treatmentNames, res.blockNames);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca file Excel';
      setImportError(msg);
    }
  };

  return (
    <aside className="w-80 md:w-88 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-61px)] overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* 1. Rancangan Percobaan Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Rancangan Percobaan
          </label>
          <select
            value={config.type}
            onChange={(e) => {
              const newType = e.target.value as DesignType;
              onChangeConfig({ type: newType });
            }}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ral_non_factorial">1. RAL Non-Faktorial</option>
            <option value="rak_non_factorial">2. RAK Non-Faktorial</option>
            <option value="ral_factorial">3. RAL Faktorial (a × b)</option>
            <option value="rak_factorial">4. RAK Faktorial (a × b)</option>
            <option value="split_plot">5. Split Plot Design (Petak Terbagi - RAK)</option>
          </select>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
            {config.description}
          </p>
        </div>

        {/* 2. REKOMENDASI JUMLAH ULANGAN (DB GALAT >= 15) */}
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950 uppercase flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-emerald-700" />
              Rekomendasi Ulangan Minimal
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                rec.isCurrentAdequate
                  ? 'bg-emerald-200/80 text-emerald-900'
                  : 'bg-amber-200/80 text-amber-900'
              }`}
            >
              {rec.isCurrentAdequate ? 'Memadai' : 'Perlu Ditambah'}
            </span>
          </div>

          <div className="text-xs text-emerald-950 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600">Rumus:</span>
              <code className="font-mono text-[11px] text-emerald-800 font-semibold bg-white/80 px-1.5 py-0.5 rounded">
                {rec.formulaDisplay}
              </code>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600">Ulangan Saat Ini:</span>
              <span className="font-mono font-bold text-slate-800">
                r = {rec.currentR} (DB Galat = {rec.dbgCurrent})
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-emerald-900 font-semibold">Saran Minimal:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                r ≥ {rec.recommendedR} ulangan
              </span>
            </div>
          </div>

          <p className="text-[10px] text-emerald-800/80 leading-normal border-t border-emerald-200/60 pt-1.5">
            {rec.explanation}
          </p>

          {!rec.isCurrentAdequate && (
            <button
              onClick={() => onApplyRecommendedR(rec.recommendedR)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer mt-1"
            >
              <span>Gunakan Rekomendasi (r = {rec.recommendedR})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. KUSTOMISASI INISIAL & NOTASI PERLAKUAN */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            Inisial & Notasi Perlakuan
          </label>

          {config.type === 'ral_non_factorial' || config.type === 'rak_non_factorial' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Inisial Huruf
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={config.prefixTreatment || 'P'}
                  onChange={(e) => onChangeConfig({ prefixTreatment: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono font-bold text-center bg-slate-50 border border-slate-300 rounded-md py-1.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  placeholder="V, P, N"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">cth: V (Varietas), P</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mulai Dari
                </label>
                <select
                  value={config.startIndexTreatment !== undefined ? config.startIndexTreatment : 0}
                  onChange={(e) =>
                    onChangeConfig({ startIndexTreatment: (parseInt(e.target.value) || 0) as 0 | 1 })
                  }
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                >
                  <option value={0}>0 (P0, P1, P2...)</option>
                  <option value={1}>1 (P1, P2, P3...)</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-0.5">0 untuk kontrol</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Inisial Faktor A
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={config.prefixFactorA || 'A'}
                    onChange={(e) => onChangeConfig({ prefixFactorA: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono font-bold text-center bg-slate-50 border border-slate-300 rounded-md py-1.5 text-slate-800"
                    placeholder="A, B, OT"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Mulai A
                  </label>
                  <select
                    value={config.startIndexFactorA !== undefined ? config.startIndexFactorA : 1}
                    onChange={(e) =>
                      onChangeConfig({ startIndexFactorA: (parseInt(e.target.value) || 0) as 0 | 1 })
                    }
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                  >
                    <option value={0}>0 (A0, A1...)</option>
                    <option value={1}>1 (A1, A2...)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Inisial Faktor B
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={config.prefixFactorB || 'B'}
                    onChange={(e) => onChangeConfig({ prefixFactorB: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono font-bold text-center bg-slate-50 border border-slate-300 rounded-md py-1.5 text-slate-800"
                    placeholder="B, N, P"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Mulai B
                  </label>
                  <select
                    value={config.startIndexFactorB !== undefined ? config.startIndexFactorB : 1}
                    onChange={(e) =>
                      onChangeConfig({ startIndexFactorB: (parseInt(e.target.value) || 0) as 0 | 1 })
                    }
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                  >
                    <option value={0}>0 (B0, B1...)</option>
                    <option value={1}>1 (B1, B2...)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions for Treatment Customization */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={onOpenTreatmentModal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kustomisasi Nama & Level Perlakuan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const refreshed = generateTreatmentLabels(config, true);
                onChangeConfig({ treatmentNames: refreshed.names });
              }}
              title="Perbarui teks perlakuan agar otomatis mengikuti inisial faktor baru"
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Sinkronkan Nama dengan Inisial Baru</span>
            </button>
          </div>
        </div>

        {/* 4. Pilihan Uji Lanjut (Post-Hoc) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Uji Lanjut (Post-Hoc 5%)</span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              α = 0.05
            </span>
          </label>
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="posthoc"
                value="bnt"
                checked={postHocMethod === 'bnt'}
                onChange={() => onChangePostHocMethod('bnt')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>BNT 5% (LSD - Fisher)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="posthoc"
                value="bnj"
                checked={postHocMethod === 'bnj'}
                onChange={() => onChangePostHocMethod('bnj')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>BNJ 5% (Tukey HSD)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="posthoc"
                value="dmrt"
                checked={postHocMethod === 'dmrt'}
                onChange={() => onChangePostHocMethod('dmrt')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>DMRT 5% (Duncan Multiple Range)</span>
            </label>
          </div>
        </div>

        {/* 5. Parameter Percobaan (Sliders) */}
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
            Parameter Percobaan
          </label>

          {config.type === 'ral_non_factorial' || config.type === 'rak_non_factorial' ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Jumlah Perlakuan (t):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.t}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={15}
                  value={config.t}
                  onChange={(e) => onChangeConfig({ t: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>
                    Jumlah {config.type === 'rak_non_factorial' ? 'Kelompok' : 'Ulangan'} (r):
                  </span>
                  <span className="font-mono font-bold text-emerald-700">{config.r}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={config.r}
                  onChange={(e) => onChangeConfig({ r: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          ) : config.type === 'split_plot' ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Petak Utama / Faktor A (a):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.a}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={5}
                  value={config.a}
                  onChange={(e) => onChangeConfig({ a: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Anak Petak / Faktor B (b):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.b}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={config.b}
                  onChange={(e) => onChangeConfig({ b: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Jumlah Kelompok (r):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.r}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={config.r}
                  onChange={(e) => onChangeConfig({ r: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Level Faktor A (a):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.a}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={config.a}
                  onChange={(e) => onChangeConfig({ a: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Level Faktor B (b):</span>
                  <span className="font-mono font-bold text-emerald-700">{config.b}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={config.b}
                  onChange={(e) => onChangeConfig({ b: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>
                    Jumlah {config.type === 'rak_factorial' ? 'Kelompok' : 'Ulangan'} (r):
                  </span>
                  <span className="font-mono font-bold text-emerald-700">{config.r}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={config.r}
                  onChange={(e) => onChangeConfig({ r: parseInt(e.target.value) || 2 })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. Peubah & Satuan */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Peubah Diamati
            </label>
            <input
              type="text"
              value={config.variableName}
              onChange={(e) => onChangeConfig({ variableName: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800"
              placeholder="cth: Hasil Gabah"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Satuan
            </label>
            <input
              type="text"
              value={config.unit}
              onChange={(e) => onChangeConfig({ unit: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800"
              placeholder="cth: ton/ha"
            />
          </div>
        </div>

        {/* 7. Muat Data Demo Instan */}
        <div>
          <button
            onClick={onLoadPreset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Muat Data Sampel / Demo
          </button>
        </div>

        {/* 8. Import Excel dari Local Storage */}
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileUp className="w-3.5 h-3.5 text-emerald-600" />
            Import Excel Lokal (.xlsx)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="sidebar-excel-upload"
          />

          <label
            htmlFor="sidebar-excel-upload"
            className="flex flex-col items-center justify-center gap-1.5 p-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-lg cursor-pointer transition-colors"
          >
            <FolderOpen className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Pilih File dari Komputer</span>
            <span className="text-[10px] text-slate-400">Format .xlsx atau .csv</span>
          </label>

          {importError && (
            <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
              {importError}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between text-[11px]">
            <button
              onClick={() => downloadExcelTemplate(config.name)}
              className="text-emerald-700 hover:underline font-medium cursor-pointer"
            >
              Unduh Template Excel
            </button>
            <span className="text-slate-400">Format baku</span>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Gunakan Tab 🗺️ Denah Lapang untuk melihat plot & kompas arah tanam.</span>
      </div>
    </aside>
  );
};
