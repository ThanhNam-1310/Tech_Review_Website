import api from "./api";

export const GetAllProduct = () => {
    return api.get("product/all")
}

export const GetAllProductOfCategory = (cateId) => {
    return api.get(`product/category/${cateId}`)
}

export const GetDetailProductById = (id) => {
    return api.get(`product/${id}`)
}

export const GetMyProducts = (params) => {
    return api.get("product/my", {params})
}

export const CreateNewProduct = (data) => {
    return api.post("product/create", data)
}

export const UpdateProductById = (id, data) => {
    return api.patch(`product/update/${id}`, data)
}

export const SoftDeleteProduct = (id) => {
    return api.patch(`product/soft-delete/${id}`)
}

export const RestoreSoftDelProduct = (id) => {
    return api.patch(`product/${id}/restore`)
}

export const DeleteProductById = (id) => {
    return api.delete("product/delete", { params: { id } })
}

// rating product
export const ActionLikeProduct = (id) => {
    return api.post(`product/${id}/like`)
}

export const ActionDisLikeProduct = (id) => {
    return api.delete(`product/${id}/dislike`)
}

export const UploadThumbnailProduct = (file, id) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`product/${id}/upload/thumbnail`, formData)
}

export const UploadProductImages = (file, id) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`product/${id}/upload/image`, formData)
}
