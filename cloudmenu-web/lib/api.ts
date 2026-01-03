// lib/api.ts
import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken, logout } from "./auth";

let printedOnce = false;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080",
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? getToken() : null;

  if (!printedOnce) {
    console.log("[API] baseURL:", config.baseURL);
    console.log("[API] token present? ", !!token, token?.slice(0, 12) + "...");
    printedOnce = true;
  }

  // Always attach Authorization when token exists
  if (token) {
    (config.headers as any) = config.headers || {};
    const h: any = config.headers;
    if (typeof h.set === "function") {
      h.set("Authorization", `Bearer ${token}`);
    } else {
      h["Authorization"] = `Bearer ${token}`;
    }
  }
  console.log(
    "[API INTERCEPTOR] Request →",
    config.method?.toUpperCase(),
    (config.baseURL || "") + (config.url || "")
  );
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      console.warn("[API] 401 Unauthorized → logging out");
      logout(); // clears token and redirects to /login
    }
    return Promise.reject(err);
  }
);
