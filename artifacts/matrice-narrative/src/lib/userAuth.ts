export const USER_TOKEN_KEY = "matrice_user_token";

export function getUserToken(): string | null {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token: string): void {
  localStorage.setItem(USER_TOKEN_KEY, token);
}

export function userAuthHeaders(): HeadersInit {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
