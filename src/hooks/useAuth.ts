import { useState, useEffect, useCallback } from "react";
import {
  EsiaUser,
  fetchCurrentUser,
  getEsiaLoginUrl,
  handleEsiaCallback,
  logout as doLogout,
  getSessionToken,
  ESIA_AUTH_URL,
} from "@/lib/auth";

export type AuthState = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [user, setUser] = useState<EsiaUser | null>(null);
  const [state, setState] = useState<AuthState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSessionToken()) {
      setState("unauthenticated");
      return;
    }
    fetchCurrentUser()
      .then((u) => {
        setUser(u);
        setState(u ? "authenticated" : "unauthenticated");
      })
      .catch(() => setState("unauthenticated"));
  }, []);

  const loginWithEsia = useCallback(async () => {
    setError(null);
    if (!ESIA_AUTH_URL) {
      setError("Бэкенд ЕСИА ещё не подключён. Обратитесь к разработчику.");
      return;
    }
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { auth_url, state: esiaState } = await getEsiaLoginUrl(redirectUri);
      sessionStorage.setItem("esia_state", esiaState);
      sessionStorage.setItem("esia_redirect_uri", redirectUri);
      window.location.href = auth_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка подключения к ЕСИА");
    }
  }, []);

  const processCallback = useCallback(async (code: string, esiaState: string) => {
    setError(null);
    setState("loading");
    try {
      const redirectUri = sessionStorage.getItem("esia_redirect_uri") || `${window.location.origin}/auth/callback`;
      const u = await handleEsiaCallback(code, esiaState, redirectUri);
      setUser(u);
      setState("authenticated");
      sessionStorage.removeItem("esia_state");
      sessionStorage.removeItem("esia_redirect_uri");
      return u;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка авторизации через ЕСИА");
      setState("unauthenticated");
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await doLogout();
    setUser(null);
    setState("unauthenticated");
  }, []);

  return { user, state, error, loginWithEsia, processCallback, logout };
}