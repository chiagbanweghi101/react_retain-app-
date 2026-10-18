import { Router } from "express";
import { db, nextId } from "../db.js";
import { buildBudgetView } from "../budgetSummary.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, parseYearMonth, roundMoney } from "../utils.js";

export const budgetRouter = Router();
budgetRouter.use(requireAuth);

budgetRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const period = parseYearMonth(req.query);
    if (!period) return res.status(400).json({ message: "Choose a valid month." });
    return res.json(await buildBudgetView(req.user.id, period.year, period.month));
  }),
);

budgetRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    if (req.body?.year == null || req.body?.month == null) {
      return res.status(400).json({ message: "Choose a valid month." });
    }
    const period = parseYearMonth({ year: String(req.body.year), month: String(req.body.month) });
    if (!period) return res.status(400).json({ message: "Choose a valid month." });

    const amount = roundMoney(Number(req.body?.amount));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
      return res.status(400).json({ message: "Enter a budget greater than zero." });
    }

    const existing = await db.collection("budgets").findOne({
      userId: req.user.id,
      year: period.year,
      month: period.month,
    });
    if (existing) {
      await db.collection("budgets").updateOne({ _id: existing._id, userId: req.user.id }, { $set: { amount } });
    } else {
      await db.collection("budgets").insertOne({
        _id: await nextId("budgets"),
        userId: req.user.id,
        year: period.year,
        month: period.month,
        amount,
      });
    }

    return res.json(await buildBudgetView(req.user.id, period.year, period.month));
  }),
);
