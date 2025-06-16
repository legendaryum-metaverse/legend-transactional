export const fibonacci = (n: number): number => {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let fibPrev = 0;
  let fibCurrent = 1;

  for (let i = 2; i <= n; i++) {
    const temp = fibCurrent;
    fibCurrent += fibPrev;
    fibPrev = temp;
  }

  return fibCurrent;
};
