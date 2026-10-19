import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState, type FormEvent } from "react";
import { errorMessage } from "../api.ts";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { useApi } from "../context/useAuth.ts";
import type { AdminCategory } from "../types.ts";

export function AdminCategoriesPage() {
  const request = useApi();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const rows = await request<AdminCategory[]>("/api/admin/categories");
    setCategories(rows);
  }

  useEffect(() => {
    document.title = "Categories · Retain";
    load().catch((caught) => setError(errorMessage(caught)));
  }, [request]);

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await request("/api/admin/categories", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      setMessage("Category created.");
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function saveName(category: AdminCategory) {
    setError("");
    try {
      await request(`/api/admin/categories/${category.id}`, { method: "PUT", body: JSON.stringify({ name: editName }) });
      setEditingId(null);
      setMessage("Category renamed.");
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function removeCategory() {
    if (!pendingDelete) return;
    setError("");
    try {
      const result = await request<{ reassigned: number }>(`/api/admin/categories/${pendingDelete.id}`, { method: "DELETE" });
      setMessage(`${result.reassigned} expense${result.reassigned === 1 ? "" : "s"} moved to Uncategorized.`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <PageHeader title="Categories" subtitle="Uncategorized stays in place and receives expenses from deleted categories." />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}
      <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={1} onSubmit={createCategory}>
        <TextField label="New category" value={name} onChange={(event) => setName(event.target.value)} required sx={{ flexGrow: 1 }} />
        <Button type="submit" variant="contained">Add</Button>
      </Stack>
      {categories.map((category) => (
        <Paper key={category.id} variant="outlined" sx={{ p: 2 }}>
          {editingId === category.id ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField value={editName} onChange={(event) => setEditName(event.target.value)} sx={{ flexGrow: 1 }} />
              <Button variant="contained" onClick={() => saveName(category)}>Save</Button>
              <Button onClick={() => setEditingId(null)}>Cancel</Button>
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1 }}>
              <BoxName name={category.name} count={category.expenseCount} locked={category.isDefault} />
              {category.isDefault ? (
                <Typography variant="body2" color="text.secondary">Default category</Typography>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => { setEditingId(category.id); setEditName(category.name); }}>Rename</Button>
                  <Button color="error" onClick={() => setPendingDelete(category)}>Delete</Button>
                </Stack>
              )}
            </Stack>
          )}
        </Paper>
      ))}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete category"
        message={pendingDelete ? `Delete ${pendingDelete.name}? Its expenses move to Uncategorized.` : ""}
        onClose={() => setPendingDelete(null)}
        onConfirm={removeCategory}
      />
    </Stack>
  );
}

function BoxName({ name, count, locked }: { name: string; count: number; locked: boolean }) {
  return (
    <div>
      <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {count} expense{count === 1 ? "" : "s"}{locked ? "" : ""}
      </Typography>
    </div>
  );
}
