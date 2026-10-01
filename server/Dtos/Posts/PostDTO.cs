using server.Dtos.PostContents;

namespace server.Dtos.Posts
{
    public class PostDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public Guid AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Visibility { get; set; } = string.Empty;
        public DateTime? PublicDate { get; set; }
        public List<PostContentDTO> Contents { get; set; } = [];
    }
}
