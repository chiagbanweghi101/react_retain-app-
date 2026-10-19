import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api.ts";
import { PageHeader } from "../components/PageHeader.tsx";
import { useApi } from "../context/useAuth.ts";
import { todayISO } from "../format.ts";
import type { Category, Expense, ExpensePayload, PaymentMethod } from "../types.ts";

export function ExpenseFormPage({ mode }: { mode: "create" | "edit" }) {
  const request = useApi();
  const navigate = useNavigate();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = mode === "create" ? "New expense · Retain" : "Edit expense · Retain";
    Promise.all([request<Category[]>("/api/categories"), request<PaymentMethod[]>("/api/payment-methods")])
      .then(([categoryRows, methodRows]) => {
        setCategories(categoryRows);
        setMethods(methodRows);
      })
      .catch((caught) => setError(errorMessage(caught)));
  }, [request, mode]);

  useEffect(() => {
    if (mode !== "edit" || !params.id) return;
    let active = true;
    request<Expense>(`/api/expenses/${params.id}`)
      .then((expense) => {
        if (!active) return;
        setTitle(expense.title);
        setAmount(String(expense.amount));
        setCategoryId(String(expense.categoryId));
        setPaymentMethodId(String(expense.paymentMethodId));
        setDate(expense.date);
        setNotes(expense.notes ?? "");
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      });
    return () => {
      active = false;
    };
  }, [mode, params.id, request]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!categoryId || !paymentMethodId) {
      setError("Choose a category and a payment method.");
      return;
    }
    const payload: ExpensePayload = {
      title,
      amount: Number(amount),
      categoryId: Number(categoryId),
      paymentMethodId: Number(paymentMethodId),
      date,
      notes: notes.trim() ? notes.trim() : null,
    };
    setBusy(true);
    setError("");
    try {
      if (mode === "create") {
        const created = await request<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/expenses/${created.id}`);
      } else {
        await request<Expense>(`/api/expenses/${params.id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/expenses/${params.id}`);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={2} sx={{ maxWidth: 640 }}>
      <PageHeader title={mode === "create" ? "Add expense" : "Edit expense"} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <TextField label="Amount (NGN)" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
      <TextField select label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
        {categories.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>{category.name}</MenuItem>
        ))}
      </TextField>
      <TextField select label="Payment method" value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)} required>
        {methods.map((method) => (
          <MenuItem key={method.id} value={String(method.id)}>{method.name}</MenuItem>
        ))}
      </TextField>
      <TextField label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={3} />
      <Button type="submit" variant="contained" disabled={busy}>
        {busy ? "Saving..." : "Save expense"}
      </Button>
    </Stack>
  );
}
