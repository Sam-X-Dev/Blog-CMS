import type { ApiResponse } from "@/types/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[] | undefined>;

  constructor(message: string, status: number, errors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && (!init?.body || typeof init.body === "string")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.statusText || "Failed to parse response", response.status);
  }

  if (!response.ok || !json.success) {
    throw new ApiError(json.message || "Request failed", response.status, json.errors);
  }

  return json.data as T;
}
