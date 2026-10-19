import { db } from "./db.js";
import { getBudgetStatus, monthRange, roundMoney } from "./utils.js";

export async function buildBudgetView(userId, year, month) {
  const { start, end } = monthRange(year, month);
  const [spent] = await db
    .collection("expenses")
    .aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    .toArray();
  const totalSpent = roundMoney(spent?.total ?? 0);
  const budget = await db.collection("budgets").findOne({ userId, year, month });
  const status = getBudgetStatus(totalSpent, budget ? budget.amount : null);

  return {
    year,
    month,
    budget: budget ? { id: budget._id, year: budget.year, month: budget.month, amount: budget.amount } : null,
    totalSpent,
    remaining: status.remaining,
    status: status.status,
  };
}
