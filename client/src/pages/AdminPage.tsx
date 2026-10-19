import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Alert, Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { errorMessage } from "../api.ts";
import { PageHeader } from "../components/PageHeader.tsx";
import { StatCard } from "../components/StatCard.tsx";
import { useApi } from "../context/useAuth.ts";
import { formatDate, formatMoney } from "../format.ts";
import type { AdminInsights, CategoryUsage } from "../types.ts";

const CHART_COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#3B82F6", "#F43F5E", "#14B8A6", "#A855F7", "#FB923C"];

const tooltipStyle = {
  background: "#171A22",
  border: "1px solid #2A2E3A",
  borderRadius: 12,
  color: "#F4F4F5",
};

function RankList({ title, rows, accent }: { title: string; rows: CategoryUsage[]; accent: string }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={1.75}>
        {rows.map((row, index) => (
          <Box key={row.categoryId}>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">
                {index + 1}. {row.categoryName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.count}
              </Typography>
            </Stack>
            <Box sx={{ height: 6, borderRadius: 99, bgcolor: "#2A2E3A", overflow: "hidden" }}>
              <Box sx={{ width: `${(row.count / max) * 100}%`, height: "100%", bgcolor: accent, borderRadius: 99 }} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function AdminPage() {
  const request = useApi();
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Insights · Retain";
    request<AdminInsights>("/api/admin/insights")
      .then(setInsights)
      .catch((caught) => setError(errorMessage(caught)));
  }, [request]);

  const pieData = (insights?.spendingPerCategory ?? [])
    .filter((row) => row.total > 0)
    .map((row) => ({ name: row.categoryName, value: row.total }));

  return (
    <Stack spacing={2.5}>
      <PageHeader title="Insights" subtitle="Registered users and every recorded expense" />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!insights && !error ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {insights ? (
        <>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
            <StatCard label="Registered users" value={String(insights.totalUsers)} icon={<GroupsOutlinedIcon />} />
            <StatCard label="Expenses" value={String(insights.totalExpenses)} icon={<ReceiptLongOutlinedIcon />} accent="#3B82F6" />
            <StatCard label="Total value" value={formatMoney(insights.totalValue)} icon={<PaidOutlinedIcon />} accent="#22C55E" />
            <StatCard label="Expenses this month" value={String(insights.expensesThisMonth)} icon={<CalendarMonthOutlinedIcon />} accent="#F59E0B" />
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" } }}>
            <Paper variant="outlined" sx={{ p: 2.5, minHeight: 360 }}>
              <Typography variant="h6">Spending by category</Typography>
              {pieData.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No spending recorded yet.
                </Typography>
              ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" }, gap: 2, alignItems: "center" }}>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84}>
                          {pieData.map((row, index) => (
                            <Cell key={row.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatMoney(Number(value ?? 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={0.75} sx={{ maxHeight: 280, overflow: "auto" }}>
                    {insights.spendingPerCategory.map((row) => (
                      <Stack key={row.categoryId} direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 0 }}>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: row.total > 0 ? CHART_COLORS[pieData.findIndex((item) => item.name === row.categoryName) % CHART_COLORS.length] : "#3F3F46",
                              mr: 1,
                            }}
                          />
                          {row.categoryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          {formatMoney(row.total)} · {row.count}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
            <Stack spacing={2}>
              <RankList title="Top 5 categories" rows={insights.topCategories} accent="#7C3AED" />
              <RankList title="Bottom 5 categories" rows={insights.bottomCategories} accent="#F59E0B" />
            </Stack>
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" } }}>
            <Paper variant="outlined" sx={{ overflow: "auto" }}>
              <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                Recently added expenses
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.recentExpenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {expense.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {expense.categoryName}
                        </Typography>
                      </TableCell>
                      <TableCell>{expense.userName}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell align="right">{formatMoney(expense.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Paper variant="outlined" sx={{ overflow: "auto" }}>
              <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                Recently registered users
              </Typography>
              <Stack spacing={1.25} sx={{ px: 2, pb: 2 }}>
                {insights.recentUsers.map((user) => (
                  <Stack key={user.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#7C3AED33",
                        color: "#C4B5FD",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {user.name.slice(0, 1).toUpperCase()}
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Box>
        </>
      ) : null}
    </Stack>
  );
}
