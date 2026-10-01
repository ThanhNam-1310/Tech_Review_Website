using server.Common.Enums;

namespace server.Models
{
    public class Comment: BaseModels
    {
        public Guid TargetId { get; set; }

        // loại đối tượng: post / product
        public TargetType TargetType { get; set; }

        // id của người dùng comment
        public Guid UserId { get; set; }

        // id của comment cha
        public Guid? ParentCommentId { get; set; }

        // nội dung comment
        public string CommentContent { get; set; } = string.Empty;

        // trạng thái ẩn của comment
        public bool IsHidden { get; set; } = false;
    }
}
