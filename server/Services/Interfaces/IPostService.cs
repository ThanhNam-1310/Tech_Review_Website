using server.Dtos.Posts;

namespace server.Services.Interfaces
{
    public interface IPostService
    {
        // danh sách tất cả các  bài viết
        Task<IEnumerable<ListPostDTO>> GetAllPostAsync();

        // get detail bài viết theo id
        Task<PostDTO> GetDetailPostById(Guid id);

        // get danh sách bài viết theo id danh mục
        Task<IEnumerable<ListPostDTO>> GetPostByCategoryIdAsync(Guid categoryId);

        // get danh sách bài viết theo id sản phẩm
        Task<IEnumerable<ListPostDTO>> GetPostByProductId(Guid productId);

        // tạo mới bài viết
        Task<PostDTO> CreatePostAsync(CreatePostDTO dto);

        // chỉnh sửa bài viết
        Task<PostDTO> UpdatePostAsync(Guid postId, UpdatePostDTO dto);

        // xóa bài viết
        Task<bool> DeletePostAsync(Guid postId);

        // phê duyệt bài viết (dành cho admin)
        Task ApprovePostAsync(Guid postId);

        // từ chối bài viết (dành cho admin)
        Task RejectPostAsync(Guid postId);
    }
}
