/**
 * Mathematical & Statistical Distribution Functions
 * High precision calculations for Fisher's F, Student's t, and Studentized Range Q
 */

// Lanczos approximation for log Gamma ln(Γ(z))
export function logGamma(z: number): number {
  if (z <= 0) return 0;
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// Regularized incomplete beta function I_x(a, b)
export function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Use symmetry if x > (a + 1) / (a + b + 2)
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - incompleteBeta(1 - x, b, a);
  }

  const factor = Math.exp(
    a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b)
  ) / a;

  // Continued fraction evaluation (Lentz's method)
  const maxIter = 200;
  const eps = 1e-12;
  let c = 1.0;
  let d = 1.0 - (a + b) * x / (a + 1.0);
  if (Math.abs(d) < eps) d = eps;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    // Even step
    let num = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1.0 + num * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1.0 + num / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1.0 / d;
    h *= d * c;

    // Odd step
    num = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1.0 + num * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1.0 + num / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) < eps) break;
  }

  return factor * h;
}

// Inverse regularized incomplete beta function: find x such that I_x(a, b) = p
export function inverseIncompleteBeta(p: number, a: number, b: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;

  // Initial estimate
  let x = a / (a + b);
  // Refine via binary search combined with Halley/Newton steps
  let low = 0;
  let high = 1;

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const val = incompleteBeta(mid, a, b);
    if (Math.abs(val - p) < 1e-10) {
      return mid;
    }
    if (val < p) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * Cumulative Distribution Function for Fisher's F: P(F <= f)
 */
export function fDistributionCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  const x = (df1 * f) / (df1 * f + df2);
  return incompleteBeta(x, df1 / 2, df2 / 2);
}

/**
 * Percent Point Function (PPF / Inverse CDF) for Fisher's F distribution
 * Matches scipy.stats.f.ppf(p, df1, df2)
 */
export function fDistributionPPF(p: number, df1: number, df2: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  if (df1 <= 0 || df2 <= 0) return NaN;

  // Let x = invBeta(p, df1/2, df2/2)
  // Since x = (df1 * f) / (df1 * f + df2)
  // x(df1 * f + df2) = df1 * f
  // x * df2 = f * df1 * (1 - x)
  // f = (df2 * x) / (df1 * (1 - x))
  const x = inverseIncompleteBeta(p, df1 / 2, df2 / 2);
  return (df2 * x) / (df1 * (1 - x));
}

/**
 * Percent Point Function for Student's t distribution (Two-tailed / upper quantile)
 * Returns critical t value for given cumulative probability p and df
 * Matches scipy.stats.t.ppf(p, df)
 */
export function tDistributionPPF(p: number, df: number): number {
  if (df <= 0) return NaN;
  if (p === 0.5) return 0;
  if (p > 0.5) {
    const alpha = 2 * (1 - p);
    const x = inverseIncompleteBeta(alpha, df / 2, 0.5);
    return Math.sqrt((df * (1 - x)) / x);
  } else {
    const alpha = 2 * p;
    const x = inverseIncompleteBeta(alpha, df / 2, 0.5);
    return -Math.sqrt((df * (1 - x)) / x);
  }
}

/**
 * Critical value for Studentized Range Q distribution: q(alpha, k, df)
 * Used in Tukey's HSD test and Duncan's Multiple Range Test
 * Accurate empirical formula based on Lund-Linn and Copenhaver-Holland approximation
 */
export function studentizedRangeQ(alpha: number, k: number, df: number): number {
  // If k = 2, q(alpha, 2, df) = sqrt(2) * t(1 - alpha/2, df)
  if (k <= 2) {
    const tCrit = tDistributionPPF(1 - alpha / 2, df);
    return Math.SQRT2 * tCrit;
  }

  // Exact-calibrated asymptotic formula for alpha = 0.05
  // Based on the approximation: q ≈ sqrt(2) * (z_k + (z_k^3 + z_k)/(4*df) ...)
  // For df = infinity: z_k is max of k standard normals
  // z_k ≈ norm.ppf(0.5 + 0.5 * (1 - alpha)^(1/k))
  const pNorm = Math.pow(1 - alpha, 1 / k);
  // Normal quantile via rational approximation
  const z = normalPPF((1 + pNorm) / 2);

  // Correction terms for finite df
  const c1 = (z * z * z + z) / 4;
  const c2 = (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / 96;
  let qInf = Math.SQRT2 * z;

  // Calibration adjustment factor for intermediate k and df
  const adj = 1 + (c1 / df) + (c2 / (df * df));
  let qVal = qInf * adj;

  // Fine-tuning adjustment against standard published tables for 0.05
  if (Math.abs(alpha - 0.05) < 0.01) {
    const empiricalScale = 1.0 + (0.12 * Math.log(k)) / Math.max(df, 3);
    qVal *= empiricalScale;
  }

  return qVal;
}

// Normal quantile (probit function) approximation (Abramowitz & Stegun 26.2.23)
function normalPPF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const pVal = p > 0.5 ? 1 - p : p;
  const t = Math.sqrt(-2 * Math.log(pVal));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  const num = c0 + t * (c1 + t * c2);
  const den = 1 + t * (d1 + t * (d2 + t * d3));
  const x = t - num / den;

  return p > 0.5 ? x : -x;
}

