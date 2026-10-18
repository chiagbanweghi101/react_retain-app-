import { Router } from "express";
import { db, hydrateExpenses, mapUser, nextId } from "../db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler, monthRange, readId, roundMoney } from "../utils.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

function readCategoryName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 2 || name.length > 40) return null;
  return name;
}

async function categoryStats() {
  const [categories, grouped] = await Promise.all([
    db.collection("categories").find().toArray(),
    db
      .collection("expenses")
      .aggregate([{ $group: { _id: "$categoryId", count: { $sum: 1 }, total: { $sum: "$amount" } } }])
      .toArray(),
  ]);
  const byId = new Map(grouped.map((row) => [row._id, row]));
  return categories.map((category) => {
    const stats = byId.get(category._id);
    return {
      id: category._id,
      name: category.name,
      isDefault: Boolean(category.isDefault),
      expenseCount: stats?.count ?? 0,
      total: roundMoney(stats?.total ?? 0),
    };
  });
}

adminRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const rows = await categoryStats();
    rows.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
    res.json(rows);
  }),
);

adminRouter.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const name = readCategoryName(req.body?.name);
    if (!name) return res.status(400).json({ message: "Enter a category name (2–40 characters)." });
    const nameKey = name.toLowerCase();
    const existing = await db.collection("categories").findOne({ nameKey });
    if (existing) return res.status(409).json({ message: "That category already exists." });

    const doc = { _id: await nextId("categories"), name, nameKey, isDefault: false };
    try {
      await db.collection("categories").insertOne(doc);
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ message: "That category already exists." });
      throw error;
    }
    const created = (await categoryStats()).find((category) => category.id === doc._id);
    return res.status(201).json(created);
  }),
);

adminRouter.put(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const id = readId(req.params.id);
    if (!id) return res.status(404).json({ message: "Category not found." });
    const category = await db.collection("categories").findOne({ _id: id });
    if (!category) return res.status(404).json({ message: "Category not found." });
    if (category.isDefault) return res.status(400).json({ message: "The default category cannot be changed." });

    const name = readCategoryName(req.body?.name);
    if (!name) return res.status(400).json({ message: "Enter a category name (2–40 characters)." });
    const nameKey = name.toLowerCase();
    const existing = await db.collection("categories").findOne({ nameKey, _id: { $ne: id } });
    if (existing) return res.status(409).json({ message: "That category already exists." });

    await db.collection("categories").updateOne({ _id: id }, { $set: { name, nameKey } });
    const updated = (await categoryStats()).find((item) => item.id === id);
    return res.json(updated);
  }),
);

adminRouter.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const id = readId(req.params.id);
    if (!id) return res.status(404).json({ message: "Category not found." });
    const category = await db.collection("categories").findOne({ _id: id });
    if (!category) return res.status(404).json({ message: "Category not found." });
    if (category.isDefault) return res.status(400).json({ message: "The default category cannot be deleted." });

    const fallback = await db.collection("categories").findOne({ isDefault: true });
    if (!fallback) return res.status(500).json({ message: "The default category is missing." });

    const moved = await db.collection("expenses").updateMany({ categoryId: id }, { $set: { categoryId: fallback._id } });
    await db.collection("categories").deleteOne({ _id: id });
    return res.json({ reassigned: moved.modifiedCount });
  }),
);

adminRouter.get(
  "/insights",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);
    const [totalUsers, totalExpenses, valueRow, expensesThisMonth, stats, recentDocs, recentUsers] = await Promise.all([
      db.collection("users").countDocuments({ role: "user" }),
      db.collection("expenses").countDocuments(),
      db.collection("expenses").aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
      db.collection("expenses").countDocuments({ date: { $gte: start, $lte: end } }),
      categoryStats(),
      db.collection("expenses").find().sort({ createdAt: -1, _id: -1 }).limit(8).toArray(),
      db.collection("users").find({ role: "user" }).sort({ createdAt: -1, _id: -1 }).limit(8).toArray(),
    ]);

    const spendingPerCategory = [...stats].sort(
      (a, b) => b.total - a.total || a.name.localeCompare(b.name),
    );
    const usage = stats.map((row) => ({ categoryId: row.id, categoryName: row.name, count: row.expenseCount }));
    const byMostUsed = [...usage].sort((a, b) => b.count - a.count || a.categoryName.localeCompare(b.categoryName));
    const byLeastUsed = [...usage].sort((a, b) => a.count - b.count || a.categoryName.localeCompare(b.categoryName));

    return res.json({
      totalUsers,
      totalExpenses,
      totalValue: roundMoney(valueRow[0]?.total ?? 0),
      expensesThisMonth,
      spendingPerCategory: spendingPerCategory.map((row) => ({
        categoryId: row.id,
        categoryName: row.name,
        total: row.total,
        count: row.expenseCount,
      })),
      topCategories: byMostUsed.slice(0, 5),
      bottomCategories: byLeastUsed.slice(0, 5),
      recentExpenses: await hydrateExpenses(recentDocs, true),
      recentUsers: recentUsers.map(mapUser),
    });
  }),
);
