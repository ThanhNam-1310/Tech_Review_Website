namespace server.Common.Pagination
{
    public class PageRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }     // từ khóa tìm kiếm
        public string? SortBy { get; set; }     // Sắp xếp theo trường
        public string SortOrder { get; set; } = "desc"; // Sắp xếp theo thứ tự mặc định giảm dần (desc) hoặc tăng dần (asc)
    }
}
