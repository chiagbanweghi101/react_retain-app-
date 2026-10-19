import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseFilters, SortBy, SortOrder } from "../types.ts";

export const PAGE_SIZE = 8;

const initialState: ExpenseFilters = {
  search: "",
  categoryId: null,
  paymentMethodId: null,
  dateFrom: "",
  dateTo: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategoryId(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethodId(state, action: PayloadAction<number | null>) {
      state.paymentMethodId = action.payload;
      state.page = 1;
    },
    setDateFrom(state, action: PayloadAction<string>) {
      state.dateFrom = action.payload;
      state.page = 1;
    },
    setDateTo(state, action: PayloadAction<string>) {
      state.dateTo = action.payload;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortBy; sortOrder: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setCategoryId,
  setPaymentMethodId,
  setDateFrom,
  setDateTo,
  setSort,
  setPage,
  resetFilters,
} = filtersSlice.actions;

export function toExpenseQuery(filters: ExpenseFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.categoryId != null) params.set("categoryId", String(filters.categoryId));
  if (filters.paymentMethodId != null) params.set("paymentMethodId", String(filters.paymentMethodId));
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("sortBy", filters.sortBy);
  params.set("sortOrder", filters.sortOrder);
  params.set("page", String(filters.page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}

export function hasActiveFilters(filters: ExpenseFilters): boolean {
  return Boolean(
    filters.search ||
      filters.categoryId ||
      filters.paymentMethodId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.sortBy !== "date" ||
      filters.sortOrder !== "desc",
  );
}

export const filtersReducer = filtersSlice.reducer;
