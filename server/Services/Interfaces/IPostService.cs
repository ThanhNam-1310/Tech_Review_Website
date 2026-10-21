using server.Common.Pagination;
using server.Common.Pagination.Query;
using server.Dtos.Posts;

namespace server.Services.Interfaces
{
    public interface IPostService
    {
        // Danh sách tất cả bài viết
        Task<PageResult<ListPostDTO>> GetAllPostAsync(PostQueryRequest request);

        // Chi tiết bài viết
        Task<PostDTO> GetDetailPostById(Guid id);

        // Danh sách bài viết theo danh mục
        Task<PageResult<ListPostDTO>> GetPostByCategoryIdAsync(
            Guid categoryId, PageRequest request);

        // Danh sách bài viết theo sản phẩm
        Task<PageResult<ListPostDTO>> GetPostByProductIdAsync(
            Guid productId, PageRequest request);

        // danh sách bài viết theo id người dùng
        Task<PageResult<ListPostDTO>> GetPostByAuthorIdAsync(Guid authorId, PageRequest request);

        // Tạo bài viết
        Task<PostDTO> CreatePostAsync(CreatePostDTO dto);

        // Cập nhật bài viết
        Task<PostDTO> UpdatePostAsync(Guid postId, UpdatePostDTO dto);

        // upload ảnh đại diện cho post
        Task<string> UploadPostThumbnailAsync(IFormFile file, Guid postId);

        // upload ảnh cho nội dung bài post
        Task<string> UploadPostContentImageAsync(IFormFile file, Guid postId);

        // Xóa bài viết
        Task<bool> DeletePostAsync(Guid postId);

        // Đặt bài viết làm chủ đề 
        Task<PostDTO> SetHeroPostAsync(Guid postId);

        // Rating
        Task IncreaseViewCountAsync(Guid postId);
        Task TangLikeCountAsync(Guid postId);
        Task GiamLikeCountAsync(Guid postId);
        Task IncreaseSharedCountAsync(Guid postId);
        Task TangCommentAsync(Guid postId);
        Task GiamCommentAsync(Guid postId);
    }
}