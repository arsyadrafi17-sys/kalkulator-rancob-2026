import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';
import { AnovaResult, DesignConfig, PostHocResult, StepSection } from '../types';
import { exportToExcel } from '../utils/excelExporter';
import { generateStreamlitScript } from '../utils/pythonScriptGenerator';

interface TabExportProps {
  matrix: number[][];
  config: DesignConfig;
  anova: AnovaResult;
  steps: StepSection[];
  postHoc: PostHocResult;
}

export const TabExport: React.FC<TabExportProps> = ({
  matrix,
  config,
  anova,
  steps,
  postHoc,
}) => {
  const [copied, setCopied] = useState(false);
  const streamlitCode = generateStreamlitScript();

  const handleDownloadExcel = () => {
    exportToExcel(matrix, config, anova, steps, postHoc);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(streamlitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPythonScript = () => {
    const blob = new Blob([streamlitCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Excel Download Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Download Laporan Excel Resmi (.xlsx)
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Menghasilkan file spreadsheet Microsoft Excel berisi 4 lembar kerja (Sheet) lengkap: 
            <strong> Sheet 1: Data Pengamatan</strong>, 
            <strong> Sheet 2: Langkah Perhitungan</strong>, 
            <strong> Sheet 3: Tabel ANOVA</strong>, dan 
            <strong> Sheet 4: Uji Lanjut & Notasi</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          Download File .xlsx (4 Sheet)
        </button>
      </div>

      {/* Python Streamlit Script Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              Skrip Python Streamlit Utuh (app.py)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kode Python murni mandiri untuk dijalankan di komputer lokal menggunakan pustaka{' '}
              <code className="text-emerald-700 font-mono">streamlit</code>,{' '}
              <code className="text-emerald-700 font-mono">scipy</code>,{' '}
              <code className="text-emerald-700 font-mono">pandas</code>, dan{' '}
              <code className="text-emerald-700 font-mono">openpyxl</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Salin Kode (Copy)
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPythonScript}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download app.py
            </button>
          </div>
        </div>

        {/* How to run guide */}
        <div className="p-4 bg-slate-900 text-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cara menjalankan di terminal lokal:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded">
              pip install streamlit pandas numpy scipy statsmodels openpyxl
            </span>
            <span className="text-slate-500">lalu</span>
            <span className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded">
              streamlit run app.py
            </span>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="p-4 max-h-[460px] overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
          <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] text-emerald-300/90 selection:bg-emerald-900 selection:text-white">
            {streamlitCode}
          </pre>
        </div>
      </div>

      {/* Windows .EXE Desktop Packaging Guide Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              💻 Panduan Mengubah Menjadi Aplikasi Windows Desktop (.EXE)
            </h3>
            <p className="text-xs text-slate-500">
              Jalankan aplikasi ini di laptop/PC Windows seperti program desktop biasa tanpa perlu mengetik di terminal setiap saat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Method A: Launcher .BAT */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Cara 1: Launcher Sekali Klik (Paling Cepat & Ringan)
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Buat file teks bernama <code className="bg-white px-1.5 py-0.5 rounded font-mono font-semibold text-slate-800 border">Jalankan_Kalkulator.bat</code> di folder yang sama dengan <code className="font-mono">app.py</code>:
            </p>
            <pre className="bg-slate-900 text-emerald-300 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`@echo off
title Kalkulator Rancob by.M.A.R
streamlit run app.py
pause`}
            </pre>
            <p className="text-[11px] text-slate-500">
              Cukup klik 2 kali file <code className="font-mono">.bat</code> tersebut, aplikasi otomatis terbuka di layar. (Bisa diconvert ke <code className="font-mono">.exe</code> dengan software gratis <em>Bat To Exe Converter</em>).
            </p>
          </div>

          {/* Method B: Standalone PyInstaller */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Cara 2: Kompilasi Menjadi File .EXE Murni (PyInstaller)
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Gunakan wrapper <code className="font-mono">run_app.py</code> lalu jalankan perintah berikut di Command Prompt (CMD):
            </p>
            <pre className="bg-slate-900 text-emerald-300 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto">
{`pip install pyinstaller
pyinstaller --noconfirm --onedir --windowed ^
  --add-data "app.py;." ^
  --copy-metadata streamlit ^
  --name "Kalkulator_Rancob" run_app.py`}
            </pre>
            <p className="text-[11px] text-slate-500">
              Hasil file <code className="font-mono font-bold text-slate-800">Kalkulator_Rancob.exe</code> akan berada di folder <code className="font-mono">dist/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
