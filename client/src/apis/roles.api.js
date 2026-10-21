import api from "./api";

export const GetAllRole = () => {
    return api.get("roles/all")
}

export const SetRoleUser = (userId, roleId) => {
    return api.patch(`role/${roleId}/user/${userId}`)
}