import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api.ts";
import type { AuthResponse, User } from "../types.ts";
import { AuthContext } from "./auth-context.ts";

const TOKEN_KEY = "retain_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let active = true;
    api<User>("/api/auth/me", { token })
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const storeSession = useCallback((session: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
    setLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await api<AuthResponse>("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeSession(session);
      return session.user;
    },
    [storeSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const session = await api<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      storeSession(session);
      return session.user;
    },
    [storeSession],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [user, token, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
