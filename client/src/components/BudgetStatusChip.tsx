import { Chip } from "@mui/material";
import { statusColor, statusLabel } from "../format.ts";
import type { BudgetStatus } from "../types.ts";

export function BudgetStatusChip({ status }: { status: BudgetStatus }) {
  return <Chip size="small" color={statusColor(status)} label={statusLabel(status)} />;
}
