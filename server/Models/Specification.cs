namespace server.Models
{
    // các thông số mẫu chung cho 1 category
    public class Specification: BaseModels
    {
        // tên thông số
        public string Name { get; set; } = string.Empty;

        // id của danh mục mà thông số này thuộc về
        public Guid CategoryId { get; set; }

        // thứ tự ưu tiên hiển thị
        public int DisplayOrder { get; set; }
    }
}
