import bcrypt from "bcryptjs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { client, db, initDb, nextId } from "./db.js";
import { roundMoney } from "./utils.js";

const CATEGORIES = [
  { name: "Uncategorized", isDefault: true },
  { name: "Accommodation", isDefault: false },
  { name: "Education", isDefault: false },
  { name: "Entertainment", isDefault: false },
  { name: "Food", isDefault: false },
  { name: "Gifts", isDefault: false },
  { name: "Health", isDefault: false },
  { name: "Subscriptions", isDefault: false },
  { name: "Transport", isDefault: false },
  { name: "Utilities", isDefault: false },
];

const PAYMENT_METHODS = ["Bank Transfer", "Card", "Cash", "Mobile Money"];

const TEMPLATES = [
  { title: "Monthly rent", category: "Accommodation", method: "Bank Transfer", amount: 4500, day: 1, months: [0, 1, 2], notes: "Paid for the month" },
  { title: "Grocery run", category: "Food", method: "Card", amount: 685.4, day: 3, months: [0, 1, 2], notes: "Weekend shop" },
  { title: "Weekday lunch", category: "Food", method: "Cash", amount: 95, day: 6, months: [0, 1, 2], notes: null },
  { title: "Taxi to campus", category: "Transport", method: "Cash", amount: 48, day: 4, months: [0, 1, 2], notes: null },
  { title: "Bus pass", category: "Transport", method: "Mobile Money", amount: 220, day: 2, months: [0, 1, 2], notes: null },
  { title: "Fuel top-up", category: "Transport", method: "Card", amount: 350, day: 18, months: [0, 1], notes: null },
  { title: "Netflix", category: "Subscriptions", method: "Card", amount: 169, day: 8, months: [0, 1, 2], notes: "Shared plan" },
  { title: "Mobile data", category: "Subscriptions", method: "Mobile Money", amount: 299, day: 5, months: [0, 1, 2], notes: null },
  { title: "Electricity", category: "Utilities", method: "Bank Transfer", amount: 740, day: 12, months: [0, 1, 2], notes: null },
  { title: "Pharmacy", category: "Health", method: "Cash", amount: 186.5, day: 15, months: [0, 1, 2], notes: null },
  { title: "Cinema tickets", category: "Entertainment", method: "Card", amount: 140, day: 20, months: [0, 1, 2], notes: null },
  { title: "Coffee with friends", category: "Food", method: "Cash", amount: 75, day: 22, months: [0, 2], notes: null },
  { title: "Hardware store", category: "Uncategorized", method: "Cash", amount: 210, day: 11, months: [0], notes: "Not sure which category yet" },
  { title: "Clinic visit", category: "Health", method: "Card", amount: 420, day: 25, months: [1], notes: null },
  { title: "Takeaway dinner", category: "Food", method: "Mobile Money", amount: 160, day: 27, months: [0, 1, 2], notes: null },
  { title: "Ride home", category: "Transport", method: "Mobile Money", amount: 62, day: 9, months: [0, 1, 2], notes: null },
];

