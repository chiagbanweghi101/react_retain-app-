import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { errorMessage } from "../api.ts";
import { BudgetStatusChip } from "../components/BudgetStatusChip.tsx";
import { MonthSwitcher } from "../components/MonthSwitcher.tsx";
import { useApi } from "../context/useAuth.ts";
import { currentYearMonth, formatDate, formatMoney, monthLabel, remainingText, statusLabel } from "../format.ts";
import type { DashboardSummary } from "../types.ts";

const CHART_COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#3B82F6", "#F43F5E", "#14B8A6", "#A855F7", "#FB923C"];

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E6E8EF",
  borderRadius: 12,
  color: "#1F2937",
};

function recentMonths(year: number, month: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month - 1 - (count - 1 - index), 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
}

function ActivityRow({ icon, tint, label, value }: { icon: ReactNode; tint: string; label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1.5, py: 1.25 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: tint, color: "#1F2937", flexShrink: 0 }}>{icon}</Box>
        <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
      </Stack>
      <Typography sx={{ fontWeight: 700, textAlign: "right" }}>{value}</Typography>
    </Stack>
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
      <Stack direction={{ xs: "column", md: "row" }} sx={{ justifyContent: "space-between", alignItems: { md: "center" }, gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
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
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.6fr 0.9fr" } }}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                p: { xs: 2.5, md: 3.5 },
                color: "#FFFFFF",
                background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 58%, #5B21B6 100%)",
                minHeight: 230,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                This month
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 460, color: "rgba(255,255,255,0.88)" }}>
                Spent {formatMoney(summary.totalSpent)}
                {summary.budget ? ` of a ${formatMoney(summary.budget.amount)} budget` : ""}. {statusLabel(summary.status)}.
                {used == null ? "" : ` ${used}% of the budget is used.`}
              </Typography>
              <Stack direction="row" spacing={1.25} sx={{ mt: 3, flexWrap: "wrap" }}>
                <Button component={RouterLink} to="/expenses/new" startIcon={<AddIcon />} sx={{ borderRadius: 999, px: 2, bgcolor: "#FFFFFF", color: "#5B21B6", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#F5F3FF" } }}>
                  Add expense
                </Button>
                <Button component={RouterLink} to="/expenses" variant="outlined" sx={{ borderRadius: 999, px: 2, color: "#FFFFFF", borderColor: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.08)" } }}>
                  All expenses
                </Button>
              </Stack>
              <SavingsOutlinedIcon sx={{ position: "absolute", right: -8, bottom: -18, fontSize: 150, color: "rgba(255,255,255,0.16)" }} />
            </Box>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>This month</Typography>
                <BudgetStatusChip status={summary.status} />
              </Stack>
              <ActivityRow icon={<PaidOutlinedIcon fontSize="small" />} tint="#DCFCE7" label="Spent" value={formatMoney(summary.totalSpent)} />
              <ActivityRow icon={<SavingsOutlinedIcon fontSize="small" />} tint="#EDE9FE" label="Remaining" value={remainingText(summary.remaining)} />
              <ActivityRow icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />} tint="#FEF3C7" label="Budget" value={summary.budget ? formatMoney(summary.budget.amount) : "Not set"} />
              <ActivityRow icon={<TrendingUpOutlinedIcon fontSize="small" />} tint="#DBEAFE" label="Highest" value={summary.highestExpense ? formatMoney(summary.highestExpense.amount) : "None"} />
            </Paper>
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" } }}>
            <Paper variant="outlined" sx={{ p: 2.5, height: 360 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Spending vs budget</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
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
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent expenses</Typography>
              <Button component={RouterLink} to="/budget" sx={{ textTransform: "none", fontWeight: 700 }}>
                Set budget
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              {summary.recentExpenses.length === 0 ? <Typography color="text.secondary">Nothing recorded this month.</Typography> : null}
              {summary.recentExpenses.map((expense) => (
                <Stack key={expense.id} component={RouterLink} to={`/expenses/${expense.id}`} direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", textDecoration: "none", color: "inherit", py: 0.75, borderTop: "1px solid #F3F4F6" }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{expense.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(expense.date)} · {expense.categoryName}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(expense.amount)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
