import { CriticalValueRow, DesignConfig, PostHocResult, PostHocType, TreatmentMean } from '../types';
import {
  assignLetterNotations,
  duncanSSR,
  studentizedRangeQ,
  tDistributionPPF,
} from './statisticalMath';

export function calculatePostHoc(
  matrix: number[][],
  config: DesignConfig,
  ktg: number,
  dbg: number,
  method: PostHocType = 'bnt'
): PostHocResult {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;
  const r = numCols; // effective replication

  // Calculate row means
  const means: TreatmentMean[] = [];
  for (let i = 0; i < numRows; i++) {
    let sum = 0;
    for (let j = 0; j < numCols; j++) {
      sum += matrix[i][j] || 0;
    }
    const mean = numCols > 0 ? sum / numCols : 0;
    const name = config.treatmentNames?.[i] || `P${i + 1}`;
    means.push({
      id: `T${i}`,
      name,
      total: sum,
      mean,
      r,
    });
  }

  // Sort descending by mean
  const sortedMeans = [...means].sort((a, b) => b.mean - a.mean);
  sortedMeans.forEach((item, index) => {
    item.rank = index + 1;
  });

  const k = sortedMeans.length;
  // Standard error of the mean
  const sy = r > 0 && ktg > 0 ? Math.sqrt(ktg / r) : 0;
  const alpha = 0.05;

  const criticalValues: CriticalValueRow[] = [];
  let methodName = '';

  if (method === 'bnt') {
    methodName = 'Beda Nyata Terkecil (BNT / LSD 5%)';
    // t(0.05/2, dbg)
    const tVal = dbg > 0 ? tDistributionPPF(1 - alpha / 2, dbg) : 0;
    // BNT = t * sqrt(2 * KTG / r) = t * sy * sqrt(2)
    const bntCrit = tVal * Math.SQRT2 * sy;

    criticalValues.push({
      step: 1,
      label: 'BNT 5%',
      tabularValue: tVal,
      criticalDifference: bntCrit,
    });
  } else if (method === 'bnj') {
    methodName = 'Beda Nyata Jujur (BNJ / Tukey HSD 5%)';
    // q(alpha, k, dbg)
    const qVal = dbg > 0 ? studentizedRangeQ(alpha, k, dbg) : 0;
    // BNJ = q * sqrt(KTG / r) = q * sy
    const bnjCrit = qVal * sy;

    criticalValues.push({
      step: 1,
      label: 'BNJ 5%',
      tabularValue: qVal,
      criticalDifference: bnjCrit,
    });
  } else if (method === 'dmrt') {
    methodName = "Duncan's Multiple Range Test (DMRT 5%)";
    // For p = 2, 3, ..., k
    for (let p = 2; p <= k; p++) {
      const ssrVal = duncanSSR(p, dbg);
      const rpVal = ssrVal * sy;
      criticalValues.push({
        step: p,
        label: `Rentang p = ${p}`,
        tabularValue: ssrVal,
        criticalDifference: rpVal,
      });
    }
  }

  // Function to check if difference between rank u and rank v is significant
  const isSignificant = (u: number, v: number): boolean => {
    const diff = Math.abs(sortedMeans[u].mean - sortedMeans[v].mean);
    if (method === 'bnt' || method === 'bnj') {
      const crit = criticalValues[0]?.criticalDifference || 0;
      return diff >= crit;
    } else {
      // DMRT: step p = |u - v| + 1
      const step = Math.abs(u - v) + 1;
      const critRow = criticalValues.find((c) => c.step === step);
      const crit = critRow?.criticalDifference || 0;
      return diff >= crit;
    }
  };

  // Assign standard letters
  const lettersMap = assignLetterNotations(sortedMeans, isSignificant);
  sortedMeans.forEach((tm) => {
    tm.letters = lettersMap[tm.id] || 'a';
  });

  // Build pairwise difference matrix
  const matrixDiff: {
    rowId: string;
    colId: string;
    diff: number;
    isSignificant: boolean;
  }[][] = [];

  for (let i = 0; i < k; i++) {
    const row: {
      rowId: string;
      colId: string;
      diff: number;
      isSignificant: boolean;
    }[] = [];
    for (let j = 0; j < k; j++) {
      const diff = sortedMeans[i].mean - sortedMeans[j].mean;
      const sig = i < j ? isSignificant(i, j) : false;
      row.push({
        rowId: sortedMeans[i].id,
        colId: sortedMeans[j].id,
        diff,
        isSignificant: sig,
      });
    }
    matrixDiff.push(row);
  }

  // Create summary text
  const bestTreatment = sortedMeans[0];
  const summaryText = `Berdasarkan ${methodName}, perlakuan dengan nilai rata-rata tertinggi adalah ${bestTreatment.name} (${bestTreatment.mean.toFixed(
    3
  )} ${config.unit || ''}) dengan notasi huruf '${bestTreatment.letters}'. Perlakuan yang diikuti huruf yang sama menunjukkan tidak berbeda nyata pada taraf uji 5%.`;

  return {
    method,
    methodName,
    alpha,
    dbg,
    ktg,
    r,
    sy,
    criticalValues,
    sortedMeans,
    matrixDiff,
    summaryText,
  };
}
