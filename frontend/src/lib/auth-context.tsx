import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { TOKEN_STORAGE_KEY, login as loginRequest } from "@/services/api";
import type { AuthUser, Role } from "@/types";

export const USER_STORAGE_KEY = "nbfc_user";

// Seeded demo account credentials for hackathon demonstration.
// Clicking a demo button populates the login form fields only;
// the user MUST click "Sign In" to authenticate through the backend API.
export const DEMO_ACCOUNTS: Record<Role, { email: string; password: string; label: string; description: string }> = {
  RM: {
    email: "rm@nbfc.com",
    password: "Password@123",
    label: "Relationship Manager (RM)",
    description: "Loan origination, applicant intake & financial spreading",
  },
  L1_APPROVER: {
    email: "l1@nbfc.com",
    password: "Password@123",
    label: "L1 Credit Approver",
    description: "Reviews first-line credit exceptions & minor policy deviations",
  },
  L2_APPROVER: {
    email: "l2@nbfc.com",
    password: "Password@123",
    label: "Credit Head (L2)",
    description: "Authorizes compound deviations & high-exposure exceptions",
  },
  ADMIN: {
    email: "admin@nbfc.com",
    password: "Password@123",
    label: "System Administrator",
    description: "Manages BRMS policy rules & verifies cryptographic audit chain",
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const decodedJson = JSON.parse(atob(payloadBase64));
    if (decodedJson.exp && decodedJson.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

// Distinguishes "never logged in" from "was logged in, token is now stale" —
// RequireAuth uses this to show the same "session expired" message whether
// the token died server-side mid-session (caught by the axios interceptor)
// or was already stale/malformed the moment the app loaded (caught here).
function readStoredUser(): { user: AuthUser | null; wasExpired: boolean } {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!token || !raw) return { user: null, wasExpired: false };

  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return { user: null, wasExpired: true };
  }

  try {
    return { user: JSON.parse(raw) as AuthUser, wasExpired: false };
  } catch {
    return { user: null, wasExpired: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readStoredUser();
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [sessionExpired, setSessionExpired] = useState(initial.wasExpired);

  // Listen for storage events or global logout triggers
  useEffect(() => {
    function handleStorageChange() {
      const next = readStoredUser();
      setUser(next.user);
      if (next.wasExpired) setSessionExpired(true);
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      sessionExpired,
      async login(email: string, password: string) {
        // Authenticate strictly via backend POST /api/auth/login
        const { token, user: loggedInUser } = await loginRequest(email.trim(), password);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setSessionExpired(false);
        return loggedInUser;
      },
      logout() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
