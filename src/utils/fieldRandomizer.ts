import { DesignConfig, FieldBlock, FieldLayoutResult, PlotUnit } from '../types';

// Distinctive harmonious color palette for plot visualization
const PLOT_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#16a34a', // Green
  '#ea580c', // Orange
  '#0284c7', // Sky
  '#9333ea', // Violet
  '#be123c', // Crimson
  '#0d9488', // Teal
  '#ca8a04', // Yellow
  '#475569', // Slate
  '#65a30d', // Lime
];

/**
 * Generates treatment codes based on user configuration prefix and start indices
 */
export function generateTreatmentLabels(
  config: DesignConfig,
  forceRegenerateFromInitials: boolean = false
): { codes: string[]; names: string[] } {
  const {
    type,
    t,
    a,
    b,
    prefixTreatment,
    startIndexTreatment,
    prefixFactorA,
    startIndexFactorA,
    prefixFactorB,
    startIndexFactorB,
    treatmentNames,
    treatmentLevelDescriptions,
    factorALevelDescriptions,
    factorBLevelDescriptions,
  } = config;

  const codes: string[] = [];
  const names: string[] = [];

  // Helper to extract parentheses content: "B1N1 (Bokashi 0 + NPK 150)" -> "(Bokashi 0 + NPK 150)"
  const extractParentheses = (str: string): string => {
    const match = str.match(/\((.*?)\)/);
    return match ? `(${match[1]})` : '';
  };

  if (type === 'ral_non_factorial' || type === 'rak_non_factorial') {
    const tVal = t || 5;
    const prefix = (prefixTreatment || 'P').trim();
    const startIdx = startIndexTreatment !== undefined ? startIndexTreatment : 0;

    for (let i = 0; i < tVal; i++) {
      const num = startIdx + i;
      const code = `${prefix}${num}`;
      codes.push(code);

      if (treatmentLevelDescriptions && treatmentLevelDescriptions[i]) {
        names.push(`${code} (${treatmentLevelDescriptions[i]})`);
      } else if (forceRegenerateFromInitials) {
        const desc = num === 0 ? 'Kontrol' : `${prefix}${num}`;
        names.push(`${code} (${desc})`);
      } else if (treatmentNames && treatmentNames[i]) {
        const oldName = treatmentNames[i];
        const paren = extractParentheses(oldName);
        names.push(paren ? `${code} ${paren}` : code);
      } else {
        const desc = num === 0 ? 'Kontrol' : `${prefix}${num}`;
        names.push(`${code} (${desc})`);
      }
    }
  } else {
    // Factorial or Split Plot
    const aVal = a || 2;
    const bVal = b || 3;
    const prefA = (prefixFactorA || 'A').trim();
    const startA = startIndexFactorA !== undefined ? startIndexFactorA : 1;
    const prefB = (prefixFactorB || 'B').trim();
    const startB = startIndexFactorB !== undefined ? startIndexFactorB : 1;

    let idx = 0;
    for (let i = 0; i < aVal; i++) {
      const numA = startA + i;
      const descA = factorALevelDescriptions?.[i] || `${prefA}${numA}`;

      for (let j = 0; j < bVal; j++) {
        const numB = startB + j;
        const descB = factorBLevelDescriptions?.[j] || `${prefB}${numB}`;
        const code = `${prefA}${numA}${prefB}${numB}`;
        codes.push(code);

        if (factorALevelDescriptions?.[i] && factorBLevelDescriptions?.[j]) {
          names.push(`${code} (${descA} + ${descB})`);
        } else if (forceRegenerateFromInitials) {
          names.push(`${code} (${descA} + ${descB})`);
        } else if (treatmentNames && treatmentNames[idx]) {
          const oldName = treatmentNames[idx];
          const paren = extractParentheses(oldName);
          names.push(paren ? `${code} ${paren}` : `${code} (${descA} + ${descB})`);
        } else {
          names.push(`${code} (${descA} + ${descB})`);
        }
        idx++;
      }
    }
  }

  return { codes, names };
}

/**
 * Seeded pseudorandom number generator (LCG)
 */
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Shuffle array using Fisher-Yates with PRNG
 */
function shuffleArray<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Randomize field plot layout according to strict agricultural statistical rules
 */
