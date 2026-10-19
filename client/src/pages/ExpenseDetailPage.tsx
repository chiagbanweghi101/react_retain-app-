import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api.ts";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { useApi } from "../context/useAuth.ts";
import { formatDate, formatMoney } from "../format.ts";
import type { Expense } from "../types.ts";

export function ExpenseDetailPage() {
  const request = useApi();
  const navigate = useNavigate();
  const params = useParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    document.title = "Expense · Retain";
    if (!params.id) return;
    request<Expense>(`/api/expenses/${params.id}`)
      .then(setExpense)
      .catch((caught) => setError(errorMessage(caught)));
  }, [params.id, request]);

  async function removeExpense() {
    if (!expense) return;
    try {
      await request<void>(`/api/expenses/${expense.id}`, { method: "DELETE" });
      navigate("/expenses");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <PageHeader
        title={expense?.title ?? "Expense"}
        action={
          expense ? (
            <Button component={RouterLink} to={`/expenses/${expense.id}/edit`} variant="outlined">
              Edit
            </Button>
          ) : null
        }
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {expense ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{formatMoney(expense.amount)}</Typography>
          <Typography sx={{ mt: 2 }}>Category: {expense.categoryName}</Typography>
          <Typography>Payment: {expense.paymentMethodName}</Typography>
          <Typography>Date: {formatDate(expense.date)}</Typography>
          <Typography sx={{ mt: 1 }}>{expense.notes || "No notes"}</Typography>
          <Button color="error" sx={{ mt: 2 }} onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </Paper>
      ) : null}
      <ConfirmDialog open={confirming} title="Delete expense" message="This expense will be removed." onClose={() => setConfirming(false)} onConfirm={removeExpense} />
    </Stack>
  );
}
