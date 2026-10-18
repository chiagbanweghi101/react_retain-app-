import { Router } from "express";
import { db, mapCategory } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils.js";

export const categoryRouter = Router();
export const paymentMethodRouter = Router();

categoryRouter.use(requireAuth);
paymentMethodRouter.use(requireAuth);

categoryRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.collection("categories").find().toArray();
    rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    res.json(rows.map(mapCategory));
  }),
);

paymentMethodRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.collection("paymentMethods").find().sort({ name: 1 }).toArray();
    res.json(rows.map((row) => ({ id: row._id, name: row.name })));
  }),
);
