// ЕСИА OAuth — клиентская часть
// После деплоя бэкенда замените ESIA_AUTH_URL на реальный URL из func2url.json

export const ESIA_AUTH_URL = import.meta.env.VITE_ESIA_AUTH_URL || "";

export interface EsiaUser {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  verified: boolean;
  member_since: number | null;
}

const SESSION_KEY = "sm_session_token";

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Получить URL для редиректа на Госуслуги
export async function getEsiaLoginUrl(redirectUri: string): Promise<{ auth_url: string; state: string }> {
  const url = `${ESIA_AUTH_URL}/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Ошибка получения URL ЕСИА");
  }
  return res.json();
}

// Обменять code на сессию (вызывается на странице /auth/callback)
export async function handleEsiaCallback(
  code: string,
  state: string,
  redirectUri: string
): Promise<EsiaUser> {
  const res = await fetch(`${ESIA_AUTH_URL}/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка авторизации");
  setSessionToken(data.session_token);
  return data.user;
}

// Получить данные текущего пользователя
export async function fetchCurrentUser(): Promise<EsiaUser | null> {
  const token = getSessionToken();
  if (!token) return null;
  const res = await fetch(`${ESIA_AUTH_URL}/me`, {
    headers: { "X-Session-Token": token },
  });
  if (res.status === 401) {
    clearSessionToken();
    return null;
  }
  const data = await res.json();
  return data.user || null;
}

// Выйти
export async function logout(): Promise<void> {
  const token = getSessionToken();
  if (token) {
    await fetch(`${ESIA_AUTH_URL}/logout`, {
      method: "POST",
      headers: { "X-Session-Token": token },
    }).catch(() => {});
  }
  clearSessionToken();
}
