import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute.tsx";
import { GuestOnly } from "./components/GuestOnly.tsx";
import { Layout } from "./components/Layout.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";
import { BudgetPage } from "./pages/BudgetPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ExpenseDetailPage } from "./pages/ExpenseDetailPage.tsx";
import { ExpenseFormPage } from "./pages/ExpenseFormPage.tsx";
import { ExpensesPage } from "./pages/ExpensesPage.tsx";
import { SignInPage } from "./pages/SignInPage.tsx";
import { SignUpPage } from "./pages/SignUpPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/new" element={<ExpenseFormPage mode="create" />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/expenses/:id/edit" element={<ExpenseFormPage mode="edit" />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
