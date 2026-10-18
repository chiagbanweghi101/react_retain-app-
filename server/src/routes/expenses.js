import { Router } from "express";
import { db, hydrateExpenses, nextId } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  asyncHandler,
  escapeRegex,
  parseOptionalDate,
  parseOptionalInt,
  parseRequiredDate,
  queryValue,
  readId,
  roundMoney,
} from "../utils.js";

export const expenseRouter = Router();
expenseRouter.use(requireAuth);

function stamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function readExpenseBody(body) {
  if (!body || typeof body !== "object") return { error: "Expense details are missing." };

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 80) return { error: "Enter a title up to 80 characters." };

  const amount = roundMoney(Number(body.amount));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
    return { error: "Enter an amount greater than zero." };
  }

  const categoryId = Number(body.categoryId);
  const paymentMethodId = Number(body.paymentMethodId);
  if (!Number.isInteger(categoryId) || !Number.isInteger(paymentMethodId)) {
    return { error: "Choose a category and a payment method." };
  }

  const [category, method] = await Promise.all([
    db.collection("categories").findOne({ _id: categoryId }),
    db.collection("paymentMethods").findOne({ _id: paymentMethodId }),
  ]);
  if (!category || !method) return { error: "Choose a category and a payment method." };

  const date = parseRequiredDate(body.date);
  if (!date.ok) return { error: "Enter a valid date." };

  let notes = null;
  if (body.notes != null && String(body.notes).trim() !== "") {
    if (typeof body.notes !== "string") return { error: "Notes must be text." };
    notes = body.notes.trim();
    if (notes.length > 500) return { error: "Keep notes under 500 characters." };
  }

  return { value: { title, amount, categoryId, paymentMethodId, date: date.value, notes } };
}

async function loadOwned(id, userId) {
  const doc = await db.collection("expenses").findOne({ _id: id, userId });
  if (!doc) return null;
  const [expense] = await hydrateExpenses([doc]);
  return expense;
}

expenseRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = (queryValue(req.query.search) ?? "").trim();
    const category = parseOptionalInt(req.query.categoryId);
    const paymentMethod = parseOptionalInt(req.query.paymentMethodId);
    const dateFrom = parseOptionalDate(req.query.dateFrom);
    const dateTo = parseOptionalDate(req.query.dateTo);
    const pageResult = parseOptionalInt(req.query.page);
    const pageSizeResult = parseOptionalInt(req.query.pageSize);

    if (!category.ok || !paymentMethod.ok || !dateFrom.ok || !dateTo.ok || !pageResult.ok || !pageSizeResult.ok) {
      return res.status(400).json({ message: "One of the filters is not valid." });
    }

    const sortBy = queryValue(req.query.sortBy) === "amount" ? "amount" : "date";
    const sortOrder = queryValue(req.query.sortOrder) === "asc" ? 1 : -1;
    const page = pageResult.value ?? 1;
    const pageSize = Math.min(50, Math.max(1, pageSizeResult.value ?? 8));
    const filter = { userId: req.user.id };

    if (search) {
      const pattern = escapeRegex(search);
      filter.$or = [
        { title: { $regex: pattern, $options: "i" } },
        { notes: { $regex: pattern, $options: "i" } },
      ];
    }
    if (category.value != null) filter.categoryId = category.value;
    if (paymentMethod.value != null) filter.paymentMethodId = paymentMethod.value;
    if (dateFrom.value || dateTo.value) {
      filter.date = {};
      if (dateFrom.value) filter.date.$gte = dateFrom.value;
      if (dateTo.value) filter.date.$lte = dateTo.value;
    }

    const sort = sortBy === "amount" ? { amount: sortOrder, _id: -1 } : { date: sortOrder, _id: -1 };
    const total = await db.collection("expenses").countDocuments(filter);
    const docs = await db
      .collection("expenses")
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return res.json({ items: await hydrateExpenses(docs), total, page, pageSize });
  }),
);

expenseRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = readId(req.params.id);
    if (!id) return res.status(400).json({ message: "Expense not found." });
    const expense = await loadOwned(id, req.user.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    return res.json(expense);
  }),
);

expenseRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = await readExpenseBody(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const expense = parsed.value;
    const doc = {
      _id: await nextId("expenses"),
      userId: req.user.id,
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paymentMethodId: expense.paymentMethodId,
      date: expense.date,
      notes: expense.notes,
      createdAt: stamp(new Date()),
    };
    await db.collection("expenses").insertOne(doc);
    return res.status(201).json(await loadOwned(doc._id, req.user.id));
  }),
);

expenseRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = readId(req.params.id);
    if (!id) return res.status(400).json({ message: "Expense not found." });
    const existing = await db.collection("expenses").findOne({ _id: id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: "Expense not found." });

    const parsed = await readExpenseBody(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const expense = parsed.value;
    await db.collection("expenses").updateOne(
      { _id: id, userId: req.user.id },
      {
        $set: {
          title: expense.title,
          amount: expense.amount,
          categoryId: expense.categoryId,
          paymentMethodId: expense.paymentMethodId,
          date: expense.date,
          notes: expense.notes,
        },
      },
    );
    return res.json(await loadOwned(id, req.user.id));
  }),
);

expenseRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = readId(req.params.id);
    if (!id) return res.status(400).json({ message: "Expense not found." });
    const result = await db.collection("expenses").deleteOne({ _id: id, userId: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Expense not found." });
    return res.status(204).end();
  }),
);
