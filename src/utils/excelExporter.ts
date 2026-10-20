import * as XLSX from 'xlsx';
import { AnovaResult, DesignConfig, PostHocResult, StepSection } from '../types';

export function exportToExcel(
  matrix: number[][],
  config: DesignConfig,
  anova: AnovaResult,
  steps: StepSection[],
  postHoc: PostHocResult
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Matriks Data Pengamatan
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;

  const dataSheetRows: (string | number)[][] = [];
  dataSheetRows.push([`Kalkulator Rancob by.arsyad - Matriks Data Pengamatan`]);
  dataSheetRows.push([`Rancangan: ${config.name}`]);
  dataSheetRows.push([`Peubah Diamati: ${config.variableName} (${config.unit})`]);
  dataSheetRows.push([]); // blank

  // Header row
  const colHeader: (string | number)[] = ['Perlakuan'];
  for (let j = 0; j < numCols; j++) {
    colHeader.push(config.blockNames?.[j] || `U${j + 1}`);
  }
  colHeader.push('Total (Yi.)', 'Rata-rata (Ȳi)');
  dataSheetRows.push(colHeader);

  // Data rows
  for (let i = 0; i < numRows; i++) {
    const rowName = config.treatmentNames?.[i] || `P${i + 1}`;
    const rowVals: (string | number)[] = [rowName];
    let rowSum = 0;
    for (let j = 0; j < numCols; j++) {
      const val = matrix[i][j] || 0;
      rowVals.push(val);
      rowSum += val;
    }
    const rowMean = numCols > 0 ? rowSum / numCols : 0;
    rowVals.push(Number(rowSum.toFixed(4)), Number(rowMean.toFixed(4)));
    dataSheetRows.push(rowVals);
  }

  // Footer: Grand total & Grand mean
  const footerRow: (string | number)[] = ['Grand Total'];
  for (let j = 0; j < numCols; j++) {
    let colSum = 0;
    for (let i = 0; i < numRows; i++) {
      colSum += matrix[i][j] || 0;
    }
    footerRow.push(Number(colSum.toFixed(4)));
  }
  footerRow.push(Number(anova.grandTotal.toFixed(4)), Number(anova.grandMean.toFixed(4)));
  dataSheetRows.push(footerRow);

  const ws1 = XLSX.utils.aoa_to_sheet(dataSheetRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Data Pengamatan');

  // 2. Sheet 2: Langkah Perhitungan (FK, JK, KT)
  const stepsRows: (string | number)[][] = [];
  stepsRows.push(['Kalkulator Rancob by.arsyad - Detail Langkah Perhitungan']);
  stepsRows.push([]);
  stepsRows.push(['Komponen', 'Nama Parameter', 'Rumus Matematis', 'Substitusi Nilai', 'Nilai Hasil']);

  steps.forEach((sec) => {
    stepsRows.push([`[ ${sec.title} ]`, '', '', '', '']);
    sec.items.forEach((item) => {
      const formattedRes =
        typeof item.result === 'number' ? Number(item.result.toFixed(4)) : item.result;
      stepsRows.push([item.id.toUpperCase(), item.name, item.formula, item.substitution, formattedRes]);
    });
    stepsRows.push([]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(stepsRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Langkah Perhitungan');

  // 3. Sheet 3: Tabel ANOVA
  const anovaRows: (string | number)[][] = [];
  anovaRows.push(['Kalkulator Rancob by.arsyad - Tabel Sidik Ragam (ANOVA)']);
  anovaRows.push([`Rancangan: ${config.name}`]);
  anovaRows.push([]);
  anovaRows.push([
    'Sumber Keragaman (SK)',
    'Derajat Bebas (DB)',
    'Jumlah Kuadrat (JK)',
    'Kuadrat Tengah (KT)',
    'F Hitung',
    'F Tabel 0.05',
    'F Tabel 0.01',
    'Keterangan',
  ]);

  anova.rows.forEach((r) => {
    anovaRows.push([
      r.sk,
      r.db,
      Number(r.jk.toFixed(4)),
      r.kt > 0 ? Number(r.kt.toFixed(4)) : '-',
      r.fHitung !== null ? Number(r.fHitung.toFixed(4)) : '-',
      r.fTabel05 !== null ? Number(r.fTabel05.toFixed(4)) : '-',
      r.fTabel01 !== null ? Number(r.fTabel01.toFixed(4)) : '-',
      r.ket,
    ]);
  });

  anovaRows.push([]);
  anovaRows.push([`Koefisien Keragaman (KK)`, `${anova.kk.toFixed(2)} %`]);
  anovaRows.push([
    `Keterangan:`,
    `** = Berbeda Sangat Nyata (p < 0.01) | * = Berbeda Nyata (p < 0.05) | tn = Tidak Nyata (p >= 0.05)`,
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(anovaRows);
  XLSX.utils.book_append_sheet(wb, ws3, 'Tabel ANOVA');

  // 4. Sheet 4: Uji Lanjut & Notasi
  const postHocRows: (string | number)[][] = [];
  postHocRows.push([`Kalkulator Rancob by.arsyad - Hasil Uji Lanjut: ${postHoc.methodName}`]);
  postHocRows.push([]);
  postHocRows.push(['Peringkat', 'Perlakuan', `Rata-rata (${config.unit})`, 'Notasi Huruf']);

  postHoc.sortedMeans.forEach((tm) => {
    postHocRows.push([
      tm.rank || 1,
      tm.name,
      Number(tm.mean.toFixed(4)),
      tm.letters || 'a',
    ]);
  });

  postHocRows.push([]);
  postHocRows.push(['Nilai Kritis Uji Lanjut']);
  postHocRows.push(['Parameter', 'Nilai Tabel (t / q / SSR)', 'Nilai Kritis Beda']);
  postHoc.criticalValues.forEach((cv) => {
    postHocRows.push([
      cv.label,
      Number(cv.tabularValue.toFixed(4)),
      Number(cv.criticalDifference.toFixed(4)),
    ]);
  });

  postHocRows.push([]);
  postHocRows.push(['Kesimpulan Ilmiah:']);
  postHocRows.push([postHoc.summaryText]);

  const ws4 = XLSX.utils.aoa_to_sheet(postHocRows);
  XLSX.utils.book_append_sheet(wb, ws4, 'Uji Lanjut & Notasi');

  // Trigger download
  const fileName = `AgroStat_Analisis_${config.type}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
