/** Deterministic string-similarity helpers used by the matching engine. */

/** Jaro-Winkler similarity in [0,1]. Deterministic and allocation-light. */
export function jaroWinkler(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aFlags = new Array<boolean>(a.length).fill(false);
  const bFlags = new Array<boolean>(b.length).fill(false);
  let matches = 0;

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(b.length - 1, i + matchWindow);
    for (let j = start; j <= end; j++) {
      if (!bFlags[j] && a[i] === b[j]) {
        aFlags[i] = true;
        bFlags[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aFlags[i]) continue;
    while (!bFlags[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;

  const jaro =
    (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3;

  // Winkler prefix bonus (up to 4 common leading chars).
  let prefix = 0;
  const maxPrefix = Math.min(4, a.length, b.length);
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix++;

  return jaro + prefix * 0.1 * (1 - jaro);
}

/** Sørensen–Dice coefficient over character bigrams, in [0,1]. */
export function diceCoefficient(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const gram = a.slice(i, i + 2);
    bigrams.set(gram, (bigrams.get(gram) ?? 0) + 1);
  }
  let hits = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const gram = b.slice(i, i + 2);
    const count = bigrams.get(gram) ?? 0;
    if (count > 0) {
      bigrams.set(gram, count - 1);
      hits++;
    }
  }
  return (2 * hits) / (a.length - 1 + b.length - 1);
}

/** Compare two names: exact normalized match, token overlap, or fuzzy. */
export function nameSimilarity(a: string, b: string): number {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const ta = new Set(na.split(/\s+/));
  const tb = new Set(nb.split(/\s+/));
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  if (ta.size > 0 && overlap === Math.min(ta.size, tb.size) && overlap > 0) {
    // One name fully contained in the other (e.g. "Rahul" vs "Rahul Sharma").
    return 0.85;
  }
  return Math.max(jaroWinkler(na, nb), diceCoefficient(na, nb));
}

export function usernameSimilarity(a: string, b: string): number {
  const na = a.trim().toLowerCase().replace(/[\s._-]+/g, '');
  const nb = b.trim().toLowerCase().replace(/[\s._-]+/g, '');
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  return Math.max(jaroWinkler(na, nb), diceCoefficient(na, nb));
}
