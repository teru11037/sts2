// 入力欄の空欄や非数値でも NaN を発生させない安全な数値変換。
export function toNum(value: string, fallback = 0): number {
  if (value === '' || value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// 整数専用 (小数を切り捨て)
export function toInt(value: string, fallback = 0): number {
  return Math.trunc(toNum(value, fallback));
}
