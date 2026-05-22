import axios from "axios";
import {jwtDecode} from "jwt-decode";

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

    const decoded = jwtDecode(accessToken);
    const isExpired = decoded.exp < Date.now() / 1000;

    if (isExpired && refreshToken) {

      try {

        const { data } = await axios.post(
          `${baseURL}/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        accessToken = data.access;

        localStorage.setItem("accessToken", accessToken);

      } catch (error) {

        console.error("Token refresh failed:", error);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;