import api from "./api";

export async function login(data) {
    const res = api.post("auth/login", data)
     // Lưu user info (không phải token) để Header biết đã đăng nhập
    const user = res.data?.user ?? res.data?.User ?? res.data?.data?.user;
    localStorage.setItem("currentUser", JSON.stringify(user ?? {}));

    return res;
}

export async function register(data) {
    return api.post("auth/register", data)
}

export const logout = () => {
    return api.post("auth/log-out")
}

export async function refreshToken() {
    return api.post("auth/refresh-token")
}

export const getMe = async () => {
    return api.get("auth/me")
}