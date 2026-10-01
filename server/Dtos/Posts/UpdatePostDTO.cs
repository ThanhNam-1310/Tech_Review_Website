using server.Common.Enums;

namespace server.Dtos.Posts
{
    public class UpdatePostDTO
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }

        // phạm vi bài viết - mặc định công khai
        public PostVisibility? Visibility { get; set; }
    }
}
