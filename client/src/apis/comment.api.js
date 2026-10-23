import api from "./api";

export const GetAllCommentPost = (postId) => {
    return api.get(`comment/post/${postId}`)
}

export const GetAllCommentProduct = (prodId) => {
    return api.get(`comment/product/${prodId}`)
}

export const AddNewCommentForPost = (postId, comment) => {
    return api.post(`comment/add/post/${postId}`, comment)
}

export const AddNewCommentForProduct = (prodId, comment) => {
    return api.post(`comment/add/product/${prodId}`, comment)
}

export const UpdateCommentById = (id, comment) => {
    return api.patch(`comment/update/${id}`, comment)
}

export const DeleteCommentById = (id) => {
    return api.delete(`comment/delete/${id}`)
}

export const GetProductSentimentStats = async (productId) => {
  const response = await api.get(`comment/product/${productId}/sentiment-stats`);
  return response.data;
};