export function randomizeFieldLayout(
  config: DesignConfig,
  seed: number = Date.now(),
  compassAngle: number = 0 // 0 = North, 90 = East, 180 = South, 270 = West
): FieldLayoutResult {
  const random = createPRNG(seed);
  const { type, r, a, b } = config;
  const numR = r || 3;
  const { codes, names } = generateTreatmentLabels(config);
  const totalTreatments = codes.length;
  const totalPlots = totalTreatments * numR;

  const blocks: FieldBlock[] = [];
  let plotCounter = 1;

  if (type === 'ral_non_factorial' || type === 'ral_factorial') {
    // RAL: Completely Randomized Design
    // All (t x r) plots are randomized across the whole field simultaneously
    const allPlots: { treatmentIdx: number; repIdx: number }[] = [];
    for (let tIdx = 0; tIdx < totalTreatments; tIdx++) {
      for (let rIdx = 0; rIdx < numR; rIdx++) {
        allPlots.push({ treatmentIdx: tIdx, repIdx: rIdx });
      }
    }

    // Shuffle all units completely
    const shuffled = shuffleArray(allPlots, random);

    // Represent as single unified area (divided into rows for display)
    const plotsList: PlotUnit[] = shuffled.map((item) => {
      const code = codes[item.treatmentIdx];
      const name = names[item.treatmentIdx];
      const color = PLOT_COLORS[item.treatmentIdx % PLOT_COLORS.length];
      const p: PlotUnit = {
        plotNumber: plotCounter++,
        treatmentCode: code,
        treatmentName: name,
        treatmentIndex: item.treatmentIdx,
        colorTag: color,
      };
      return p;
    });

    blocks.push({
      blockIndex: 1,
      blockLabel: 'Area Percobaan RAL (Diacak Penuh Bebas Homogen)',
      plots: plotsList,
    });
  } else if (type === 'rak_non_factorial' || type === 'rak_factorial') {
    // RAK: Randomized Complete Block Design
    // Plots are grouped into r blocks/kelompok.
    // Randomization is performed strictly WITHIN each block!
    for (let k = 0; k < numR; k++) {
      const blockTreatments = Array.from({ length: totalTreatments }, (_, i) => i);
      const shuffledTreatments = shuffleArray(blockTreatments, random);

      const blockPlots: PlotUnit[] = shuffledTreatments.map((tIdx) => {
        const code = codes[tIdx];
        const name = names[tIdx];
        const color = PLOT_COLORS[tIdx % PLOT_COLORS.length];
        return {
          plotNumber: plotCounter++,
          blockIndex: k + 1,
          blockLabel: config.blockNames?.[k] || `Kelompok ${k + 1}`,
          treatmentCode: code,
          treatmentName: name,
          treatmentIndex: tIdx,
          colorTag: color,
        };
      });

      blocks.push({
        blockIndex: k + 1,
        blockLabel: config.blockNames?.[k] || `Kelompok ${k + 1}`,
        plots: blockPlots,
      });
    }
  } else if (type === 'split_plot') {
    // Split Plot Design: Two-stage nested randomization
    // Stage 1: Within each block, Main Plots (Factor A) are randomized to main plots
    // Stage 2: Within each Main Plot, Subplots (Factor B) are randomized
    const aVal = a || 2;
    const bVal = b || 3;
    const prefA = (config.prefixFactorA || 'A').trim();
    const startA = config.startIndexFactorA !== undefined ? config.startIndexFactorA : 1;
    const prefB = (config.prefixFactorB || 'B').trim();
    const startB = config.startIndexFactorB !== undefined ? config.startIndexFactorB : 1;

    for (let k = 0; k < numR; k++) {
      // Stage 1: Randomize Main Plots (Factor A levels 0..a-1)
      const mainPlotIndices = Array.from({ length: aVal }, (_, i) => i);
      const shuffledMainPlots = shuffleArray(mainPlotIndices, random);

      const blockPlots: PlotUnit[] = [];

      shuffledMainPlots.forEach((aIdx) => {
        const mainPlotCode = `${prefA}${startA + aIdx}`;
        // Stage 2: Randomize Subplots (Factor B levels 0..b-1) within this Main Plot
        const subplotIndices = Array.from({ length: bVal }, (_, j) => j);
        const shuffledSubplots = shuffleArray(subplotIndices, random);

        shuffledSubplots.forEach((bIdx) => {
          const globalTreatIdx = aIdx * bVal + bIdx;
          const code = `${prefA}${startA + aIdx}${prefB}${startB + bIdx}`;
          const name = names[globalTreatIdx] || `${code}`;
          const color = PLOT_COLORS[globalTreatIdx % PLOT_COLORS.length];

          blockPlots.push({
            plotNumber: plotCounter++,
            blockIndex: k + 1,
            blockLabel: config.blockNames?.[k] || `Kelompok ${k + 1}`,
            mainPlotIndex: aIdx + 1,
            mainPlotLabel: `Petak Utama ${mainPlotCode}`,
            treatmentCode: code,
            treatmentName: name,
            treatmentIndex: globalTreatIdx,
            colorTag: color,
          });
        });
      });

      blocks.push({
        blockIndex: k + 1,
        blockLabel: config.blockNames?.[k] || `Kelompok ${k + 1}`,
        plots: blockPlots,
      });
    }
  }

  // Determine compass direction label
  let compassDirectionLabel = 'Utara - Selatan';
  if (compassAngle >= 45 && compassAngle < 135) {
    compassDirectionLabel = 'Timur - Barat';
  } else if (compassAngle >= 135 && compassAngle < 225) {
    compassDirectionLabel = 'Selatan - Utara';
  } else if (compassAngle >= 225 && compassAngle < 315) {
    compassDirectionLabel = 'Barat - Timur';
  }

  // Recommendations for field agronomy
  const recommendations: string[] = [
    'Orientasi Bedengan: Sebaiknya memanjang arah Utara - Selatan agar tanaman menerima intensitas radiasi surya pagi dan sore secara optimal dan merata.',
    'Arah Gradien Kesuburan: Pada RAK, susunan kelompok (Kelompok I, II, III) wajib memotong arah perbedaan kesuburan tanah, lereng kemiringan, atau sumber naungan pohon.',
    'Jarak Antar Bedengan: Sediakan saluran drainase selebar 40–50 cm antar bedengan dan jarak antar kelompok minimal 80–100 cm sebagai jalan kontrol dan pemeliharaan.',
    'Patok Plot: Tancapkan patok kayu/bambu setinggi 50 cm di sudut barat laut atau kiri depan setiap bedengan bertuliskan nomor plot dan kode perlakuan.',
  ];

  return {
    designType: type,
    totalPlots,
    blocks,
    gridRows: blocks.length,
    gridCols: totalTreatments,
    compassAngle,
    compassDirectionLabel,
    sunOrientation: 'Matahari terbit dari Timur dan tenggelam di Barat (menyinari sisi timur pagi & sisi barat sore)',
    slopeOrientation: 'Kelompok ditempatkan sejajar kontur lereng untuk meminimalisir keragaman dalam kelompok',
    recommendations,
  };
}
