import React, { useState } from 'react';
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  TrendingDown,
  Wrench,
} from 'lucide-react';
import { DesignConfig, FieldLayoutResult } from '../types';
import { randomizeFieldLayout } from '../utils/fieldRandomizer';

interface TabFieldMapProps {
  config: DesignConfig;
  onNavigateToMatrix?: () => void;
}

export const TabFieldMap: React.FC<TabFieldMapProps> = ({ config, onNavigateToMatrix }) => {
  const [seed, setSeed] = useState<number>(42);
  const [compassAngle, setCompassAngle] = useState<number>(0);

  // Interactive Plot Sampling Calculator States
  const [totalPlantsPerBed, setTotalPlantsPerBed] = useState<number>(8);
  const [plantArrangement, setPlantArrangement] = useState<'single_row' | 'double_row'>('double_row');
  const [sampleValuesInput, setSampleValuesInput] = useState<string>('14.2, 14.5, 13.8, 14.1');

  const fieldLayout: FieldLayoutResult = React.useMemo(() => {
    return randomizeFieldLayout(config, seed, compassAngle);
  }, [config, seed, compassAngle]);

  const handleRandomize = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const getCompassLabel = (angle: number) => {
    if (angle === 0) return 'Utara (0°)';
    if (angle === 90) return 'Timur (90°)';
    if (angle === 180) return 'Selatan (180°)';
    if (angle === 270) return 'Barat (270°)';
    return `${angle}°`;
  };

  // 1. Tanaman Pinggir (Border Plants):
  // Untuk bedengan populasi kecil (<= 12 tanaman), cukup 2 tanaman di kedua ujung bedengan.
  const borderPlants =
    totalPlantsPerBed <= 12
      ? 2
      : Math.min(6, Math.max(4, Math.round(totalPlantsPerBed * 0.2)));
  const effectivePlants = Math.max(1, totalPlantsPerBed - borderPlants);

  // 2. Rekomendasi Tanaman Sampel Berdasarkan Kaidah Agronomi Baku (Gomez & Gomez; Harjosudarmo)
  // Jumlah tanaman sampel meningkat secara konsisten dan logis sesuai ukuran populasi:
  let recommendedSampleCount = 3;
  if (totalPlantsPerBed <= 4) {
    recommendedSampleCount = 2; // 4 tanaman: 2 border, 2 sampel
  } else if (totalPlantsPerBed <= 6) {
    recommendedSampleCount = 2; // 6 tanaman: 2 border, 4 efektif -> 2 sampel (50% dari efektif)
  } else if (totalPlantsPerBed <= 8) {
    recommendedSampleCount = 3; // 8 tanaman: 2 border, 6 efektif -> 3 sampel (50% dari efektif)
  } else if (totalPlantsPerBed <= 10) {
    recommendedSampleCount = 3; // 10 tanaman: 2 border, 8 efektif -> 3-4 sampel
  } else if (totalPlantsPerBed <= 12) {
    recommendedSampleCount = 4; // 12 tanaman: 2 border, 10 efektif -> 4 sampel
  } else if (totalPlantsPerBed <= 16) {
    recommendedSampleCount = 5; // 16 tanaman: 4 border, 12 efektif -> 5 sampel
  } else if (totalPlantsPerBed <= 24) {
    recommendedSampleCount = 6;
  } else {
    recommendedSampleCount = Math.min(10, Math.max(6, Math.round(effectivePlants * 0.15)));
  }

  // Parse quick sub-sample values
  const parsedSamples = sampleValuesInput
    .split(/[,;\s]+/)
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));
  const sampleAverage =
    parsedSamples.length > 0
      ? parsedSamples.reduce((a, b) => a + b, 0) / parsedSamples.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Langkah 1: Perencanaan
            </span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Denah Lapang, Pengacakan & Panduan Tanaman Sampel
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rencanakan tata letak bedengan, orientasi arah hadap matahari, dan aturan pengambilan sampel tanaman sebelum memasukkan data pengamatan ke Matriks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRandomize}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Acak Ulang Denah (Randomize)
          </button>

          {onNavigateToMatrix && (
            <button
              onClick={onNavigateToMatrix}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>Lanjut ke Tab 2 (Matriks Data)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SPECIAL SECTION: PANDUAN PENGAMBILAN SAMPEL TANAMAN */}
      <div className="bg-white rounded-xl border-2 border-emerald-500/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panduan Pengambilan Tanaman Sampel Tiap Bedengan / Plot
              </h3>
              <p className="text-xs text-slate-500">
                Kaidah baku memasukkan data dari populasi bedengan ke dalam 1 sel matriks ANOVA
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Aturan Standar Gomez & Gomez
          </span>
        </div>

        {/* Question & Answer Box */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2.5">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            Apakah semua tanaman dalam 1 bedengan diukur datanya lalu dimasukkan ke matriks?
          </div>
          <p className="leading-relaxed">
            <strong>JAWABAN: TIDAK.</strong> Nilai yang dimasukkan ke dalam <strong>1 sel Matriks ANOVA adalah NILAI RATA-RATA dari tanaman sampel</strong> pada plot tersebut (atau total hasil panen petak efektif).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white/90 p-3 rounded-lg border border-emerald-200/70 space-y-1">
              <span className="font-bold text-emerald-900 block">1. Efek Tepi (Border Effect)</span>
              <p className="text-[11px] text-slate-600">
                Tanaman di baris paling pinggir <strong>tidak boleh dijadikan sampel</strong> karena menerima cahaya berlebih dan kompetisi tidak seimbang.
              </p>
            </div>
            <div className="bg-white/90 p-3 rounded-lg border border-emerald-200/70 space-y-1">
              <span className="font-bold text-emerald-900 block">2. Petak Efektif (Bagian Dalam)</span>
              <p className="text-[11px] text-slate-600">
                Pilih tanaman sampel hanya dari baris bagian dalam (petak efektif) secara acak tanpa pilih kasih (acak sederhana bertanda label).
              </p>
            </div>
            <div className="bg-white/90 p-3 rounded-lg border border-emerald-200/70 space-y-1">
              <span className="font-bold text-emerald-900 block">3. Input ke Matriks ANOVA</span>
              <p className="text-[11px] text-slate-600">
                Hitung rata-rata: <code className="font-mono text-emerald-800 font-bold">Ȳ = (y₁ + y₂ + y₃ + ... + yₖ) / k</code>. Angka rata-rata inilah yang dimasukkan ke 1 sel matriks di Tab 2.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Sampling Calculator for the User's Plot */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Simulasi Populasi Bedengan Anda
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Jumlah Tanaman per Bedengan:
                </label>
                <input
                  type="number"
                  min={4}
                  max={200}
                  value={totalPlantsPerBed}
                  onChange={(e) => setTotalPlantsPerBed(Math.max(4, parseInt(e.target.value) || 8))}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pola Barisan di Bedengan:
                </label>
                <select
                  value={plantArrangement}
                  onChange={(e) => setPlantArrangement(e.target.value as 'single_row' | 'double_row')}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer"
                >
                  <option value="double_row">2 Baris per Bedengan (Umum)</option>
                  <option value="single_row">1 Baris per Bedengan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Breakdown recommendation */}
          <div className="space-y-2 border-l border-slate-200 md:pl-5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center justify-between">
              <span>Rekomendasi Proporsi Tanaman (Khusus RAK)</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Bedengan Lapangan
              </span>
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Total Tanaman di Bedengan:</span>
                <span className="font-mono font-bold text-slate-900">{totalPlantsPerBed} tanaman</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Tanaman Baris Pinggir (Border):</span>
                <span className="font-mono font-bold text-amber-700">{borderPlants} tanaman (Dibuang/Non-Sampel)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Populasi Petak Efektif:</span>
                <span className="font-mono font-bold text-slate-800">{effectivePlants} tanaman</span>
              </div>
              <div className="flex justify-between py-1.5 bg-emerald-50 px-2 rounded-md font-bold">
                <span className="text-emerald-900">Saran Tanaman Sampel Diukur:</span>
                <span className="font-mono text-emerald-800 text-sm">{recommendedSampleCount} tanaman terpilih</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal pt-1">
              Untuk populasi {totalPlantsPerBed} tanaman, beri nomor/label permanen pada {recommendedSampleCount} tanaman sampel sejak umur 7–14 HST untuk pengamatan tinggi, daun, atau bobot buah.
            </p>
          </div>

          {/* Quick Sub-sample Average Calculator */}
          <div className="border-l border-slate-200 md:pl-5 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Kalkulator Rata-Rata Sampel Cepat
            </span>
            <p className="text-[10px] text-slate-500">
              Ketik nilai hasil ukur {recommendedSampleCount} tanaman sampel (pisahkan koma):
            </p>
            <input
              type="text"
              value={sampleValuesInput}
              onChange={(e) => setSampleValuesInput(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="14.2, 14.5, 13.8, 14.1"
            />
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600">Rata-rata Nilai Plot:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm tabular-nums">
                {sampleAverage.toFixed(3)}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">
              → Angka {sampleAverage.toFixed(3)} inilah yang diketikkan ke dalam 1 sel di Tab 2 (Matriks Data).
            </p>
          </div>
        </div>
      </div>

      {/* Compass & Orientation Control Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Compass Widget */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-white rounded-full border-2 border-emerald-500 shadow-xs">
            <div
              style={{ transform: `rotate(${compassAngle}deg)` }}
              className="w-full h-full relative transition-transform duration-300 flex items-center justify-center"
            >
              <div className="absolute top-1 font-bold text-[10px] text-rose-600">U</div>
              <div className="absolute bottom-1 font-bold text-[10px] text-slate-600">S</div>
              <div className="absolute right-1.5 font-bold text-[10px] text-slate-600">T</div>
              <div className="absolute left-1.5 font-bold text-[10px] text-slate-600">B</div>
              <div className="w-0.5 h-8 bg-linear-to-b from-rose-600 to-slate-400 rounded-full" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Arah Hadap Bedengan
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {fieldLayout.compassDirectionLabel} ({getCompassLabel(compassAngle)})
            </span>
            <div className="flex gap-1 pt-1">
              {[0, 90, 180, 270].map((ang) => (
                <button
                  key={ang}
                  onClick={() => setCompassAngle(ang)}
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    compassAngle === ang
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ang === 0 ? 'U-S' : ang === 90 ? 'T-B' : ang === 180 ? 'S-U' : 'B-T'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Agronomy Notes */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
            <Sun className="w-4 h-4 shrink-0" />
            <span>
              <strong>Penyinaran Surya:</strong> Bedengan membujur Utara-Selatan membuat kanopi tanaman menerima sinar matahari pagi dan sore merata.
            </span>
          </div>
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50/70 p-2 rounded-lg border border-blue-200/60">
            <TrendingDown className="w-4 h-4 shrink-0" />
            <span>
              <strong>Gradien Kesuburan:</strong> Kelompok disusun tegak lurus arah aliran air / lereng tanah agar homogen di dalam kelompok.
            </span>
          </div>
        </div>

        {/* Scientific Randomization Rule badge */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Aturan Pengacakan Ilmiah
          </span>
          <p className="font-medium text-slate-800">
            {config.type.includes('ral')
              ? 'RAL: Pengacakan bebas total secara serempak ke seluruh petak tanpa pembatasan kelompok.'
              : config.type === 'split_plot'
              ? 'Split Plot: Pengacakan bertingkat (Petak Utama diacak di tiap kelompok, Anak Petak diacak di dalam Petak Utama).'
              : 'RAK: Pengacakan dilakukan terpisah di dalam masing-masing kelompok ulangan.'}
          </p>
        </div>
      </div>

      {/* Visual Field Layout Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            Peta Tata Letak Bedengan / Plot Percobaan ({fieldLayout.totalPlots} Petakan)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Seed Pengacakan: #{seed}
          </span>
        </div>

        {/* Render Blocks */}
        <div className="space-y-6">
          {fieldLayout.blocks.map((block) => (
            <div
              key={block.blockIndex}
              className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-1 rounded-md border border-emerald-200">
                  {block.blockLabel}
                </span>
                <span className="text-[11px] text-slate-500">
                  {block.plots.length} Plot Bedengan
                </span>
              </div>

              {/* Grid of plots in this block */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {block.plots.map((plot) => (
                  <div
                    key={plot.plotNumber}
                    style={{ borderTopColor: plot.colorTag }}
                    className="bg-white rounded-lg p-3 border border-slate-200 border-t-4 shadow-2xs hover:shadow-sm transition-shadow relative flex flex-col justify-between min-h-[92px]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        Plot #{plot.plotNumber}
                      </span>
                      {plot.mainPlotLabel && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">
                          {plot.mainPlotLabel}
                        </span>
                      )}
                    </div>

                    <div className="my-auto text-center py-1">
                      <span
                        style={{ color: plot.colorTag }}
                        className="font-mono font-bold text-lg tracking-tight block"
                      >
                        {plot.treatmentCode}
                      </span>
                    </div>

                    <span
                      title={plot.treatmentName}
                      className="text-[10px] text-slate-600 font-medium truncate block text-center border-t border-slate-100 pt-1"
                    >
                      {plot.treatmentName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Drainage Canal & Alley Annotation */}
        <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center justify-between">
          <span>
            💧 <strong>Parit Drainase:</strong> Sediakan parit selebar 40–50 cm antar bedengan dan jalan kontrol kelompok 80–100 cm.
          </span>
          <span className="font-semibold text-blue-700">Tinggi Bedengan: 20–30 cm</span>
        </div>
      </div>

      {/* Tata Cara Menyusun Peta Map di Lapangan (Agronomic Guidelines) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Wrench className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Panduan Praktis: Tata Cara Pembuatan & Penataan Denah Percobaan di Lahan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Pengukuran & Orientasi Arah Mata Angin</h4>
                <p className="text-slate-600 mt-0.5">
                  Gunakan kompas untuk menentukan arah <strong>Utara - Selatan</strong>. Arahkan panjang bedengan membujur Utara-Selatan agar kanopi pertanaman menerima intensitas sinar surya secara optimal dan seragam dari fajar hingga petang.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Penentuan Kelompok Berdasarkan Gradien (Khusus RAK)</h4>
                <p className="text-slate-600 mt-0.5">
                  Identifikasi sumber keragaman lingkungan seperti kemiringan lereng, arah aliran irigasi, atau naungan pepohonan. Bentuk <strong>Kelompok I, II, dan III memotong tegak lurus arah kemiringan lereng</strong> sehingga kondisi tanah di dalam satu kelompok relatif homogen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Pembuatan Bedengan & Parit Drainase</h4>
                <p className="text-slate-600 mt-0.5">
                  Olah tanah secara seragam. Buat bedengan dengan ukuran yang identik (misal: panjang 3–5 m, lebar 1–1.2 m, tinggi 20–30 cm). Sediakan parit antar bedengan selebar 40–50 cm dan parit antar kelompok selebar 80–100 cm sebagai jalan pemeriksaan.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Pemasangan Patok & Label Identitas Plot</h4>
                <p className="text-slate-600 mt-0.5">
                  Setelah pengacakan denah di atas selesai, tancapkan patok bambu/kayu setinggi 50 cm di sudut barat laut atau kiri depan setiap bedengan. Tuliskan nomor plot dan kode perlakuan dengan cat anti-air atau spidol permanen (misal: <em>Plot 1: P0, Plot 2: P3</em>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                5
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Penanaman Baris Pinggir (Border Row / Guard Row)</h4>
                <p className="text-slate-600 mt-0.5">
                  Untuk menghindari pengaruh tepi (<em>border effect</em>) seperti hembusan angin luar dan intensitas cahaya berlebih di tepi lahan, tanam 1–2 baris tanaman pengaman di sekeliling area percobaan. Tanaman pada baris pengaman ini tidak diukur sebagai sampel hasil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                6
              </span>
              <div>
                <h4 className="font-bold text-slate-900">Pencatatan Buku Lapang (Field Book)</h4>
                <p className="text-slate-600 mt-0.5">
                  Salin urutan plot hasil pengacakan ini ke dalam buku catatan lapang sebelum turun ke kebun. Seluruh aplikasi perlakuan (pemupukan, penyemprotan, inokulasi) harus dilakukan dengan cermat mengikuti nomor patok yang tertera.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
