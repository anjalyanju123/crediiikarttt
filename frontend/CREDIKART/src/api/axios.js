import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      const isExpired = decoded.exp < Date.now() / 1000;

      if (isExpired) {
        if (refreshToken) {
          const res = await axios.post(
            "http://127.0.0.1:8000/token/refresh/",
            {
              refresh: refreshToken,
            }
          );

          accessToken = res.data.access;
          localStorage.setItem("accessToken", accessToken);
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          // Token is expired and there's no refresh token, remove it
          localStorage.removeItem("accessToken");
        }
      } else {
        // Token is valid
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (err) {
      console.log("Token error:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  return config;
});

export default api;