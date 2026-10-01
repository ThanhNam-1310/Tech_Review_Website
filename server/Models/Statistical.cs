using server.Common.Enums;

namespace server.Models
{
    public class Statistical
    {
        // id của đối tượng cần thống kê
        public Guid TargetId { get; set; }

        // loại đối tượng thống kê: Post / Product
        public TypeStatistial TypeTarget { get; set; }

        // số lượng lượt xem
        public int ViewCount { get; set; }

        // số lượng lưu lại
        public int SavedCount { get; set; }

        // số lượng comment
        public int CommentCount { get; set; }

        // số lượng yêu thích
        public int LikeCount { get; set; }

        // số lượng không yêu thích dislike
        public int DisLikeCount { get; set; }

        // số lượng chia sẻ
        public int SharedCount { get; set; }
    }
}
