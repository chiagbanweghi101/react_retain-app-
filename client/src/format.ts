import type { BudgetStatus } from "./types.ts";

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function statusLabel(status: BudgetStatus): string {
  switch (status) {
    case "within":
      return "Within budget";
    case "approaching":
      return "Approaching budget";
    case "over":
      return "Over budget";
    default:
      return "No budget";
  }
}

export function statusColor(status: BudgetStatus): "success" | "warning" | "error" | "default" {
  if (status === "within") return "success";
  if (status === "approaching") return "warning";
  if (status === "over") return "error";
  return "default";
}

export function remainingText(remaining: number | null): string {
  if (remaining == null) return "No budget set";
  if (remaining < 0) return `${formatMoney(Math.abs(remaining))} over`;
  return `${formatMoney(remaining)} left`;
}
