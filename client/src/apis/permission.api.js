import api from "./api";

export const GetPermissionForRole = (id) => {
    return api.get(`permission/role/${id}`)
}

export const GetPermissionForUser = (id) => {
    return api.get(`permission/user/${id}`)
}