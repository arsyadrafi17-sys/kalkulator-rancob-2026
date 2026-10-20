import { DesignConfig } from '../types';

export interface ReplicationRecommendation {
  recommendedR: number;
  currentR: number;
  dbgCurrent: number;
  dbgRecommended: number;
  isCurrentAdequate: boolean;
  formulaDisplay: string;
  explanation: string;
  federerNote?: string;
}

/**
 * Calculates the recommended minimum number of replications (r)
 * based on the standard biometric Federer Equation: (t - 1)(r - 1) >= 15
 * widely recognized across Indonesian agricultural faculties and research institutions.
 */
export function calculateRecommendedReplications(
  config: DesignConfig
): ReplicationRecommendation {
  const { type, t, a, b, r } = config;
  const currentR = r || 3;

  let recommendedR = 3;
  let dbgCurrent = 0;
  let dbgRecommended = 0;
  let formulaDisplay = '';
  let explanation = '';
  let federerNote = '';

  if (type === 'ral_non_factorial') {
    // Rumus Federer Baku: (t - 1)(r - 1) >= 15
    // => (r - 1) >= 15 / (t - 1) => r >= 15 / (t - 1) + 1
    const tVal = Math.max(t || 2, 2);
    const denom = Math.max(tVal - 1, 1);
    const rawR = 15 / denom + 1;
    recommendedR = Math.max(3, Math.ceil(rawR));
    dbgCurrent = (tVal - 1) * (currentR - 1);
    dbgRecommended = (tVal - 1) * (recommendedR - 1);

    formulaDisplay = '(t - 1)(r - 1) ≥ 15 (Persamaan Federer)';
    explanation = `Berdasarkan Persamaan Federer (t - 1)(r - 1) ≥ 15 untuk t = ${tVal} perlakuan: (r - 1) ≥ 15/(${tVal} - 1) = ${(
      15 / denom
    ).toFixed(2)} → r ≥ ${rawR.toFixed(2)}, sehingga dibulatkan ke atas menjadi r = ${recommendedR} ulangan.`;

    // Note tentang DB Galat RAL murni
    const dbgRalMurni = tVal * (recommendedR - 1);
    federerNote = `Rumus Federer ini menjamin ketelitian percobaan. Pada RAL, DB Galat aktual t(r - 1) akan bernilai ${dbgRalMurni} (sangat aman di atas 15).`;
  } else if (type === 'rak_non_factorial') {
    // RAK: DB Galat = (t - 1)(r - 1) >= 15 (Persis sama dengan Rumus Federer)
    const tVal = Math.max(t || 2, 2);
    const denom = Math.max(tVal - 1, 1);
    const rawR = 15 / denom + 1;
    recommendedR = Math.max(3, Math.ceil(rawR));
    dbgCurrent = (tVal - 1) * (currentR - 1);
    dbgRecommended = (tVal - 1) * (recommendedR - 1);

    formulaDisplay = '(t - 1)(r - 1) ≥ 15 (Persamaan Federer / DB Galat RAK)';
    explanation = `Pada RAK, derajat bebas galat adalah persis (t - 1)(r - 1). Dengan t = ${tVal} perlakuan: (r - 1) ≥ 15/${denom} = ${(
      15 / denom
    ).toFixed(2)} → disarankan minimal r = ${recommendedR} kelompok.`;

    federerNote = `Pada RAK lapangan, disarankan minimal 3 kelompok agar pengujian homogenitas lingkungan valid.`;
  } else if (type === 'ral_factorial') {
    // Faktorial: Total kombinasi perlakuan k = a * b
    // Rumus Federer Faktorial: (ab - 1)(r - 1) >= 15
    const aVal = Math.max(a || 2, 2);
    const bVal = Math.max(b || 2, 2);
    const totalComb = aVal * bVal;
    const denom = Math.max(totalComb - 1, 1);
    const rawR = 15 / denom + 1;
    recommendedR = Math.max(2, Math.ceil(rawR));
    dbgCurrent = totalComb * (currentR - 1); // aktual DB Galat RAL Faktorial: ab(r-1)
    dbgRecommended = totalComb * (recommendedR - 1);

    formulaDisplay = '(ab - 1)(r - 1) ≥ 15 (Persamaan Federer Faktorial)';
    explanation = `Dengan total kombinasi ab = ${aVal} × ${bVal} = ${totalComb} perlakuan, rumus Federer adalah (${totalComb} - 1)(r - 1) ≥ 15 → r ≥ ${rawR.toFixed(
      2
    )}, sehingga disarankan minimal r = ${recommendedR} ulangan.`;

    federerNote = `Banyaknya kombinasi perlakuan (${totalComb}) membuat ulangan per kombinasi bisa lebih efisien (2–3 ulangan sudah menghasilkan DB Galat = ${dbgRecommended}).`;
  } else if (type === 'rak_factorial') {
    // RAK Faktorial: DB Galat = (ab - 1)(r - 1) >= 15
    const aVal = Math.max(a || 2, 2);
    const bVal = Math.max(b || 2, 2);
    const totalComb = aVal * bVal;
    const denom = Math.max(totalComb - 1, 1);
    const rawR = 15 / denom + 1;
    recommendedR = Math.max(3, Math.ceil(rawR));
    dbgCurrent = denom * (currentR - 1);
    dbgRecommended = denom * (recommendedR - 1);

    formulaDisplay = '(ab - 1)(r - 1) ≥ 15 (DB Galat RAK Faktorial / Federer)';
    explanation = `Untuk RAK Faktorial (${totalComb} kombinasi perlakuan), DB Galat adalah (${totalComb} - 1)(r - 1) ≥ 15. Diperoleh r ≥ ${rawR.toFixed(
      2
    )}, disarankan minimal r = ${recommendedR} kelompok.`;

    federerNote = `Percobaan RAK lapangan memerlukan minimal 3 kelompok ulangan untuk mengontrol gradien kesuburan tanah.`;
  } else if (type === 'split_plot') {
    // Split Plot Design:
    // Federer untuk kombinasi petak terbagi: (ab - 1)(r - 1) >= 15
    // Galat b = a(b - 1)(r - 1) >= 15
    // Galat a = (r - 1)(a - 1)
    const aVal = Math.max(a || 2, 2);
    const bVal = Math.max(b || 2, 2);
    const totalComb = aVal * bVal;
    const denomComb = Math.max(totalComb - 1, 1);
    const rFromFederer = Math.ceil(15 / denomComb + 1);

    // Kebutuhan galat b
    const denomB = Math.max(aVal * (bVal - 1), 1);
    const rFromB = Math.ceil(15 / denomB + 1);

    // Kebutuhan galat a (minimal 8-12 agar uji petak utama tidak lemah)
    const denomA = Math.max(aVal - 1, 1);
    const rFromA = Math.ceil(8 / denomA + 1);

    recommendedR = Math.max(3, Math.max(rFromFederer, rFromB, rFromA));
    dbgCurrent = aVal * (bVal - 1) * (currentR - 1);
    dbgRecommended = aVal * (bVal - 1) * (recommendedR - 1);

    formulaDisplay = '(ab - 1)(r - 1) ≥ 15 & Galat(b) = a(b - 1)(r - 1) ≥ 15';
    explanation = `Pada Split Plot, selain memenuhi Persamaan Federer (${totalComb} - 1)(r - 1) ≥ 15, Galat(b) dan Galat(a) juga harus mencukupi. Disarankan minimal r = ${recommendedR} kelompok.`;

    const dbGaCurr = (currentR - 1) * (aVal - 1);
    federerNote = `Dengan r = ${recommendedR}, diperoleh DB Galat(a) = ${(recommendedR - 1) * (aVal - 1)} dan DB Galat(b) = ${dbgRecommended}.`;
  }

  // Apakah ulangan saat ini sudah memenuhi rumus Federer?
  const isCurrentAdequate = dbgCurrent >= 15;

  return {
    recommendedR,
    currentR,
    dbgCurrent,
    dbgRecommended,
    isCurrentAdequate,
    formulaDisplay,
    explanation,
    federerNote,
  };
}
