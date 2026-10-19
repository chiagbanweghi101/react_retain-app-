import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState, type FormEvent } from "react";
import { errorMessage } from "../api.ts";
import { BudgetStatusChip } from "../components/BudgetStatusChip.tsx";
import { MonthSwitcher } from "../components/MonthSwitcher.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { useApi } from "../context/useAuth.ts";
import { currentYearMonth, formatMoney, remainingText } from "../format.ts";
import type { MonthSummary } from "../types.ts";

export function BudgetPage() {
  const request = useApi();
  const [period, setPeriod] = useState(currentYearMonth);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Budget · Retain";
  }, []);

  useEffect(() => {
    let active = true;
    request<MonthSummary>(`/api/budgets?year=${period.year}&month=${period.month}`)
      .then((result) => {
        if (!active) return;
        setSummary(result);
        setAmount(result.budget ? String(result.budget.amount) : "");
        setError("");
        setSaved("");
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      });
    return () => {
      active = false;
    };
  }, [request, period.year, period.month]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSaved("");
    setError("");
    try {
      const result = await request<MonthSummary>("/api/budgets", {
        method: "PUT",
        body: JSON.stringify({ year: period.year, month: period.month, amount: Number(amount) }),
      });
      setSummary(result);
      setSaved("Budget saved.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      <PageHeader title="Monthly budget" action={<MonthSwitcher year={period.year} month={period.month} onChange={setPeriod} />} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {saved ? <Alert severity="success">{saved}</Alert> : null}
      {summary ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
            <BudgetStatusChip status={summary.status} />
            <Typography color="text.secondary">Spent {formatMoney(summary.totalSpent)}</Typography>
            <Typography color="text.secondary">{remainingText(summary.remaining)}</Typography>
          </Stack>
          <Stack component="form" onSubmit={onSubmit} spacing={2}>
            <TextField label="Budget amount (NGN)" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? "Saving..." : "Save budget"}
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
