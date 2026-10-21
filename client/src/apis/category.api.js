import api from "./api";

export const GetAllCategories = () => {
    return api.get("categories/all")
}

export const GetDetailCategoryById = (id) => {
    return api.get(`categories/${id}`)
}

export const CreateNewCategory = (data) => {
    return api.post("categories/create", data)
}

export const UpdateCategoryById = (id, data) => {
    return api.put(`categories/update/${id}`, data)
}

export const DeleteCategoryById = (id) => {
    return api.delete(`categories/delete/${id}`)
}
