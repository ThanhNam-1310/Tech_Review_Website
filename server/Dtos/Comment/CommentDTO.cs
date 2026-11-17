namespace server.Dtos.Comment
{
    public class CommentDTO
    {
        public Guid Id { get; set; }
        public Guid TargetId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserAvatarUrl { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
        public string? RoleName { get; set; }
        public int LikeCount { get; set; }
        public bool IsLiked { get; set; }
        public string CommentContent { get; set; } = string.Empty;
        public string? SentimentLabel { get; set; }
        public bool IsHidden { get; set; }
        public DateTime CreatedAt { get; set; }
        // comment con
        public List<CommentDTO> Replies { get; set; } = [];
    }
}
