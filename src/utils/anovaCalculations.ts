import { AnovaResult, AnovaRow, DesignConfig, StepSection } from '../types';
import { fDistributionPPF } from './statisticalMath';

export function calculateAnova(
  matrix: number[][],
  config: DesignConfig
): { anova: AnovaResult; steps: StepSection[] } {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;

  // Flatten and calculate sum and sum of squares
  let grandTotal = 0;
  let sumSqAll = 0;
  let nTotal = 0;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const val = matrix[i][j] || 0;
      grandTotal += val;
      sumSqAll += val * val;
      nTotal++;
    }
  }

  const grandMean = nTotal > 0 ? grandTotal / nTotal : 0;
  const fk = nTotal > 0 ? (grandTotal * grandTotal) / nTotal : 0;
  const jkt = sumSqAll - fk;

  // Row sums & Col sums
  const rowSums: number[] = new Array(numRows).fill(0);
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      rowSums[i] += matrix[i][j] || 0;
    }
  }

  const colSums: number[] = new Array(numCols).fill(0);
  for (let j = 0; j < numCols; j++) {
    for (let i = 0; i < numRows; i++) {
      colSums[j] += matrix[i][j] || 0;
    }
  }

  const rows: AnovaRow[] = [];
  const steps: StepSection[] = [];
  let ktg = 0;
  let dbg = 1;
  let rEff = numCols;
  const significantFactors: string[] = [];

  const helperKet = (f: number | null, f05: number | null, f01: number | null): '**' | '*' | 'tn' | '-' => {
    if (f === null || f05 === null || f01 === null) return '-';
    if (f >= f01) return '**';
    if (f >= f05) return '*';
    return 'tn';
  };

  if (config.type === 'ral_non_factorial') {
    const t = numRows;
    const r = numCols;
    const dbp = t - 1;
    dbg = t * (r - 1);
    const dbt = nTotal - 1;
    rEff = r;

    let sumSqRow = 0;
    rowSums.forEach((s) => (sumSqRow += s * s));
    const jkp = sumSqRow / r - fk;
    const jkg = Math.max(0, jkt - jkp);

    const ktp = dbp > 0 ? jkp / dbp : 0;
    ktg = dbg > 0 ? jkg / dbg : 0;

    const fHitungP = ktg > 0 ? ktp / ktg : 0;
    const fTabel05P = fDistributionPPF(0.95, dbp, dbg);
    const fTabel01P = fDistributionPPF(0.99, dbp, dbg);
    const ketP = helperKet(fHitungP, fTabel05P, fTabel01P);
    if (ketP === '*' || ketP === '**') significantFactors.push('Perlakuan');

    rows.push({
      sk: 'Perlakuan',
      db: dbp,
      jk: jkp,
      kt: ktp,
      fHitung: fHitungP,
      fTabel05: fTabel05P,
      fTabel01: fTabel01P,
      ket: ketP,
    });
    rows.push({
      sk: 'Galat',
      db: dbg,
      jk: jkg,
      kt: ktg,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });
    rows.push({
      sk: 'Total',
      db: dbt,
      jk: jkt,
      kt: 0,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });

    steps.push({
      title: '1. Faktor Koreksi (FK) & Jumlah Kuadrat Total (JKT)',
      items: [
        {
          id: 'fk',
          name: 'Faktor Koreksi (FK)',
          formula: 'FK = (Grand Total)² / N',
          substitution: `(${grandTotal.toFixed(2)})² / ${nTotal}`,
          result: fk,
        },
        {
          id: 'jkt',
          name: 'Jumlah Kuadrat Total (JKT)',
          formula: 'JKT = ∑(Yij²) - FK',
          substitution: `${sumSqAll.toFixed(4)} - ${fk.toFixed(4)}`,
          result: jkt,
        },
      ],
    });

    steps.push({
      title: '2. Jumlah Kuadrat Perlakuan (JKP) & Galat (JKG)',
      items: [
        {
          id: 'jkp',
          name: 'Jumlah Kuadrat Perlakuan (JKP)',
          formula: 'JKP = (∑(Yi.)² / r) - FK',
          substitution: `(${sumSqRow.toFixed(2)} / ${r}) - ${fk.toFixed(4)}`,
          result: jkp,
        },
        {
          id: 'jkg',
          name: 'Jumlah Kuadrat Galat (JKG)',
          formula: 'JKG = JKT - JKP',
          substitution: `${jkt.toFixed(4)} - ${jkp.toFixed(4)}`,
          result: jkg,
        },
      ],
    });

    steps.push({
      title: '3. Kuadrat Tengah (KT) & F-Hitung',
      items: [
        {
          id: 'ktp',
          name: 'Kuadrat Tengah Perlakuan (KTP)',
          formula: 'KTP = JKP / DBP',
          substitution: `${jkp.toFixed(4)} / ${dbp}`,
          result: ktp,
        },
        {
          id: 'ktg',
          name: 'Kuadrat Tengah Galat (KTG)',
          formula: 'KTG = JKG / DBG',
          substitution: `${jkg.toFixed(4)} / ${dbg}`,
          result: ktg,
        },
        {
          id: 'f_p',
          name: 'F-Hitung Perlakuan',
          formula: 'F-Hit = KTP / KTG',
          substitution: `${ktp.toFixed(4)} / ${ktg.toFixed(4)}`,
          result: fHitungP,
          note: `F-Tabel 5% = ${fTabel05P.toFixed(2)}, 1% = ${fTabel01P.toFixed(2)} [${ketP}]`,
        },
      ],
    });
  } else if (config.type === 'rak_non_factorial') {
    const t = numRows;
    const r = numCols;
    const dbk = r - 1;
    const dbp = t - 1;
    dbg = (t - 1) * (r - 1);
    const dbt = nTotal - 1;
    rEff = r;

    let sumSqCol = 0;
    colSums.forEach((s) => (sumSqCol += s * s));
    const jkk = sumSqCol / t - fk;

    let sumSqRow = 0;
    rowSums.forEach((s) => (sumSqRow += s * s));
    const jkp = sumSqRow / r - fk;

    const jkg = Math.max(0, jkt - jkk - jkp);

    const ktk = dbk > 0 ? jkk / dbk : 0;
    const ktp = dbp > 0 ? jkp / dbp : 0;
    ktg = dbg > 0 ? jkg / dbg : 0;

    const fHitungK = ktg > 0 ? ktk / ktg : 0;
    const fTabel05K = fDistributionPPF(0.95, dbk, dbg);
    const fTabel01K = fDistributionPPF(0.99, dbk, dbg);
    const ketK = helperKet(fHitungK, fTabel05K, fTabel01K);

    const fHitungP = ktg > 0 ? ktp / ktg : 0;
    const fTabel05P = fDistributionPPF(0.95, dbp, dbg);
    const fTabel01P = fDistributionPPF(0.99, dbp, dbg);
    const ketP = helperKet(fHitungP, fTabel05P, fTabel01P);
    if (ketP === '*' || ketP === '**') significantFactors.push('Perlakuan');

    rows.push({
      sk: 'Kelompok',
      db: dbk,
      jk: jkk,
      kt: ktk,
      fHitung: fHitungK,
      fTabel05: fTabel05K,
      fTabel01: fTabel01K,
      ket: ketK,
    });
    rows.push({
      sk: 'Perlakuan',
      db: dbp,
      jk: jkp,
      kt: ktp,
      fHitung: fHitungP,
      fTabel05: fTabel05P,
      fTabel01: fTabel01P,
      ket: ketP,
    });
    rows.push({
      sk: 'Galat',
      db: dbg,
      jk: jkg,
      kt: ktg,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });
    rows.push({
      sk: 'Total',
      db: dbt,
      jk: jkt,
      kt: 0,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });

    steps.push({
      title: '1. Faktor Koreksi (FK) & Jumlah Kuadrat Total (JKT)',
      items: [
        {
          id: 'fk',
          name: 'Faktor Koreksi (FK)',
          formula: 'FK = (Grand Total)² / (t × r)',
          substitution: `(${grandTotal.toFixed(2)})² / ${nTotal}`,
          result: fk,
        },
        {
          id: 'jkt',
          name: 'Jumlah Kuadrat Total (JKT)',
          formula: 'JKT = ∑(Yij²) - FK',
          substitution: `${sumSqAll.toFixed(4)} - ${fk.toFixed(4)}`,
          result: jkt,
        },
      ],
    });

    steps.push({
      title: '2. Jumlah Kuadrat Kelompok (JKK), Perlakuan (JKP) & Galat (JKG)',
      items: [
        {
          id: 'jkk',
          name: 'Jumlah Kuadrat Kelompok (JKK)',
          formula: 'JKK = (∑(Y.j)² / t) - FK',
          substitution: `(${sumSqCol.toFixed(2)} / ${t}) - ${fk.toFixed(4)}`,
          result: jkk,
        },
        {
          id: 'jkp',
          name: 'Jumlah Kuadrat Perlakuan (JKP)',
          formula: 'JKP = (∑(Yi.)² / r) - FK',
          substitution: `(${sumSqRow.toFixed(2)} / ${r}) - ${fk.toFixed(4)}`,
          result: jkp,
        },
        {
          id: 'jkg',
          name: 'Jumlah Kuadrat Galat (JKG)',
          formula: 'JKG = JKT - JKK - JKP',
          substitution: `${jkt.toFixed(4)} - ${jkk.toFixed(4)} - ${jkp.toFixed(4)}`,
          result: jkg,
        },
      ],
    });

    steps.push({
      title: '3. Kuadrat Tengah (KT) & Uji F',
      items: [
        {
          id: 'ktk',
          name: 'Kuadrat Tengah Kelompok (KTK)',
          formula: 'KTK = JKK / DBK',
          substitution: `${jkk.toFixed(4)} / ${dbk}`,
          result: ktk,
        },
        {
          id: 'ktp',
          name: 'Kuadrat Tengah Perlakuan (KTP)',
          formula: 'KTP = JKP / DBP',
          substitution: `${jkp.toFixed(4)} / ${dbp}`,
          result: ktp,
        },
        {
          id: 'ktg',
          name: 'Kuadrat Tengah Galat (KTG)',
          formula: 'KTG = JKG / DBG',
          substitution: `${jkg.toFixed(4)} / ${dbg}`,
          result: ktg,
        },
        {
          id: 'f_p',
          name: 'F-Hitung Perlakuan',
          formula: 'F-Hit = KTP / KTG',
          substitution: `${ktp.toFixed(4)} / ${ktg.toFixed(4)}`,
          result: fHitungP,
          note: `F-Tabel 5% = ${fTabel05P.toFixed(2)}, 1% = ${fTabel01P.toFixed(2)} [${ketP}]`,
        },
      ],
    });
  } else if (config.type === 'ral_factorial' || config.type === 'rak_factorial') {
    const a = config.a || 2;
    const b = config.b || 2;
    const r = config.r || numCols;
    rEff = r;

    // Treatment combination totals
    let sumSqComb = 0;
    rowSums.forEach((s) => (sumSqComb += s * s));
    const jkComb = sumSqComb / r - fk;

    // Factor A totals (summing across B levels)
    const factorASums: number[] = new Array(a).fill(0);
    const factorBSums: number[] = new Array(b).fill(0);

    for (let i = 0; i < a; i++) {
      for (let j = 0; j < b; j++) {
        const rowIdx = i * b + j;
        if (rowIdx < numRows) {
          factorASums[i] += rowSums[rowIdx];
          factorBSums[j] += rowSums[rowIdx];
        }
      }
    }

    let sumSqA = 0;
    factorASums.forEach((s) => (sumSqA += s * s));
    const jkA = sumSqA / (b * r) - fk;
    const dba = a - 1;

    let sumSqB = 0;
    factorBSums.forEach((s) => (sumSqB += s * s));
    const jkB = sumSqB / (a * r) - fk;
    const dbb = b - 1;

    const jkAB = Math.max(0, jkComb - jkA - jkB);
    const dbab = dba * dbb;

    let jkk = 0;
    let dbk = 0;
    let ktk = 0;
    let fHitungK: number | null = null;
    let fTabel05K: number | null = null;
    let fTabel01K: number | null = null;
    let ketK: '**' | '*' | 'tn' | '-' = '-';

    let jkg = 0;
    const dbt = nTotal - 1;

    if (config.type === 'rak_factorial') {
      dbk = r - 1;
      let sumSqCol = 0;
      colSums.forEach((s) => (sumSqCol += s * s));
      jkk = sumSqCol / (a * b) - fk;
      ktk = dbk > 0 ? jkk / dbk : 0;

      dbg = (a * b - 1) * (r - 1);
      jkg = Math.max(0, jkt - jkk - jkComb);
    } else {
      dbg = a * b * (r - 1);
      jkg = Math.max(0, jkt - jkComb);
    }

    const kta = dba > 0 ? jkA / dba : 0;
    const ktb = dbb > 0 ? jkB / dbb : 0;
    const ktab = dbab > 0 ? jkAB / dbab : 0;
    ktg = dbg > 0 ? jkg / dbg : 0;

    if (config.type === 'rak_factorial') {
      fHitungK = ktg > 0 ? ktk / ktg : 0;
      fTabel05K = fDistributionPPF(0.95, dbk, dbg);
      fTabel01K = fDistributionPPF(0.99, dbk, dbg);
      ketK = helperKet(fHitungK, fTabel05K, fTabel01K);

      rows.push({
        sk: 'Kelompok',
        db: dbk,
        jk: jkk,
        kt: ktk,
        fHitung: fHitungK,
        fTabel05: fTabel05K,
        fTabel01: fTabel01K,
        ket: ketK,
      });
    }

    const fHitungA = ktg > 0 ? kta / ktg : 0;
    const fTabel05A = fDistributionPPF(0.95, dba, dbg);
    const fTabel01A = fDistributionPPF(0.99, dba, dbg);
    const ketA = helperKet(fHitungA, fTabel05A, fTabel01A);
    if (ketA === '*' || ketA === '**') significantFactors.push(config.factorAName || 'Faktor A');

    const fHitungB = ktg > 0 ? ktb / ktg : 0;
    const fTabel05B = fDistributionPPF(0.95, dbb, dbg);
    const fTabel01B = fDistributionPPF(0.99, dbb, dbg);
    const ketB = helperKet(fHitungB, fTabel05B, fTabel01B);
    if (ketB === '*' || ketB === '**') significantFactors.push(config.factorBName || 'Faktor B');

    const fHitungAB = ktg > 0 ? ktab / ktg : 0;
    const fTabel05AB = fDistributionPPF(0.95, dbab, dbg);
    const fTabel01AB = fDistributionPPF(0.99, dbab, dbg);
    const ketAB = helperKet(fHitungAB, fTabel05AB, fTabel01AB);
    if (ketAB === '*' || ketAB === '**') significantFactors.push('Interaksi (AxB)');

    rows.push({
      sk: config.factorAName || 'Faktor A',
      db: dba,
      jk: jkA,
      kt: kta,
      fHitung: fHitungA,
      fTabel05: fTabel05A,
      fTabel01: fTabel01A,
      ket: ketA,
    });
    rows.push({
      sk: config.factorBName || 'Faktor B',
      db: dbb,
      jk: jkB,
      kt: ktb,
      fHitung: fHitungB,
      fTabel05: fTabel05B,
      fTabel01: fTabel01B,
      ket: ketB,
    });
    rows.push({
      sk: `Interaksi (${config.factorAName || 'A'} × ${config.factorBName || 'B'})`,
      db: dbab,
      jk: jkAB,
      kt: ktab,
      fHitung: fHitungAB,
      fTabel05: fTabel05AB,
      fTabel01: fTabel01AB,
      ket: ketAB,
    });
    rows.push({
      sk: 'Galat',
      db: dbg,
      jk: jkg,
      kt: ktg,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });
    rows.push({
      sk: 'Total',
      db: dbt,
      jk: jkt,
      kt: 0,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });

    steps.push({
      title: '1. Faktor Koreksi (FK) & Jumlah Kuadrat Total (JKT)',
      items: [
        {
          id: 'fk',
          name: 'Faktor Koreksi (FK)',
          formula: 'FK = (Grand Total)² / (a × b × r)',
          substitution: `(${grandTotal.toFixed(2)})² / ${nTotal}`,
          result: fk,
        },
        {
          id: 'jkt',
          name: 'Jumlah Kuadrat Total (JKT)',
          formula: 'JKT = ∑(Yijk²) - FK',
          substitution: `${sumSqAll.toFixed(4)} - ${fk.toFixed(4)}`,
          result: jkt,
        },
      ],
    });

    steps.push({
      title: '2. Jumlah Kuadrat Faktor A, B & Interaksi AxB',
      items: [
        {
          id: 'jka',
          name: 'Jumlah Kuadrat Faktor A (JKA)',
          formula: 'JKA = (∑(Ai)² / (b × r)) - FK',
          substitution: `(${sumSqA.toFixed(2)} / ${b * r}) - ${fk.toFixed(4)}`,
          result: jkA,
        },
        {
          id: 'jkb',
          name: 'Jumlah Kuadrat Faktor B (JKB)',
          formula: 'JKB = (∑(Bj)² / (a × r)) - FK',
          substitution: `(${sumSqB.toFixed(2)} / ${a * r}) - ${fk.toFixed(4)}`,
          result: jkB,
        },
        {
          id: 'jkab',
          name: 'Jumlah Kuadrat Interaksi (JK AB)',
          formula: 'JK AB = JK Kombinasi - JKA - JKB',
          substitution: `${jkComb.toFixed(4)} - ${jkA.toFixed(4)} - ${jkB.toFixed(4)}`,
          result: jkAB,
        },
      ],
    });

    steps.push({
      title: '3. Jumlah Kuadrat Galat (JKG) & Kuadrat Tengah (KT)',
      items: [
        {
          id: 'jkg',
          name: 'Jumlah Kuadrat Galat (JKG)',
          formula:
            config.type === 'rak_factorial'
              ? 'JKG = JKT - JKK - JK Kombinasi'
              : 'JKG = JKT - JK Kombinasi',
          substitution:
            config.type === 'rak_factorial'
              ? `${jkt.toFixed(4)} - ${jkk.toFixed(4)} - ${jkComb.toFixed(4)}`
              : `${jkt.toFixed(4)} - ${jkComb.toFixed(4)}`,
          result: jkg,
        },
        {
          id: 'ktg',
          name: 'Kuadrat Tengah Galat (KTG)',
          formula: 'KTG = JKG / DBG',
          substitution: `${jkg.toFixed(4)} / ${dbg}`,
          result: ktg,
        },
      ],
    });
  } else if (config.type === 'split_plot') {
    // Split Plot Design (Petak Terbagi - RAK)
    const a = config.a || 2; // Petak Utama (A)
    const b = config.b || 3; // Anak Petak (B)
    const r = config.r || numCols; // Kelompok
    rEff = r;

    const dbt = nTotal - 1;
    const dbk = r - 1;
    const dba = a - 1;
    const dbGa = (r - 1) * (a - 1);
    const dbb = b - 1;
    const dbab = (a - 1) * (b - 1);
    const dbGb = a * (b - 1) * (r - 1);

    // 1. Kelompok
    let sumSqCol = 0;
    colSums.forEach((s) => (sumSqCol += s * s));
    const jkk = sumSqCol / (a * b) - fk;
    const ktk = dbk > 0 ? jkk / dbk : 0;

    // 2. Petak Utama Table (A x Kelompok totals: Y_i.k)
    // For each level of A and each replication/block col
    const aColSums: number[][] = Array.from({ length: a }, () => new Array(r).fill(0));
    const factorASums: number[] = new Array(a).fill(0);
    const factorBSums: number[] = new Array(b).fill(0);

    for (let i = 0; i < a; i++) {
      for (let j = 0; j < b; j++) {
        const rowIdx = i * b + j;
        if (rowIdx < numRows) {
          factorASums[i] += rowSums[rowIdx];
          factorBSums[j] += rowSums[rowIdx];
          for (let k = 0; k < r; k++) {
            aColSums[i][k] += matrix[rowIdx][k] || 0;
          }
        }
      }
    }

    let sumSqAK = 0;
    for (let i = 0; i < a; i++) {
      for (let k = 0; k < r; k++) {
        sumSqAK += aColSums[i][k] * aColSums[i][k];
      }
    }
    const jkAK = sumSqAK / b - fk;

    let sumSqA = 0;
    factorASums.forEach((s) => (sumSqA += s * s));
    const jkA = sumSqA / (b * r) - fk;
    const ktA = dba > 0 ? jkA / dba : 0;

    const jkGa = Math.max(0, jkAK - jkk - jkA);
    const ktGa = dbGa > 0 ? jkGa / dbGa : 0;

    // 3. Anak Petak (B)
    let sumSqB = 0;
    factorBSums.forEach((s) => (sumSqB += s * s));
    const jkB = sumSqB / (a * r) - fk;
    const ktB = dbb > 0 ? jkB / dbb : 0;

    // 4. Interaksi (AxB)
    let sumSqComb = 0;
    rowSums.forEach((s) => (sumSqComb += s * s));
    const jkComb = sumSqComb / r - fk;
    const jkAB = Math.max(0, jkComb - jkA - jkB);
    const ktAB = dbab > 0 ? jkAB / dbab : 0;

    // 5. Galat b
    const jkGb = Math.max(0, jkt - jkk - jkA - jkGa - jkB - jkAB);
    const ktGb = dbGb > 0 ? jkGb / dbGb : 0;

    ktg = ktGb; // Overall error for post-hoc B & AxB
    dbg = dbGb;

    // F-Hitung Split Plot Specific:
    // F A = KT A / KT Galat(a)
    // F B = KT B / KT Galat(b)
    // F AxB = KT AxB / KT Galat(b)
    const fHitungK = ktGa > 0 ? ktk / ktGa : 0;
    const fTabel05K = fDistributionPPF(0.95, dbk, dbGa);
    const fTabel01K = fDistributionPPF(0.99, dbk, dbGa);
    const ketK = helperKet(fHitungK, fTabel05K, fTabel01K);

    const fHitungA = ktGa > 0 ? ktA / ktGa : 0;
    const fTabel05A = fDistributionPPF(0.95, dba, dbGa);
    const fTabel01A = fDistributionPPF(0.99, dba, dbGa);
    const ketA = helperKet(fHitungA, fTabel05A, fTabel01A);
    if (ketA === '*' || ketA === '**')
      significantFactors.push(`${config.factorAName || 'Petak Utama (A)'}`);

    const fHitungB = ktGb > 0 ? ktB / ktGb : 0;
    const fTabel05B = fDistributionPPF(0.95, dbb, dbGb);
    const fTabel01B = fDistributionPPF(0.99, dbb, dbGb);
    const ketB = helperKet(fHitungB, fTabel05B, fTabel01B);
    if (ketB === '*' || ketB === '**')
      significantFactors.push(`${config.factorBName || 'Anak Petak (B)'}`);

    const fHitungAB = ktGb > 0 ? ktAB / ktGb : 0;
    const fTabel05AB = fDistributionPPF(0.95, dbab, dbGb);
    const fTabel01AB = fDistributionPPF(0.99, dbab, dbGb);
    const ketAB = helperKet(fHitungAB, fTabel05AB, fTabel01AB);
    if (ketAB === '*' || ketAB === '**') significantFactors.push('Interaksi (AxB)');

    rows.push({
      sk: 'Kelompok',
      db: dbk,
      jk: jkk,
      kt: ktk,
      fHitung: fHitungK,
      fTabel05: fTabel05K,
      fTabel01: fTabel01K,
      ket: ketK,
    });
    rows.push({
      sk: `${config.factorAName || 'Petak Utama (A)'}`,
      db: dba,
      jk: jkA,
      kt: ktA,
      fHitung: fHitungA,
      fTabel05: fTabel05A,
      fTabel01: fTabel01A,
      ket: ketA,
    });
    rows.push({
      sk: 'Galat (a)',
      db: dbGa,
      jk: jkGa,
      kt: ktGa,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });
    rows.push({
      sk: `${config.factorBName || 'Anak Petak (B)'}`,
      db: dbb,
      jk: jkB,
      kt: ktB,
      fHitung: fHitungB,
      fTabel05: fTabel05B,
      fTabel01: fTabel01B,
      ket: ketB,
    });
    rows.push({
      sk: `Interaksi (${config.factorAName || 'A'} × ${config.factorBName || 'B'})`,
      db: dbab,
      jk: jkAB,
      kt: ktAB,
      fHitung: fHitungAB,
      fTabel05: fTabel05AB,
      fTabel01: fTabel01AB,
      ket: ketAB,
    });
    rows.push({
      sk: 'Galat (b)',
      db: dbGb,
      jk: jkGb,
      kt: ktGb,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });
    rows.push({
      sk: 'Total',
      db: dbt,
      jk: jkt,
      kt: 0,
      fHitung: null,
      fTabel05: null,
      fTabel01: null,
      ket: '-',
    });

    steps.push({
      title: '1. Petak Utama (Faktor A) & Galat (a)',
      items: [
        {
          id: 'fk',
          name: 'Faktor Koreksi (FK)',
          formula: 'FK = (Grand Total)² / (a × b × r)',
          substitution: `(${grandTotal.toFixed(2)})² / ${nTotal}`,
          result: fk,
        },
        {
          id: 'jka',
          name: 'Jumlah Kuadrat Petak Utama A (JKA)',
          formula: 'JKA = (∑(Ai)² / (b × r)) - FK',
          substitution: `(${sumSqA.toFixed(2)} / ${b * r}) - ${fk.toFixed(4)}`,
          result: jkA,
        },
        {
          id: 'jk_ga',
          name: 'Jumlah Kuadrat Galat a (JK Galat a)',
          formula: 'JK Galat(a) = JK(A × K) - JKK - JKA',
          substitution: `${jkAK.toFixed(4)} - ${jkk.toFixed(4)} - ${jkA.toFixed(4)}`,
          result: jkGa,
        },
        {
          id: 'f_a',
          name: 'F-Hitung Petak Utama A',
          formula: 'F-Hit A = KT A / KT Galat(a)',
          substitution: `${ktA.toFixed(4)} / ${ktGa.toFixed(4)}`,
          result: fHitungA,
          note: `F-Tabel 5% = ${fTabel05A.toFixed(2)}, 1% = ${fTabel01A.toFixed(2)} [${ketA}]`,
        },
      ],
    });

    steps.push({
      title: '2. Anak Petak (Faktor B), Interaksi & Galat (b)',
      items: [
        {
          id: 'jkb',
          name: 'Jumlah Kuadrat Anak Petak B (JKB)',
          formula: 'JKB = (∑(Bj)² / (a × r)) - FK',
          substitution: `(${sumSqB.toFixed(2)} / ${a * r}) - ${fk.toFixed(4)}`,
          result: jkB,
        },
        {
          id: 'jkab',
          name: 'Jumlah Kuadrat Interaksi (JK AB)',
          formula: 'JK AB = JK Kombinasi - JKA - JKB',
          substitution: `${jkComb.toFixed(4)} - ${jkA.toFixed(4)} - ${jkB.toFixed(4)}`,
          result: jkAB,
        },
        {
          id: 'jk_gb',
          name: 'Jumlah Kuadrat Galat b (JK Galat b)',
          formula: 'JK Galat(b) = JKT - JKK - JKA - JK Galat(a) - JKB - JK AB',
          substitution: `${jkt.toFixed(4)} - ${jkk.toFixed(4)} - ${jkA.toFixed(4)} - ${jkGa.toFixed(4)} - ${jkB.toFixed(4)} - ${jkAB.toFixed(4)}`,
          result: jkGb,
        },
        {
          id: 'f_b',
          name: 'F-Hitung Anak Petak B',
          formula: 'F-Hit B = KT B / KT Galat(b)',
          substitution: `${ktB.toFixed(4)} / ${ktGb.toFixed(4)}`,
          result: fHitungB,
          note: `F-Tabel 5% = ${fTabel05B.toFixed(2)}, 1% = ${fTabel01B.toFixed(2)} [${ketB}]`,
        },
        {
          id: 'f_ab',
          name: 'F-Hitung Interaksi (AxB)',
          formula: 'F-Hit AB = KT AB / KT Galat(b)',
          substitution: `${ktAB.toFixed(4)} / ${ktGb.toFixed(4)}`,
          result: fHitungAB,
          note: `F-Tabel 5% = ${fTabel05AB.toFixed(2)}, 1% = ${fTabel01AB.toFixed(2)} [${ketAB}]`,
        },
      ],
    });
  }

  // Koefisien Keragaman / KK (%) = (sqrt(KTG) / Grand Mean) * 100
  const kk = grandMean > 0 ? (Math.sqrt(ktg) / grandMean) * 100 : 0;

  const anova: AnovaResult = {
    designType: config.type,
    grandTotal,
    nTotal,
    grandMean,
    fk,
    rows,
    kk,
    ktg,
    dbg,
    rEff,
    hasSignificance: significantFactors.length > 0,
    significantFactors,
  };

  return { anova, steps };
}
