namespace server.Dtos.Gioi_Thieu_Items
{
    public class GioiThieu_ItemDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
