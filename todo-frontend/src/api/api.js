import axios from "axios";

export const api = axios.create({
  baseURL: "/api",           // trỏ về backend /api
  withCredentials: false,    // đang dùng JWT trong header, không dùng cookie
});

// Tự động gắn Authorization nếu có token
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
