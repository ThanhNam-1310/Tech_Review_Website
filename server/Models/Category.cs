namespace server.Models
{
    public class Category: BaseModels
    {
        // tên của danh mục 
        public string NameCategory { get; set; } = string.Empty;
        
        // id của danh mục cha
        // null nếu đây là danh mục cấp cao nhất
        public Guid? ParentId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
