import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Alert, Box, Button, IconButton, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { errorMessage } from "../api.ts";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { useApi } from "../context/useAuth.ts";
import { formatDate, formatMoney } from "../format.ts";
import { PAGE_SIZE, hasActiveFilters, resetFilters, setCategoryId, setDateFrom, setDateTo, setPage, setPaymentMethodId, setSearch, setSort, toExpenseQuery } from "../store/filtersSlice.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import type { Category, Expense, ExpenseList, PaymentMethod, SortBy, SortOrder } from "../types.ts";

export function ExpensesPage() {
  const request = useApi();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const [list, setList] = useState<ExpenseList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  useEffect(() => {
    document.title = "Expenses · Retain";
    Promise.all([request<Category[]>("/api/categories"), request<PaymentMethod[]>("/api/payment-methods")])
      .then(([categoryRows, methodRows]) => {
        setCategories(categoryRows);
        setMethods(methodRows);
      })
      .catch((caught) => setError(errorMessage(caught)));
  }, [request]);

  useEffect(() => {
    let active = true;
    request<ExpenseList>(`/api/expenses?${toExpenseQuery(filters)}`)
      .then((result) => {
        if (active) {
          setList(result);
          setError("");
        }
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      });
    return () => {
      active = false;
    };
  }, [request, filters]);

  async function removeExpense() {
    if (!pendingDelete) return;
    try {
      await request<void>(`/api/expenses/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      const result = await request<ExpenseList>(`/api/expenses?${toExpenseQuery(filters)}`);
      setList(result);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  const pages = Math.max(1, Math.ceil((list?.total ?? 0) / PAGE_SIZE));
  const sortValue = `${filters.sortBy}:${filters.sortOrder}`;

  return (
    <Box>
      <PageHeader
        title="Expenses"
        subtitle={list ? `${list.total} matching` : "Your spending"}
        action={
          <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddIcon />}>
            Add expense
          </Button>
        }
      />
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr 1fr 1fr" } }}>
          <TextField label="Search" value={filters.search} onChange={(event) => dispatch(setSearch(event.target.value))} />
          <TextField select label="Category" value={filters.categoryId ?? ""} onChange={(event) => dispatch(setCategoryId(event.target.value === "" ? null : Number(event.target.value)))}>
            <MenuItem value="">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Payment" value={filters.paymentMethodId ?? ""} onChange={(event) => dispatch(setPaymentMethodId(event.target.value === "" ? null : Number(event.target.value)))}>
            <MenuItem value="">All</MenuItem>
            {methods.map((method) => (
              <MenuItem key={method.id} value={method.id}>{method.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="From" type="date" value={filters.dateFrom} onChange={(event) => dispatch(setDateFrom(event.target.value))} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="To" type="date" value={filters.dateTo} onChange={(event) => dispatch(setDateTo(event.target.value))} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center" }}>
          <TextField
            select
            size="small"
            label="Sort"
            value={sortValue}
            onChange={(event) => {
              const [sortBy, sortOrder] = event.target.value.split(":") as [SortBy, SortOrder];
              dispatch(setSort({ sortBy, sortOrder }));
            }}
          >
            <MenuItem value="date:desc">Newest date</MenuItem>
            <MenuItem value="date:asc">Oldest date</MenuItem>
            <MenuItem value="amount:desc">Highest amount</MenuItem>
            <MenuItem value="amount:asc">Lowest amount</MenuItem>
          </TextField>
          {hasActiveFilters(filters) ? <Button onClick={() => dispatch(resetFilters())}>Clear filters</Button> : null}
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list?.items.map((expense) => (
              <TableRow key={expense.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/expenses/${expense.id}`)}>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.categoryName}</TableCell>
                <TableCell>{expense.paymentMethodName}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell align="right">{formatMoney(expense.amount)}</TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <IconButton component={RouterLink} to={`/expenses/${expense.id}`} aria-label={`View ${expense.title}`}><VisibilityOutlinedIcon /></IconButton>
                  <IconButton component={RouterLink} to={`/expenses/${expense.id}/edit`} aria-label={`Edit ${expense.title}`}><EditOutlinedIcon /></IconButton>
                  <IconButton aria-label={`Delete ${expense.title}`} onClick={() => setPendingDelete(expense)}><DeleteOutlinedIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {list && list.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">No expenses match these filters.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>
      <Stack sx={{ alignItems: "center", mt: 2 }}>
        <Pagination count={pages} page={filters.page} onChange={(_event, page) => dispatch(setPage(page))} color="primary" />
      </Stack>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete expense"
        message={pendingDelete ? `Delete ${pendingDelete.title}?` : ""}
        onClose={() => setPendingDelete(null)}
        onConfirm={removeExpense}
      />
    </Box>
  );
}
