// src/banker.ts
export function isSafeState(
  allocation: number[][],
  need: number[][],
  available: number[]
): { safe: boolean; sequence: number[] } {
  const processes = allocation.length;
  const resources = available.length;

  const work = [...available];
  const finish = Array(processes).fill(false);
  const sequence: number[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < processes; i++) {
      if (!finish[i]) {
        const canRun = need[i].every((n, j) => n <= work[j]);
        if (canRun) {
          for (let j = 0; j < resources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          sequence.push(i);
          changed = true;
        }
      }
    }
  }

  return {
    safe: finish.every(f => f),
    sequence,
  };
}
