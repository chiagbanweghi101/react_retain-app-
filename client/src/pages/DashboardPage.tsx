import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { errorMessage } from "../api.ts";
import { BudgetStatusChip } from "../components/BudgetStatusChip.tsx";
import { MonthSwitcher } from "../components/MonthSwitcher.tsx";
import { StatCard } from "../components/StatCard.tsx";
import { useApi } from "../context/useAuth.ts";
import { currentYearMonth, formatDate, formatMoney, monthLabel, remainingText } from "../format.ts";
import type { DashboardSummary } from "../types.ts";

const CHART_COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#3B82F6", "#F43F5E", "#14B8A6", "#A855F7", "#FB923C"];

const tooltipStyle = {
  background: "#171A22",
  border: "1px solid #2A2E3A",
  borderRadius: 12,
  color: "#F4F4F5",
};

function recentMonths(year: number, month: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month - 1 - (count - 1 - index), 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
}

function ActionCard({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Paper component={RouterLink} to={to} variant="outlined" sx={{ p: 2, textDecoration: "none", color: "inherit" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {icon}
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const request = useApi();
  const [period, setPeriod] = useState(currentYearMonth);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<DashboardSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard · Retain";
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const months = recentMonths(period.year, period.month, 6);
    Promise.all(months.map((item) => request<DashboardSummary>(`/api/dashboard?year=${item.year}&month=${item.month}`)))
      .then((results) => {
        if (!active) return;
        setHistory(results);
        setSummary(results[results.length - 1] ?? null);
        setError("");
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [request, period.year, period.month]);

  const budgetAmount = summary?.budget?.amount ?? 0;
  const used = budgetAmount > 0 && summary ? Math.round((summary.totalSpent / budgetAmount) * 100) : null;
  const barData = history.map((item) => ({
    name: new Date(item.year, item.month - 1, 1).toLocaleDateString("en-ZA", { month: "short" }),
    Spent: item.totalSpent,
    Budget: item.budget?.amount ?? 0,
  }));
  const pieData = (summary?.spendingByCategory ?? []).map((row) => ({ name: row.categoryName, value: row.total }));

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", md: "row" }} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography color="text.secondary">{summary ? monthLabel(summary.year, summary.month) : "This month"}</Typography>
        </Box>
        <MonthSwitcher year={period.year} month={period.month} onChange={setPeriod} />
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading || !summary ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <StatCard label="Spent" value={formatMoney(summary.totalSpent)} icon={<PaidOutlinedIcon />} accent="#F43F5E" />
            <StatCard label="Budget" value={summary.budget ? formatMoney(summary.budget.amount) : "Not set"} icon={<AccountBalanceWalletOutlinedIcon />} />
            <StatCard label="Remaining" value={remainingText(summary.remaining)} hint={used == null ? undefined : `${used}% of the budget used`} icon={<SavingsOutlinedIcon />} accent="#22C55E" />
            <StatCard label="Highest expense" value={summary.highestExpense ? formatMoney(summary.highestExpense.amount) : "None"} hint={summary.highestExpense?.title} icon={<TrendingUpOutlinedIcon />} accent="#F59E0B" />
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" } }}>
            <Paper variant="outlined" sx={{ p: 2.5, height: 360 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">Spending vs budget</Typography>
                <BudgetStatusChip status={summary.status} />
              </Stack>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid stroke="#2A2E3A" vertical={false} />
                  <XAxis dataKey="name" stroke="#A1A1AA" />
                  <YAxis stroke="#A1A1AA" tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatMoney(Number(value ?? 0))} />
                  <Bar dataKey="Spent" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Budget" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2.5, minHeight: 360 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Spending by category
              </Typography>
              {pieData.length === 0 ? (
                <Typography color="text.secondary">No spending this month.</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84}>
                        {pieData.map((row, index) => (
                          <Cell key={row.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatMoney(Number(value ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={0.5}>
                    {summary.spendingByCategory.map((row, index) => (
                      <Stack key={row.categoryId} direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", bgcolor: CHART_COLORS[index % CHART_COLORS.length], mr: 1 }} />
                          {row.categoryName}
                        </Typography>
                        <Typography variant="body2">{formatMoney(row.total)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </Paper>
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" } }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Recent expenses
              </Typography>
              <Stack spacing={1}>
                {summary.recentExpenses.length === 0 ? <Typography color="text.secondary">Nothing recorded this month.</Typography> : null}
                {summary.recentExpenses.map((expense) => (
                  <Stack key={expense.id} component={RouterLink} to={`/expenses/${expense.id}`} direction="row" sx={{ justifyContent: "space-between", textDecoration: "none", color: "inherit" }}>
                    <Box>
                      <Typography>{expense.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(expense.date)} · {expense.categoryName}
                      </Typography>
                    </Box>
                    <Typography>{formatMoney(expense.amount)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Quick actions
              </Typography>
              <Stack spacing={1.5}>
                <ActionCard to="/expenses/new" icon={<AddIcon color="primary" />} title="Add expense" text="Record a payment" />
                <ActionCard to="/budget" icon={<SavingsOutlinedIcon color="success" />} title="Set budget" text="Update this month" />
                <ActionCard to="/expenses" icon={<PaidOutlinedIcon color="warning" />} title="All expenses" text="Search and filter" />
                <ActionCard to="/budget" icon={<TrendingUpOutlinedIcon color="secondary" />} title="Budget status" text={summary.status} />
              </Stack>
            </Paper>
          </Box>
        </>
      )}
    </Stack>
  );
}
