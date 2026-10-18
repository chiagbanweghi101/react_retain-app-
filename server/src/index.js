import cors from "cors";
import express from "express";
import { db, initDb } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { budgetRouter } from "./routes/budgets.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { expenseRouter } from "./routes/expenses.js";
import { categoryRouter, paymentMethodRouter } from "./routes/lookups.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const origins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/api/health", async (_req, res, next) => {
  try {
    await db.command({ ping: 1 });
    res.json({ ok: true, database: "mongodb" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/payment-methods", paymentMethodRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "That API route does not exist." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Try again." });
});

try {
  await initDb();
  await seedIfEmpty();
} catch (error) {
  console.error("Could not connect to MongoDB at", process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
  console.error(error);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Retain API listening on http://localhost:${port}`);
});
