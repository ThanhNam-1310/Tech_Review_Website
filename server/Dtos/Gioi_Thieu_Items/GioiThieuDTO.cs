namespace server.Dtos.Gioi_Thieu_Items
{
    public class GioiThieuDTO
    {
        public string ItemType { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public int Limit { get; set; } = 10;
    }
}
