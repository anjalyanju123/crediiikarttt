import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================
// REQUEST INTERCEPTOR
// ============================
api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) return config;

    try {
      const decoded = jwtDecode(accessToken);
      const isExpired = decoded.exp < Date.now() / 1000;

      // 🔥 refresh only if expired
      if (isExpired && refreshToken) {
        const res = await axios.post(
          "http://127.0.0.1:8000/token/refresh/",
          { refresh: refreshToken }
        );

        accessToken = res.data.access;
        localStorage.setItem("accessToken", accessToken);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (err) {
      console.log("Token decode/refresh error:", err);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// RESPONSE INTERCEPTOR
// ============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/token/refresh/",
          { refresh: refreshToken }
        );

        const newAccessToken = res.data.access;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token expired");

        localStorage.clear();
        window.location.href = "/";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;