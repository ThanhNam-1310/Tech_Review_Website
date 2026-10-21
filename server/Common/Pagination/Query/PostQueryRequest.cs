namespace server.Common.Pagination.Query
{
    public class PostQueryRequest : PageRequest
    {
        // lọc bài trong N ngày gần nhất (theo CreatedAt)
        public int? Days { get; set; }

        // ?highlight=true → bài hero do admin đánh dấu (IsHightLight)
        public bool? Highlight { get; set; }

        // ?editorPick=true → bài do chuyên gia chọn
        public bool? EditorPick { get; set; }
    }
}
