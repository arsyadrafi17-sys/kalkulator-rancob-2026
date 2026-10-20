import React from 'react';
import { Download, FileSpreadsheet, RotateCcw, Sprout } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excelImporter';

interface NavbarProps {
  onReset: () => void;
  onExportExcel: () => void;
  designName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onExportExcel,
  designName,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap leading-tight">
            Kalkulator Rancob <span className="text-emerald-600 font-semibold text-sm">by.M.A.R</span>
          </h1>
          <p className="text-xs text-slate-500 whitespace-nowrap">
            Kalkulator Perancangan Percobaan, ANOVA & Uji Lanjut Otomatis
          </p>
        </div>
      </div>

      {/* Zone 2: Informational / Design scope */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 font-medium">
        <span className="text-slate-400">Rancangan Aktif:</span>
        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 truncate max-w-xs">
          {designName}
        </span>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => downloadExcelTemplate(designName)}
          title="Unduh format file Excel untuk input data pengamatan"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          Template Excel
        </button>

        <button
          onClick={onReset}
          title="Reset data ke nilai awal"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Excel (.xlsx)
        </button>
      </div>
    </header>
  );
};
