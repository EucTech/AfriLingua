import axios, { AxiosError } from "axios";
import { useAuth } from "@/features/auth/store/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export const ASSET_URL = API_URL.replace(/\/api\/?$/, "");

export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith("/") ? `${ASSET_URL}${path}` : path;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? error.message);

    if (status === 401) {
      useAuth.getState().logout();
    }
    return Promise.reject(new ApiError(status, message));
  },
);

export const api = {
  get: <T>(path: string) => client.get<T>(path).then((res) => res.data),
  post: <T>(path: string, body?: unknown) => client.post<T>(path, body).then((res) => res.data),
  patch: <T>(path: string, body?: unknown) => client.patch<T>(path, body).then((res) => res.data),
  upload: <T>(path: string, formData: FormData) => client.post<T>(path, formData).then((res) => res.data),
  delete: <T>(path: string, body?: unknown) => client.delete<T>(path, { data: body }).then((res) => res.data),
};
