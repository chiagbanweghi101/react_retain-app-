import { createContext } from "react";
import type { User } from "../types.ts";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
