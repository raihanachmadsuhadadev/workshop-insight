import axios from "axios";

export const TOKEN_KEY = "star_motor_token";
export const USER_KEY = "star_motor_user";

export type UserRole = "admin" | "owner";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthToken(null);
    }

    return Promise.reject(error);
  },
);
