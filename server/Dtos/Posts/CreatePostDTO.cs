using server.Common.Enums;
using server.Dtos.PostContents;

namespace server.Dtos.Posts
{
    public class CreatePostDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }

        // phạm vi bài viết - mặc định công khai
        public PostVisibility Visibility { get; set; } = PostVisibility.PostPublic;
        public List<CreatePostContentDTO> Contents { get; set; } = [];
    }
}
