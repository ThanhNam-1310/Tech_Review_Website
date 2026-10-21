import api from "./api";

export const GetAllPost = (params) => {
    return api.get("post/all", {params});
}

export const GetDetailPostById = (id) => {
    return api.get(`post/${id}`)
}

export const GetMyPosts = (params) => {
    return api.get("post/my", {params});
}

export const GetAllPostByCategoryId = (cateId, params) => {
    return api.get(`post/category/${cateId}`, {params})
}

export const GetAllPostByProductId = (productId) => {
    return api.get(`post/product/${productId}`)
}

export const CreateNewPost = (data) => {
    return api.post("post/create", data)
}

export const UpdatePostById = (id, data) => {
    return api.patch(`post/update/${id}`, data)
}

export const SetHeroPost = (id) => {
    return api.patch(`post/${id}/hero`)
}

export const DeletePostById = (id) => {
    return api.delete(`post/delete/${id}`)
}

// rating post
export const GetRatingViewPost = (id) => {
    return api.get(`post/${id}/view`)
}

export const ActionLikePost = (id) => {
    return api.post(`post/${id}/like`)
}

export const ActionDisLikePost = (id) => {
    return api.delete(`post/${id}/dislike`)
}

export const UploadPostThumbnail = (file, id) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`post/${id}/upload/thumbnail`, formData)
}

export const UploadPostContentImage = (file, id) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`post/${id}/upload/content-image`, formData)
}
