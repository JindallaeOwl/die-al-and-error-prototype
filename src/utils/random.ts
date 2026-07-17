export type RandomSource = () => number;

export function randomOf<T>(items: readonly T[], random: RandomSource = Math.random): T {
  if (items.length === 0) {
    throw new Error('Cannot select a random item from an empty collection.');
  }

  return items[Math.floor(random() * items.length)];
}

export function chance(probability: number, random: RandomSource = Math.random): boolean {
  return random() < probability;
}

export function shuffled<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function randomInt(
  minInclusive: number,
  maxInclusive: number,
  random: RandomSource = Math.random,
): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(random() * span);
}
