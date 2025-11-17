import axios from "axios";

// dùng chung baseURL như api.js của bạn
const auth = axios.create({
  baseURL: "http://localhost:8080/api", // chỉnh nếu backend khác
  withCredentials: false,
});

export const login = (username, password) =>
  auth.post("/auth/login", { username, password });

export const register = (username, password) =>
  auth.post("/auth/register", { username, password });
