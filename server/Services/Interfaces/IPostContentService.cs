using server.Dtos.PostContents;

namespace server.Services.Interfaces
{
    public interface IPostContentService
    {
        // lấy tất cả nội dung của 1 bài viết theo id 
        Task<IEnumerable<PostContentDTO>> GetAllByPostIdAsync(Guid postId);

        // thêm mới một nội dung cho bài viết
        Task<PostContentDTO> CreateContentAsync(Guid postId, CreatePostContentDTO dto);

        // chỉnh sửa một nội dung bài viết
        Task<PostContentDTO> UpdateContentAsync(Guid contentId, Guid postId, UpdatePostContentDTO dTO);

        // xóa một nội dung bài viết
        Task<bool> DeleteContentAsync(Guid contentId, Guid postId);
    }
}
