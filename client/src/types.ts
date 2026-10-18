export type Role = "user" | "admin";

export type BudgetStatus = "none" | "within" | "approaching" | "over";

export type SortBy = "date" | "amount";

export type SortOrder = "asc" | "desc";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  isDefault: boolean;
}

export interface AdminCategory extends Category {
  expenseCount: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  paymentMethodId: number;
  paymentMethodName: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface AdminExpense extends Expense {
  userName: string;
  userEmail: string;
}

export interface ExpenseList {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExpensePayload {
  title: string;
  amount: number;
  categoryId: number;
  paymentMethodId: number;
  date: string;
  notes: string | null;
}

export interface Budget {
  id: number;
  year: number;
  month: number;
  amount: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  budget: Budget | null;
  totalSpent: number;
  remaining: number | null;
  status: BudgetStatus;
}

export interface CategorySpend {
  categoryId: number;
  categoryName: string;
  total: number;
  count: number;
}

export interface DashboardSummary extends MonthSummary {
  highestExpense: Expense | null;
  spendingByCategory: CategorySpend[];
  recentExpenses: Expense[];
}

export interface CategoryUsage {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategorySpend[];
  topCategories: CategoryUsage[];
  bottomCategories: CategoryUsage[];
  recentExpenses: AdminExpense[];
  recentUsers: User[];
}

export interface ExpenseFilters {
  search: string;
  categoryId: number | null;
  paymentMethodId: number | null;
  dateFrom: string;
  dateTo: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
}
