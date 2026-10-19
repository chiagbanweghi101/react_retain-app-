import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { errorMessage } from "../api.ts";
import { AuthShell } from "../components/AuthShell.tsx";
import { useAuth } from "../context/useAuth.ts";

export function SignUpPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signUp(name, email, password);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create account">
      <Stack component="form" onSubmit={onSubmit} spacing={2.25}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField placeholder="Name" aria-label="Name" value={name} onChange={(event) => setName(event.target.value)} required fullWidth />
        <TextField placeholder="Email" aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth />
        <TextField
          placeholder="Password"
          aria-label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          helperText="At least 6 characters. New accounts are always normal users."
        />
        <Typography variant="body2" sx={{ textAlign: "right" }}>
          Already have an account? <RouterLink to="/signin">Sign in</RouterLink>
        </Typography>
        <Button
          type="submit"
          variant="contained"
          disabled={busy}
          sx={{
            alignSelf: "flex-start",
            px: 4.5,
            py: 1.1,
            borderRadius: 999,
            bgcolor: "#8BC34A",
            color: "#FFFFFF",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { bgcolor: "#7CB342", boxShadow: "none" },
          }}
        >
          {busy ? "Creating..." : "Create account"}
        </Button>
      </Stack>
    </AuthShell>
  );
}