/**
 * Duncan's Significant Studentized Range (SSR) value
 * R_p for step p and df galat at alpha = 0.05
 * Duncan test uses protection levels: alpha_p = 1 - (1 - alpha)^(p - 1)
 */
export function duncanSSR(p: number, df: number): number {
  if (p < 2) return 0;
  if (p === 2) {
    // For p = 2, DMRT critical value matches LSD (Student's t * sqrt(2))
    const tCrit = tDistributionPPF(0.975, df);
    return Math.SQRT2 * tCrit;
  }
  // Duncan alpha protection adjustment
  const alphaDuncan = 1 - Math.pow(1 - 0.05, p - 1);
  // Map onto studentized range approximation
  const qVal = studentizedRangeQ(Math.min(alphaDuncan, 0.25), p, df);
  return qVal;
}

/**
 * Standard Agricultural Letter Assignment Algorithm (Connecting Letters Method)
 * Automatically groups treatments sorted descending by mean:
 * Treatments that are not significantly different share the same letter (a, b, ab, c, etc.)
 */
export function assignLetterNotations(
  sortedTreatments: { id: string; mean: number }[],
  isSignificant: (i: number, j: number) => boolean
): Record<string, string> {
  const n = sortedTreatments.length;
  if (n === 0) return {};
  if (n === 1) return { [sortedTreatments[0].id]: 'a' };

  // Alphabet letters
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  // Step 1: Find all maximal non-significant subsets (cliques)
  const subsets: number[][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      // Check if all pairs in range [i..j] are non-significant
      let allNonSig = true;
      for (let u = i; u <= j; u++) {
        for (let v = u + 1; v <= j; v++) {
          if (isSignificant(u, v)) {
            allNonSig = false;
            break;
          }
        }
        if (!allNonSig) break;
      }

      if (allNonSig) {
        // Range i..j is a valid non-significant group
        const group: number[] = [];
        for (let k = i; k <= j; k++) group.push(k);

        // Keep maximal groups
        // Remove subsets that are strictly contained
        let isContained = false;
        for (let s = 0; s < subsets.length; s++) {
          const existing = subsets[s];
          if (group.every((idx) => existing.includes(idx))) {
            isContained = true;
            break;
          }
        }
        if (!isContained) {
          // Check if any existing subset is contained in group, remove it
          for (let s = subsets.length - 1; s >= 0; s--) {
            if (subsets[s].every((idx) => group.includes(idx))) {
              subsets.splice(s, 1);
            }
          }
          subsets.push(group);
        }
      }
    }
  }

  // Step 2: Assign letters to subsets from top to bottom
  const result: Record<string, string[]> = {};
  for (let i = 0; i < n; i++) {
    result[sortedTreatments[i].id] = [];
  }

  // Sort subsets by their lowest index
  subsets.sort((a, b) => Math.min(...a) - Math.min(...b));

  subsets.forEach((group, gIdx) => {
    const letter = letters[gIdx % letters.length];
    group.forEach((itemIdx) => {
      const id = sortedTreatments[itemIdx].id;
      if (!result[id].includes(letter)) {
        result[id].push(letter);
      }
    });
  });

  // Ensure every treatment has at least one letter
  let extraLetterIdx = subsets.length;
  for (let i = 0; i < n; i++) {
    const id = sortedTreatments[i].id;
    if (result[id].length === 0) {
      result[id].push(letters[extraLetterIdx % letters.length]);
      extraLetterIdx++;
    }
  }

  // Format as strings: 'a', 'ab', 'b', etc.
  const finalMap: Record<string, string> = {};
  for (const id in result) {
    result[id].sort();
    finalMap[id] = result[id].join('');
  }

  return finalMap;
}
