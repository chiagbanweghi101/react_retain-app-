import { Router } from "express";
import { db, hydrateExpenses } from "../db.js";
import { buildBudgetView } from "../budgetSummary.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, monthRange, parseYearMonth, roundMoney } from "../utils.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const period = parseYearMonth(req.query);
    if (!period) return res.status(400).json({ message: "Choose a valid month." });

    const summary = await buildBudgetView(req.user.id, period.year, period.month);
    const { start, end } = monthRange(period.year, period.month);
    const range = { userId: req.user.id, date: { $gte: start, $lte: end } };
    const [highestDoc, spending, recentDocs] = await Promise.all([
      db.collection("expenses").find(range).sort({ amount: -1, date: -1, _id: -1 }).limit(1).next(),
      db
        .collection("expenses")
        .aggregate([
          { $match: range },
          { $group: { _id: "$categoryId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          { $sort: { total: -1, _id: 1 } },
        ])
        .toArray(),
      db.collection("expenses").find(range).sort({ date: -1, createdAt: -1, _id: -1 }).limit(5).toArray(),
    ]);

    const categoryIds = spending.map((row) => row._id);
    const categories = await db.collection("categories").find({ _id: { $in: categoryIds } }).toArray();
    const names = new Map(categories.map((row) => [row._id, row.name]));
    const [highest] = highestDoc ? await hydrateExpenses([highestDoc]) : [null];

    return res.json({
      ...summary,
      highestExpense: highest,
      spendingByCategory: spending
        .map((row) => ({
          categoryId: row._id,
          categoryName: names.get(row._id) ?? "Unknown",
          total: roundMoney(row.total),
          count: row.count,
        }))
        .sort((a, b) => b.total - a.total || a.categoryName.localeCompare(b.categoryName)),
      recentExpenses: await hydrateExpenses(recentDocs),
    });
  }),
);
