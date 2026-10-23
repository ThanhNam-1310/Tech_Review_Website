namespace server.Dtos.Comment
{
    public class CommentSentimentStatsDTO
    {
        public int Total { get; set; }              // tổng số bình luận ĐÃ được phân loại
        public int PositiveCount { get; set; }
        public int NegativeCount { get; set; }
        public int NeutralCount { get; set; }
        public double PositivePercent { get; set; }
        public double NegativePercent { get; set; }
        public double NeutralPercent { get; set; }
    }
}
