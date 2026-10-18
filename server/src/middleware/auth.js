import jwt from "jsonwebtoken";
import { db, mapUser } from "../db.js";

function getSecret() {
  return process.env.JWT_SECRET ?? "retain-dev-secret";
}

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, getSecret(), { expiresIn: "7d" });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Sign in required." });
  }

  try {
    const payload = jwt.verify(header.slice(7), getSecret());
    const user = await db.collection("users").findOne(
      { _id: Number(payload.sub) },
      { projection: { passwordHash: 0 } },
    );
    if (!user) return res.status(401).json({ message: "Sign in required." });
    req.user = mapUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Sign in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }
  return next();
}
