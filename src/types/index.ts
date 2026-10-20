export type DesignType =
  | 'ral_non_factorial'
  | 'rak_non_factorial'
  | 'ral_factorial'
  | 'rak_factorial'
  | 'split_plot';

export type PostHocType = 'bnt' | 'bnj' | 'dmrt';

export interface DesignConfig {
  type: DesignType;
  name: string;
  shortName: string;
  description: string;
  // Parameters
  t: number; // Treatments for non-factorial
  a: number; // Factor A levels
  b: number; // Factor B levels
  r: number; // Replications or Blocks

  // Custom Naming & Initial Prefixes
  prefixTreatment: string; // e.g. "V", "P", "N"
  startIndexTreatment: 0 | 1; // 0 or 1
  prefixFactorA: string; // e.g. "A", "Bokashi / B", "Olah Tanah / OT"
  startIndexFactorA: 0 | 1;
  prefixFactorB: string; // e.g. "B", "NPK / N", "Pupuk / P"
  startIndexFactorB: 0 | 1;

  factorAName?: string;
  factorBName?: string;
  treatmentNames?: string[];
  blockNames?: string[];
  treatmentLevelDescriptions?: string[];
  factorALevelDescriptions?: string[];
  factorBLevelDescriptions?: string[];
  variableName: string;
  unit: string;
}

export interface AnovaRow {
  sk: string; // Sumber Keragaman
  db: number; // Derajat Bebas
  jk: number; // Jumlah Kuadrat
  kt: number; // Kuadrat Tengah
  fHitung: number | null; // F Hitung
  fTabel05: number | null; // F Tabel 5%
  fTabel01: number | null; // F Tabel 1%
  ket: '**' | '*' | 'tn' | '-'; // Keterangan
  pValue?: number;
}

export interface AnovaResult {
  designType: DesignType;
  grandTotal: number;
  nTotal: number;
  grandMean: number;
  fk: number;
  rows: AnovaRow[];
  kk: number; // Koefisien Keragaman (%)
  ktg: number;
  dbg: number;
  rEff: number; // Effective replication for post-hoc
  hasSignificance: boolean;
  significantFactors: string[];
}

export interface StepItem {
  id: string;
  name: string;
  formula: string;
  substitution: string;
  result: number | string;
  unit?: string;
  note?: string;
}

export interface StepSection {
  title: string;
  description?: string;
  items: StepItem[];
}

export interface TreatmentMean {
  id: string;
  name: string;
  total: number;
  mean: number;
  r: number;
  rank?: number;
  letters?: string;
}

export interface CriticalValueRow {
  step: number;
  label: string;
  tabularValue: number;
  criticalDifference: number;
}

export interface PostHocResult {
  method: PostHocType;
  methodName: string;
  alpha: number;
  dbg: number;
  ktg: number;
  r: number;
  sy: number;
  criticalValues: CriticalValueRow[];
  sortedMeans: TreatmentMean[];
  matrixDiff: {
    rowId: string;
    colId: string;
    diff: number;
    isSignificant: boolean;
  }[][];
  summaryText: string;
}

export interface PresetData {
  id: string;
  title: string;
  description: string;
  designType: DesignType;
  variableName: string;
  unit: string;
  t?: number;
  a?: number;
  b?: number;
  r: number;
  prefixTreatment?: string;
  startIndexTreatment?: 0 | 1;
  prefixFactorA?: string;
  startIndexFactorA?: 0 | 1;
  prefixFactorB?: string;
  startIndexFactorB?: 0 | 1;
  factorAName?: string;
  factorBName?: string;
  treatmentNames?: string[];
  treatmentLevelDescriptions?: string[];
  factorALevelDescriptions?: string[];
  factorBLevelDescriptions?: string[];
  blockNames?: string[];
  data: number[][];
}

// Field Map / Plot Layout types
export interface PlotUnit {
  plotNumber: number;
  blockIndex?: number; // for RAK
  blockLabel?: string;
  mainPlotIndex?: number; // for Split Plot
  mainPlotLabel?: string;
  treatmentCode: string;
  treatmentName: string;
  treatmentIndex: number;
  colorTag: string;
}

export interface FieldBlock {
  blockIndex: number;
  blockLabel: string;
  plots: PlotUnit[];
}

export interface FieldLayoutResult {
  designType: DesignType;
  totalPlots: number;
  blocks: FieldBlock[];
  gridMatrix?: PlotUnit[][]; // 2D layout (rows x cols)
  gridRows: number;
  gridCols: number;
  compassAngle: number; // 0 = North, 90 = East, 180 = South, 270 = West
  compassDirectionLabel: string; // e.g. "Utara - Selatan"
  sunOrientation: string;
  slopeOrientation: string;
  recommendations: string[];
}
