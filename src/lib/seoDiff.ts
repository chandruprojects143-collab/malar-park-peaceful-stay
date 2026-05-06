/** Simple line-by-line diff between two pretty-printed JSON strings. */
export type DiffLine =
  | { kind: "same"; text: string; line: number }
  | { kind: "add"; text: string; line: number }
  | { kind: "del"; text: string; line: number };

export const diffLines = (expected: string, live: string): DiffLine[] => {
  const a = expected.split("\n");
  const b = live.split("\n");
  // LCS-based minimal diff
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0, j = 0, ln = 1;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ kind: "same", text: a[i], line: ln++ });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "del", text: a[i], line: ln++ });
      i++;
    } else {
      out.push({ kind: "add", text: b[j], line: ln++ });
      j++;
    }
  }
  while (i < m) out.push({ kind: "del", text: a[i++], line: ln++ });
  while (j < n) out.push({ kind: "add", text: b[j++], line: ln++ });
  return out;
};

export const diffSummary = (lines: DiffLine[]) => ({
  added: lines.filter((l) => l.kind === "add").length,
  removed: lines.filter((l) => l.kind === "del").length,
  unchanged: lines.filter((l) => l.kind === "same").length,
});