const PEOPLE = [
  {
    name: "Emmanuel",
    email: "emmanuel@example.com",
    daysAgo: 1,
    mode: "approaching",
    expenses: [
      { title: "Monthly rent", category: "Accommodation", method: "Bank Transfer", amount: 3200, day: 1, months: [0, 1], notes: "Paid for the month" },
      { title: "Grocery run", category: "Food", method: "Card", amount: 540, day: 4, months: [0, 1], notes: null },
      { title: "Taxi to campus", category: "Transport", method: "Cash", amount: 80, day: 7, months: [0, 1], notes: null },
      { title: "Electricity", category: "Utilities", method: "Bank Transfer", amount: 410, day: 12, months: [0, 1], notes: null },
      { title: "Netflix", category: "Subscriptions", method: "Card", amount: 169, day: 8, months: [0], notes: "Shared plan" },
    ],
  },
  {
    name: "Moses",
    email: "moses@example.com",
    daysAgo: 2,
    mode: "over",
    expenses: [
      { title: "Room rent", category: "Accommodation", method: "Bank Transfer", amount: 2800, day: 2, months: [0, 1], notes: null },
      { title: "Weekend groceries", category: "Food", method: "Card", amount: 720, day: 6, months: [0, 1], notes: null },
      { title: "Fuel top-up", category: "Transport", method: "Card", amount: 450, day: 14, months: [0, 1], notes: null },
      { title: "Pharmacy", category: "Health", method: "Cash", amount: 230, day: 16, months: [0], notes: null },
      { title: "Takeaway dinner", category: "Food", method: "Mobile Money", amount: 185, day: 18, months: [0, 1], notes: null },
    ],
  },
  {
    name: "Perlin",
    email: "perlin@example.com",
    daysAgo: 3,
    mode: "within",
    expenses: [
      { title: "Studio rent", category: "Accommodation", method: "Bank Transfer", amount: 2500, day: 1, months: [0, 1], notes: null },
      { title: "Lunch", category: "Food", method: "Cash", amount: 120, day: 5, months: [0, 1], notes: null },
      { title: "Bus pass", category: "Transport", method: "Mobile Money", amount: 220, day: 3, months: [0, 1], notes: null },
      { title: "Mobile data", category: "Subscriptions", method: "Mobile Money", amount: 299, day: 9, months: [0], notes: null },
      { title: "Cinema tickets", category: "Entertainment", method: "Card", amount: 160, day: 15, months: [0, 1], notes: null },
    ],
  },
  {
    name: "Chiagoziem",
    email: "chiagoziem@example.com",
    daysAgo: 5,
    mode: "approaching",
    expenses: [
      { title: "Monthly rent", category: "Accommodation", method: "Bank Transfer", amount: 3600, day: 1, months: [0, 1], notes: null },
      { title: "Grocery run", category: "Food", method: "Card", amount: 610, day: 8, months: [0, 1], notes: null },
      { title: "Ride home", category: "Transport", method: "Mobile Money", amount: 90, day: 11, months: [0], notes: null },
      { title: "Electricity", category: "Utilities", method: "Bank Transfer", amount: 530, day: 13, months: [0, 1], notes: null },
      { title: "Clinic visit", category: "Health", method: "Card", amount: 380, day: 17, months: [1], notes: null },
    ],
  },
  {
    name: "Peter",
    email: "peter@example.com",
    daysAgo: 7,
    mode: "within",
    expenses: [
      { title: "Flat rent", category: "Accommodation", method: "Bank Transfer", amount: 2100, day: 2, months: [0, 1], notes: null },
      { title: "Coffee with friends", category: "Food", method: "Cash", amount: 85, day: 10, months: [0, 1], notes: null },
      { title: "Taxi to campus", category: "Transport", method: "Cash", amount: 55, day: 6, months: [0], notes: null },
      { title: "Mobile data", category: "Subscriptions", method: "Mobile Money", amount: 199, day: 7, months: [0, 1], notes: null },
      { title: "Hardware store", category: "Uncategorized", method: "Cash", amount: 140, day: 12, months: [0], notes: "Not sure which category yet" },
    ],
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function stamp(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return stamp(date);
}

function shiftMonth(year, month, back) {
  const date = new Date(year, month - 1 - back, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function isoDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function budgetAmount(spent, mode) {
  if (mode === "approaching") return roundMoney(spent / 0.84);
  if (mode === "over") return roundMoney(spent * 0.72);
  return roundMoney(spent * 1.45);
}

async function spentInMonth(userId, year, month) {
  const monthText = pad(month);
  const [row] = await db
    .collection("expenses")
    .aggregate([
      { $match: { userId, date: { $gte: `${year}-${monthText}-01`, $lte: `${year}-${monthText}-31` } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    .toArray();
  return row?.total ?? 0;
}

async function addExpenses(userId, templates, categoryIds, methodIds, bump) {
  const now = new Date();
  let sequence = 0;
  for (const template of templates) {
    for (const monthsBack of template.months) {
      const period = shiftMonth(now.getFullYear(), now.getMonth() + 1, monthsBack);
      const date = isoDate(period.year, period.month, template.day);
      const hour = pad(8 + (sequence % 10));
      await db.collection("expenses").insertOne({
        _id: await nextId("expenses"),
        userId,
        title: template.title,
        amount: roundMoney(template.amount + monthsBack * bump),
        categoryId: categoryIds.get(template.category),
        paymentMethodId: methodIds.get(template.method),
        date,
        notes: template.notes,
        createdAt: `${date} ${hour}:20:00`,
      });
      sequence += 1;
    }
  }
}

async function addBudgets(userId, modes) {
  const now = new Date();
  for (const item of modes) {
    const period = shiftMonth(now.getFullYear(), now.getMonth() + 1, item.back);
    const spent = await spentInMonth(userId, period.year, period.month);
    if (spent <= 0) continue;
    await db.collection("budgets").insertOne({
      _id: await nextId("budgets"),
      userId,
      year: period.year,
      month: period.month,
      amount: budgetAmount(spent, item.mode),
    });
  }
}

async function insertSeedData() {
  const demoHash = await bcrypt.hash("Demo123!", 10);
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const extraHash = await bcrypt.hash("User123!", 10);

  const demoId = await nextId("users");
  await db.collection("users").insertOne({
    _id: demoId,
    name: "Demo User",
    email: "demo@retain.app",
    passwordHash: demoHash,
    role: "user",
    createdAt: daysAgo(20),
  });
  await db.collection("users").insertOne({
    _id: await nextId("users"),
    name: "Retain Admin",
    email: "admin@retain.app",
    passwordHash: adminHash,
    role: "admin",
    createdAt: daysAgo(40),
  });

  const peopleIds = new Map();
  for (const person of PEOPLE) {
    const id = await nextId("users");
    peopleIds.set(person.email, id);
    await db.collection("users").insertOne({
      _id: id,
      name: person.name,
      email: person.email,
      passwordHash: extraHash,
      role: "user",
      createdAt: daysAgo(person.daysAgo),
    });
  }

  const categoryIds = new Map();
  for (const category of CATEGORIES) {
    const id = await nextId("categories");
    categoryIds.set(category.name, id);
    await db.collection("categories").insertOne({
      _id: id,
      name: category.name,
      nameKey: category.name.toLowerCase(),
      isDefault: category.isDefault,
    });
  }

  const methodIds = new Map();
  for (const name of PAYMENT_METHODS) {
    const id = await nextId("paymentMethods");
    methodIds.set(name, id);
    await db.collection("paymentMethods").insertOne({ _id: id, name });
  }

  await addExpenses(demoId, TEMPLATES, categoryIds, methodIds, 12);
  await addBudgets(demoId, [
    { back: 0, mode: "approaching" },
    { back: 1, mode: "over" },
    { back: 2, mode: "within" },
  ]);

  for (const person of PEOPLE) {
    const userId = peopleIds.get(person.email);
    await addExpenses(userId, person.expenses, categoryIds, methodIds, 15);
    await addBudgets(userId, [
      { back: 0, mode: person.mode },
      { back: 1, mode: "within" },
    ]);
  }
}

export async function seedIfEmpty() {
  const count = await db.collection("users").countDocuments();
  if (count > 0) {
    console.log("MongoDB ready. Database: retain");
    return;
  }
  await insertSeedData();
  printAccounts("Seeded Retain in MongoDB.");
}

export async function resetAndSeed() {
  await db.collection("expenses").deleteMany({});
  await db.collection("budgets").deleteMany({});
  await db.collection("users").deleteMany({});
  await db.collection("categories").deleteMany({});
  await db.collection("paymentMethods").deleteMany({});
  await db.collection("counters").deleteMany({});
  await insertSeedData();
}

function printAccounts(heading) {
  console.log(heading);
  console.log("User   demo@retain.app        Demo123!");
  console.log("Admin  admin@retain.app       Admin123!");
  console.log("People emmanuel@example.com   User123!");
  console.log("       moses@example.com      User123!");
  console.log("       perlin@example.com     User123!");
  console.log("       chiagoziem@example.com User123!");
  console.log("       peter@example.com      User123!");
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isDirectRun()) {
  try {
    await initDb();
    await resetAndSeed();
    printAccounts("MongoDB reset and seeded.");
    await client.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
