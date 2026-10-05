using server.Common.Enums;

namespace server.Models
{
    public class Rating
    {

        // số lượng lượt xem
        public int ViewCount { get; set; }

        // số lượng lưu lại
        public int SavedCount { get; set; }

        // số lượng comment
        public int CommentCount { get; set; }

        // số lượng yêu thích
        public int LikeCount { get; set; }

        // số lượng chia sẻ
        public int SharedCount { get; set; }
    }
}
