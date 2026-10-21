using server.Common.Enums;

namespace server.Dtos.Posts
{
    public class ListPostDTO
    {
        public Guid PostId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public DateTime? PublicDate { get; set; }
        public PostVisibility Visibility { get; set; }
        public bool IsHightLight { get; set; } = false;
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
    }
}
