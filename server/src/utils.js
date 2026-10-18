export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function queryValue(value) {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : undefined;
  return typeof value === "string" ? value : undefined;
}

export function monthRange(year, month) {
  const monthText = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${monthText}-01`,
    end: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function parseYearMonth(query) {
  const now = new Date();
  const yearRaw = queryValue(query.year);
  const monthRaw = queryValue(query.month);
  const year = yearRaw == null || yearRaw === "" ? now.getFullYear() : Number(yearRaw);
  const month = monthRaw == null || monthRaw === "" ? now.getMonth() + 1 : Number(monthRaw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
}

export function readId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function isRealDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseOptionalDate(value) {
  const raw = queryValue(value);
  if (raw == null || raw === "") return { ok: true, value: null };
  if (!isRealDate(raw)) return { ok: false, value: null };
  return { ok: true, value: raw };
}

export function parseRequiredDate(value) {
  if (typeof value !== "string" || !isRealDate(value)) return { ok: false, value: null };
  return { ok: true, value: value };
}

export function parseOptionalInt(value) {
  const raw = queryValue(value);
  if (raw == null || raw === "") return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return { ok: false, value: null };
  return { ok: true, value: n };
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getBudgetStatus(totalSpent, budgetAmount) {
  if (budgetAmount == null) return { remaining: null, status: "none" };
  const remaining = roundMoney(budgetAmount - totalSpent);
  if (budgetAmount === 0) return { remaining, status: totalSpent > 0 ? "over" : "within" };
  const ratio = totalSpent / budgetAmount;
  if (ratio >= 1) return { remaining, status: "over" };
  if (ratio >= 0.8) return { remaining, status: "approaching" };
  return { remaining, status: "within" };
}
