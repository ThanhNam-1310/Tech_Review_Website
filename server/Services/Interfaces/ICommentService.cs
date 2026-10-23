using server.Dtos.Comment;

namespace server.Services.Interfaces
{
    public interface ICommentService
    {
        // lấy tất cả bình luận của bài viết
        Task<IEnumerable<CommentDTO>> GetCommentPostAsync(Guid postId);

        // lấy tất cả bình luận của sản phẩm
        Task<IEnumerable<CommentDTO>> GetCommentProductAsync(Guid productId);

        // get detail comment
        Task<CommentDTO> GetDetailCommentAsync(Guid commentId);

        // thêm mới bình luận cho post
        Task<CommentDTO> CreateCommentPostAsync(Guid postId, CreateCommentDTO dTO);

        // thêm mới bình luận cho product
        Task<CommentDTO> CreateCommentProductAsync(Guid productId, CreateCommentDTO dTO);

        // chỉnh sửa bình luận
        Task<CommentDTO> UpdateCommentAsync(Guid commentId, UpdateCommentDTO dTO);

        // xóa bình luận
        Task<bool> DeleteCommentAsync(Guid commentId);

        // ẩn bình luận (dành cho admin)
        Task HiddenCommentAsync(Guid commentId);
        
        // hiện bình luận (dành cho admin)
        Task UnHiddenCommentAsync(Guid commentId);

        Task<CommentSentimentStatsDTO> GetProductSentimentStatsAsync(Guid productId);
    }
}
