using server.Common.Enums;

namespace server.Models
{
    public class Post: BaseModels
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty; 
        public string? ThumbnailUrl { get; set; }
        public Guid AuthorId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? ProductId { get; set; }

        // trạng thái bài viết
        public PostStatus Status { get; set; } = PostStatus.New;

        // phạm vi hiển thị
        public PostVisibility Visibility { get; set; } = PostVisibility.PostPublic;

        // các nội dung trong bài viết
        public List<PostContent> Contents { get; set; } = [];

        // ngày công khai
        public DateTime? PublicDate { get; set; }
    }
}
