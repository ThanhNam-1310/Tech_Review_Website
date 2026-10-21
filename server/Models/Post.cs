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

        // phân biệt chữ có dấu cho search
        public string SearchText { get; set; } = string.Empty;

        // phạm vi hiển thị
        public PostVisibility Visibility { get; set; } = PostVisibility.PostPublic;

        // đánh dấu là nổi bật
        public bool IsHightLight { get; set; } = false;

        // đánh dấu là chuyên gia lựa chọn
        public bool IsEditorPick { get; set; } = false;

        // các nội dung trong bài viết
        public List<PostContent> Contents { get; set; } = [];

        // rating
        public Rating Rating { get; set; } = new Rating();

        // ngày công khai
        public DateTime? PublicDate { get; set; }
    }
}
