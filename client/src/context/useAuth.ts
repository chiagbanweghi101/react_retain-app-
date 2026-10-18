import { useCallback, useContext } from "react";
import { ApiError, api } from "../api.ts";
import { AuthContext } from "./auth-context.ts";

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}

export function useApi() {
  const { token, signOut } = useAuth();
  return useCallback(
    async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
      try {
        return await api<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) signOut();
        throw error;
      }
    },
    [token, signOut],
  );
}
