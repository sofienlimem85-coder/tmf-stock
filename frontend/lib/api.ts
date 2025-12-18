export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("tmf_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore JSON parse errors for empty responses
  }

  if (!response.ok) {
    const message = data?.message || `API error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}


