import api from "./api";

export const GetAllSpecification = () => {
    return api.get("specification/all")
}

export const GetAllSpecifiByCategory = (cateId) => {
    return api.get(`specification/category/${cateId}`)
}

export const CreateNewSpecification = (data) => {
    return api.post("specification/create", data)
}

export const UpdateSpecification = (id, data) => {
    return api.patch(`specification/update/${id}`, data)
}

export const DeleteSpecification = (id) => {
    return api.delete("specification/delete", {
        params: {id}
    })
}
    