import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "retain";

export const client = new MongoClient(uri);
export let db;

export async function initDb() {
  await client.connect();
  db = client.db(dbName);
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("categories").createIndex({ nameKey: 1 }, { unique: true });
  await db.collection("paymentMethods").createIndex({ name: 1 }, { unique: true });
  await db.collection("budgets").createIndex({ userId: 1, year: 1, month: 1 }, { unique: true });
  await db.collection("expenses").createIndex({ userId: 1, date: 1 });
  await db.collection("expenses").createIndex({ categoryId: 1 });
}

export async function nextId(name) {
  const updated = await db.collection("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = updated?.seq ?? updated?.value?.seq;
  if (!Number.isInteger(seq)) throw new Error(`Could not create an id for ${name}.`);
  return seq;
}

export function mapUser(doc) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

export function mapCategory(doc) {
  return {
    id: doc._id,
    name: doc.name,
    isDefault: Boolean(doc.isDefault),
  };
}

export async function hydrateExpenses(docs, withUser = false) {
  if (docs.length === 0) return [];
  const categoryIds = [...new Set(docs.map((doc) => doc.categoryId))];
  const methodIds = [...new Set(docs.map((doc) => doc.paymentMethodId))];
  const [categories, methods] = await Promise.all([
    db.collection("categories").find({ _id: { $in: categoryIds } }).toArray(),
    db.collection("paymentMethods").find({ _id: { $in: methodIds } }).toArray(),
  ]);
  const categoryNames = new Map(categories.map((row) => [row._id, row.name]));
  const methodNames = new Map(methods.map((row) => [row._id, row.name]));
  let users = new Map();
  if (withUser) {
    const userIds = [...new Set(docs.map((doc) => doc.userId))];
    const rows = await db.collection("users").find({ _id: { $in: userIds } }).toArray();
    users = new Map(rows.map((row) => [row._id, row]));
  }

  return docs.map((doc) => {
    const expense = {
      id: doc._id,
      title: doc.title,
      amount: doc.amount,
      categoryId: doc.categoryId,
      categoryName: categoryNames.get(doc.categoryId) ?? "Unknown",
      paymentMethodId: doc.paymentMethodId,
      paymentMethodName: methodNames.get(doc.paymentMethodId) ?? "Unknown",
      date: doc.date,
      notes: doc.notes,
      createdAt: doc.createdAt,
    };
    if (!withUser) return expense;
    const user = users.get(doc.userId);
    return { ...expense, userName: user?.name ?? "", userEmail: user?.email ?? "" };
  });
}
