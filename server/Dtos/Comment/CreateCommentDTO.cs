using server.Common.Enums;

namespace server.Dtos.Comment
{
    public class CreateCommentDTO
    {
        public Guid? ParentCommentId { get; set; }
        public string CommentContent { get; set; } = string.Empty;
    }
}
