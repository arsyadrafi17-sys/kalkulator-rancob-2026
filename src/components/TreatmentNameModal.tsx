import React, { useState } from 'react';
import { Check, Edit3, HelpCircle, RefreshCw, Sparkles, Tag, X } from 'lucide-react';
import { DesignConfig } from '../types';
import { generateTreatmentLabels } from '../utils/fieldRandomizer';

interface TreatmentNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DesignConfig;
  onSave: (updated: Partial<DesignConfig>) => void;
}

export const TreatmentNameModal: React.FC<TreatmentNameModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  if (!isOpen) return null;

  const isFactorial =
    config.type === 'ral_factorial' ||
    config.type === 'rak_factorial' ||
    config.type === 'split_plot';

  // Factorial local states
  const aVal = config.a || 2;
  const bVal = config.b || 3;
  const [prefA, setPrefA] = useState(config.prefixFactorA || 'A');
  const [prefB, setPrefB] = useState(config.prefixFactorB || 'B');
  const [nameA, setNameA] = useState(config.factorAName || 'Faktor A');
  const [nameB, setNameB] = useState(config.factorBName || 'Faktor B');
  const [startA, setStartA] = useState<0 | 1>(
    config.startIndexFactorA !== undefined ? config.startIndexFactorA : 1
  );
  const [startB, setStartB] = useState<0 | 1>(
    config.startIndexFactorB !== undefined ? config.startIndexFactorB : 1
  );

  // Level descriptions for Factorial
  const [descA, setDescA] = useState<string[]>(() => {
    return Array.from({ length: aVal }, (_, i) => {
      if (config.factorALevelDescriptions?.[i]) {
        return config.factorALevelDescriptions[i];
      }
      return `${config.factorAName || config.prefixFactorA || 'A'} ${
        (config.startIndexFactorA !== undefined ? config.startIndexFactorA : 1) + i
      }`;
    });
  });

  const [descB, setDescB] = useState<string[]>(() => {
    return Array.from({ length: bVal }, (_, j) => {
      if (config.factorBLevelDescriptions?.[j]) {
        return config.factorBLevelDescriptions[j];
      }
      return `${config.factorBName || config.prefixFactorB || 'B'} ${
        (config.startIndexFactorB !== undefined ? config.startIndexFactorB : 1) + j
      }`;
    });
  });

  // Non-Factorial local states
  const tVal = config.t || 5;
  const [prefT, setPrefT] = useState(config.prefixTreatment || 'P');
  const [startT, setStartT] = useState<0 | 1>(
    config.startIndexTreatment !== undefined ? config.startIndexTreatment : 0
  );
  const [descT, setDescT] = useState<string[]>(() => {
    return Array.from({ length: tVal }, (_, i) => {
      const num = (config.startIndexTreatment !== undefined ? config.startIndexTreatment : 0) + i;
      if (config.treatmentLevelDescriptions?.[i]) {
        return config.treatmentLevelDescriptions[i];
      }
      return num === 0 ? 'Kontrol' : `Perlakuan ${num}`;
    });
  });

  // Display style: full with parentheses vs code only
  const [useCodeOnly, setUseCodeOnly] = useState<boolean>(false);

  // Generate preview of resulting combination names
  const previewConfig: DesignConfig = {
    ...config,
    prefixFactorA: prefA,
    prefixFactorB: prefB,
    factorAName: nameA,
    factorBName: nameB,
    startIndexFactorA: startA,
    startIndexFactorB: startB,
    factorALevelDescriptions: descA,
    factorBLevelDescriptions: descB,
    prefixTreatment: prefT,
    startIndexTreatment: startT,
    treatmentLevelDescriptions: descT,
  };

  const { codes, names: fullNames } = generateTreatmentLabels(previewConfig, true);
  const previewNames = useCodeOnly ? codes : fullNames;

  const handleSave = () => {
    if (isFactorial) {
      onSave({
        prefixFactorA: prefA,
        prefixFactorB: prefB,
        factorAName: nameA,
        factorBName: nameB,
        startIndexFactorA: startA,
        startIndexFactorB: startB,
        factorALevelDescriptions: descA,
        factorBLevelDescriptions: descB,
        treatmentNames: previewNames,
      });
    } else {
      onSave({
        prefixTreatment: prefT,
        startIndexTreatment: startT,
        treatmentLevelDescriptions: descT,
        treatmentNames: previewNames,
      });
    }
    onClose();
  };

  // Reset / Sync descriptions strictly with current initials
  const handleSyncWithNewInitials = () => {
    if (isFactorial) {
      const newDescA = Array.from({ length: aVal }, (_, i) => {
        return `${prefA}${startA + i} (${nameA} ${startA + i})`;
      });
      const newDescB = Array.from({ length: bVal }, (_, j) => {
        return `${prefB}${startB + j} (${nameB} ${startB + j})`;
      });
      setDescA(newDescA);
      setDescB(newDescB);
    } else {
      const newDescT = Array.from({ length: tVal }, (_, i) => {
        const num = startT + i;
        return num === 0 ? 'Kontrol' : `${prefT}${num}`;
      });
      setDescT(newDescT);
    }
  };

  // Simple clean reset to default codes
  const handleResetToCleanCode = () => {
    if (isFactorial) {
      setDescA(Array.from({ length: aVal }, (_, i) => `${prefA}${startA + i}`));
      setDescB(Array.from({ length: bVal }, (_, j) => `${prefB}${startB + j}`));
    } else {
      setDescT(
        Array.from({ length: tVal }, (_, i) =>
          startT + i === 0 ? 'Kontrol' : `${prefT}${startT + i}`
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Kustomisasi Nama & Keterangan Perlakuan
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {config.shortName || config.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan inisial faktor (A/B atau P/N) dan isi keterangan dosis/level agar notasi perlakuan rapi & otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Quick Guidance Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-950 leading-relaxed">
              <strong>Penyesuaian Inisial Faktor:</strong> Jika Anda mengubah inisial dari misalnya{' '}
              <code className="bg-white px-1 rounded font-bold font-mono text-emerald-800">B & N</code> (Bokashi & NPK) menjadi inisial lain seperti{' '}
              <code className="bg-white px-1 rounded font-bold font-mono text-emerald-800">A & B</code> atau{' '}
              <code className="bg-white px-1 rounded font-bold font-mono text-emerald-800">P & K</code>,
              Anda dapat mengedit deskripsi level di bawah ini atau menekan tombol{' '}
              <span className="font-semibold underline">"Sinkronkan dengan Inisial Baru"</span> agar teks lama terhapus dan digantikan format baru.
            </div>
          </div>

          {isFactorial ? (
            <div className="space-y-6">
              {/* Factor Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Factor A Parameters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Pengaturan Faktor A
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{aVal} Level</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Inisial Huruf (A)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={prefA}
                        onChange={(e) => setPrefA(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-md py-1.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                        placeholder="A, B, P"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Mulai Indeks
                      </label>
                      <select
                        value={startA}
                        onChange={(e) => setStartA((parseInt(e.target.value) || 0) as 0 | 1)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                      >
                        <option value={0}>0 ({prefA}0, {prefA}1...)</option>
                        <option value={1}>1 ({prefA}1, {prefA}2...)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Faktor A
                    </label>
                    <input
                      type="text"
                      value={nameA}
                      onChange={(e) => setNameA(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 font-medium"
                      placeholder="cth: Pupuk Organik, Bokashi, Varietas"
                    />
                  </div>
                </div>

                {/* Factor B Parameters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Pengaturan Faktor B
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{bVal} Level</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Inisial Huruf (B)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={prefB}
                        onChange={(e) => setPrefB(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-md py-1.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                        placeholder="B, N, K"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Mulai Indeks
                      </label>
                      <select
                        value={startB}
                        onChange={(e) => setStartB((parseInt(e.target.value) || 0) as 0 | 1)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                      >
                        <option value={0}>0 ({prefB}0, {prefB}1...)</option>
                        <option value={1}>1 ({prefB}1, {prefB}2...)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Faktor B
                    </label>
                    <input
                      type="text"
                      value={nameB}
                      onChange={(e) => setNameB(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 font-medium"
                      placeholder="cth: Pupuk Anorganik, NPK, Ketinggian"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons for quick sync */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 py-3">
                <span className="font-semibold text-slate-700 text-[11px]">
                  Keterangan Tiap Level Perlakuan:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncWithNewInitials}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-600" />
                    Sinkronkan dengan Inisial Baru ({prefA} & {prefB})
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToCleanCode}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Hanya Kode ({prefA}1, {prefB}1...)
                  </button>
                </div>
              </div>

              {/* Factor A level descriptions */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Taraf / Dosis {nameA || 'Faktor A'} ({prefA}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {descA.map((val, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 focus-within:border-emerald-500"
                    >
                      <label className="font-mono font-bold text-emerald-800 block mb-1">
                        Level {prefA}{startA + i}:
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const copy = [...descA];
                          copy[i] = e.target.value;
                          setDescA(copy);
                        }}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium"
                        placeholder={`Keterangan ${prefA}${startA + i}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Factor B level descriptions */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Taraf / Dosis {nameB || 'Faktor B'} ({prefB}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {descB.map((val, j) => (
                    <div
                      key={j}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 focus-within:border-blue-500"
                    >
                      <label className="font-mono font-bold text-blue-800 block mb-1">
                        Level {prefB}{startB + j}:
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const copy = [...descB];
                          copy[j] = e.target.value;
                          setDescB(copy);
                        }}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium"
                        placeholder={`Keterangan ${prefB}${startB + j}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Non-Factorial per-treatment levels */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Inisial Huruf Perlakuan
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={prefT}
                    onChange={(e) => setPrefT(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-md py-1.5 text-slate-800"
                    placeholder="V, P, N"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Mulai Dari
                  </label>
                  <select
                    value={startT}
                    onChange={(e) => setStartT((parseInt(e.target.value) || 0) as 0 | 1)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                  >
                    <option value={0}>0 ({prefT}0 = Kontrol)</option>
                    <option value={1}>1 ({prefT}1, {prefT}2...)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-y border-slate-200 py-2.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Keterangan Nama Perlakuan ({tVal} Perlakuan):
                </span>
                <button
                  type="button"
                  onClick={handleSyncWithNewInitials}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-600" />
                  Sesuaikan dengan Inisial ({prefT})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {descT.map((val, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2"
                  >
                    <span className="font-mono font-bold text-emerald-800 w-12 shrink-0">
                      {prefT}{startT + i}:
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const copy = [...descT];
                        copy[i] = e.target.value;
                        setDescT(copy);
                      }}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-medium"
                      placeholder={`Keterangan ${prefT}${startT + i}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle format display */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800 block text-xs">
                Opsi Format Tampilan Notasi:
              </span>
              <span className="text-[11px] text-slate-500">
                Pilih apakah hanya menampilkan kode singkat atau menyertakan keterangan di dalam kurung.
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setUseCodeOnly(false)}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  !useCodeOnly
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kode + Keterangan
              </button>
              <button
                type="button"
                onClick={() => setUseCodeOnly(true)}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  useCodeOnly
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kode Singkat Saja
              </button>
            </div>
          </div>

          {/* Live Preview of generated treatment combinations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Pratinjau Hasil Label Perlakuan ({previewNames.length} Kombinasi):
              </span>
              <span className="text-[11px] text-slate-400">
                Akan muncul di Matriks, Denah, ANOVA & Excel
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200/80">
              {previewNames.map((name, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-2xs flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleResetToCleanCode}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset ke Kode Standar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Terapkan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
