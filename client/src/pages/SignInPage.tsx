import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Alert, Button, IconButton, InputAdornment, Link, Stack, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { errorMessage } from "../api.ts";
import { AuthShell } from "../components/AuthShell.tsx";
import { useAuth } from "../context/useAuth.ts";

export function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign in">
      <Stack component="form" onSubmit={onSubmit} spacing={2.25}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          placeholder="Email"
          aria-label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          autoComplete="email"
        />
        <TextField
          placeholder="Password"
          aria-label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)} edge="end">
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Link component={RouterLink} to="/signup" underline="hover" sx={{ alignSelf: "flex-end", fontSize: 14 }}>
          New here? Create an account
        </Link>
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
          {busy ? "Signing in..." : "Sign in"}
        </Button>
      </Stack>
    </AuthShell>
  );
}
