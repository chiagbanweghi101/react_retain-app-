import bcrypt from "bcryptjs";
import { Router } from "express";
import { db, mapUser, nextId } from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils.js";

export const authRouter = Router();

function readEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function readPassword(value) {
  if (typeof value !== "string" || value.length < 6 || value.length > 100) return null;
  return value;
}

function stamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = readEmail(req.body?.email);
    const password = readPassword(req.body?.password);

    if (name.length < 2 || name.length > 60) return res.status(400).json({ message: "Enter your name." });
    if (!email) return res.status(400).json({ message: "Enter a valid email address." });
    if (!password) return res.status(400).json({ message: "Use a password of at least 6 characters." });

    const existing = await db.collection("users").findOne({ email });
    if (existing) return res.status(409).json({ message: "An account with that email already exists." });

    const user = {
      _id: await nextId("users"),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "user",
      createdAt: stamp(new Date()),
    };
    try {
      await db.collection("users").insertOne(user);
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: "An account with that email already exists." });
      }
      throw error;
    }
    const mapped = mapUser(user);
    return res.status(201).json({ token: signToken(mapped), user: mapped });
  }),
);

authRouter.post(
  "/signin",
  asyncHandler(async (req, res) => {
    const email = readEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(401).json({ message: "Email or password is incorrect." });

    const row = await db.collection("users").findOne({ email });
    const matches = row ? await bcrypt.compare(password, row.passwordHash) : false;
    if (!row || !matches) return res.status(401).json({ message: "Email or password is incorrect." });

    const user = mapUser(row);
    return res.json({ token: signToken(user), user });
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});
