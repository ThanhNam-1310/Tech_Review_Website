import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
})


// Xử lý refresh-token
api.interceptors.response.use(res => res, async err => {
    const original = err.config;

    const publicAuthPaths = [
      "auth/login",
      "auth/register",
    ]
    const isPublicAuthRequest = publicAuthPaths.some(path => original.url?.includes(path))
    if (isPublicAuthRequest) {
      return Promise.reject(err); // để component xử lý lỗi bình thường
    }

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/refresh-token")
    ) {
      original._retry = true;
      try {
        await api.post("/auth/refresh-token");
        return api(original);
      } catch(refreshErr) {
        const isMeRequest = error.config?.url?.includes("auth/me");
        if (!isMeRequest && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err);
})

export default api;