import * as XLSX from 'xlsx';

export interface ImportedDataResult {
  matrix: number[][];
  treatmentNames: string[];
  blockNames: string[];
  variableName?: string;
}

/**
 * Parses an Excel file (.xlsx, .xls) or CSV into a numerical matrix
 * with extracted row treatment labels and column headers.
 */
export async function parseExcelFile(file: File): Promise<ImportedDataResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array of raw values
  const rawData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawData || rawData.length === 0) {
    throw new Error('File Excel kosong atau tidak terbaca.');
  }

  // Find the header row (first row with multiple populated columns)
  let headerRowIdx = -1;
  for (let r = 0; r < rawData.length; r++) {
    const row = rawData[r];
    const nonEmpties = row.filter((cell) => cell !== '' && cell !== undefined);
    if (nonEmpties.length >= 2) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('Format tabel tidak ditemukan di dalam lembar Excel.');
  }

  const headerRow = rawData[headerRowIdx];
  // Determine block / replication column names (starting from col index 1)
  const blockNames: string[] = [];
  for (let c = 1; c < headerRow.length; c++) {
    const headerVal = String(headerRow[c] || '').trim();
    // Stop if we hit a summary column like 'Total', 'Rata-rata', 'Mean', 'Jumlah'
    if (
      headerVal.toLowerCase().includes('total') ||
      headerVal.toLowerCase().includes('rata') ||
      headerVal.toLowerCase().includes('mean') ||
      headerVal.toLowerCase().includes('sum')
    ) {
      break;
    }
    blockNames.push(headerVal || `Ulangan ${c}`);
  }

  const numCols = blockNames.length;
  if (numCols === 0) {
    throw new Error('Kolom ulangan/kelompok tidak terdeteksi.');
  }

  const matrix: number[][] = [];
  const treatmentNames: string[] = [];

  // Read data rows
  for (let r = headerRowIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    const rowLabel = String(row[0] || '').trim();

    // Stop if row is a footer like 'Total', 'Grand Total', 'Rata-rata'
    if (
      rowLabel.toLowerCase().includes('total') ||
      rowLabel.toLowerCase().includes('rata') ||
      rowLabel.toLowerCase().includes('mean') ||
      rowLabel.toLowerCase().includes('jumlah')
    ) {
      break;
    }

    if (!rowLabel && row.slice(1, numCols + 1).every((val) => val === '' || val === undefined)) {
      continue; // empty row
    }

    treatmentNames.push(rowLabel || `P${matrix.length + 1}`);
    const numRow: number[] = [];
    for (let c = 1; c <= numCols; c++) {
      const rawVal = row[c];
      const parsedNum = parseFloat(String(rawVal).replace(',', '.'));
      numRow.push(isNaN(parsedNum) ? 0 : parsedNum);
    }
    matrix.push(numRow);
  }

  if (matrix.length === 0) {
    throw new Error('Tidak ada baris data perlakuan yang valid.');
  }

  return {
    matrix,
    treatmentNames,
    blockNames,
  };
}

/**
 * Downloads a sample Excel template for users to fill locally
 */
export function downloadExcelTemplate(designName: string = 'RAL_RAK') {
  const wb = XLSX.utils.book_new();
  const templateRows = [
    ['Perlakuan', 'Ulangan 1', 'Ulangan 2', 'Ulangan 3', 'Ulangan 4'],
    ['Kontrol (P0)', 12.5, 13.0, 12.8, 13.2],
    ['Dosis 1 (P1)', 15.4, 16.1, 15.8, 16.0],
    ['Dosis 2 (P2)', 19.8, 20.2, 19.5, 20.0],
    ['Dosis 3 (P3)', 24.3, 23.9, 24.5, 24.0],
    ['Dosis 4 (P4)', 22.1, 21.8, 22.4, 22.0],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `AgroStat_Template_Input_${designName}.xlsx`);
}
