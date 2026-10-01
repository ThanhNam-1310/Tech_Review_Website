namespace server.Dtos.Posts
{
    public class ListPostDTO
    {
        public Guid PostId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public DateTime? PublicDate { get; set; }
    }
}
