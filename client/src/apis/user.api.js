import { data } from "react-router-dom";
import api from "./api";

export const GetAllUserNormals = (params) => {
    return api.get("user/normal", {params})
}

export const GetAllUserExperts = (params) => {
    return api.get("user/experts", {params})
}

export const GetAllUserAdmins = (params) => {
    return api.get("user/admins", {params})
}


export const GetDetailUser = (id) => {
    return api.get(`user/${id}`)
}

export const UpdateUser = (id, data) => {
    return api.patch(`user/update/${id}`, data)
}

export const UpdateAvatarUser = (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.patch(`user/${id}/avatar`)
}

export const DeleteUser = (id) => {
    return api.delete("user/delete", {
    params: { id },
  })
}
