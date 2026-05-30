import { userAuthHeaders } from "@/lib/userAuth";

function redirectPathFor(status: number): string | null {
  if (status === 401) return "/auth-required";
  if (status === 403) return "/forbidden";
  return null;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  new Headers(userAuthHeaders()).forEach((value, key) => headers.set(key, value));

  const response = await fetch(input, { ...init, headers });
  if (response.status === 402 && typeof window !== "undefined") {
    const payload = await response.clone().json().catch(() => null);
    if (payload?.error === "INSUFFICIENT_CREDITS") {
      window.dispatchEvent(new CustomEvent("matrice:insufficient-credits", { detail: payload }));
      return response;
    }
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.assign(`/upgrade?next=${next}`);
    return response;
  }

  const redirectPath = redirectPathFor(response.status);
  if (redirectPath && typeof window !== "undefined") {
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.assign(`${redirectPath}?next=${next}`);
  }
  return response;
}
