using server.Common.Enums;

namespace server.Models
{
    public class Rating
    {

        // số lượng lượt xem
        public int ViewCount { get; set; }

        // số lượng comment
        public int CommentCount { get; set; }

        // số lượng yêu thích
        public int LikeCount { get; set; }
    }
}
