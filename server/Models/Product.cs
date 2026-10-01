namespace server.Models
{
    public class Product: BaseModels
    {
        // tên sản phẩm
        public string Name { get; set; } = string.Empty;

        // tên thương hiệu sản phẩm
        public string Brand { get; set; } = string.Empty;

        // id của danh mục (cate) của sản phẩm
        public Guid CategoryId { get; set; }

        // mô tả của sản phẩm
        public string? Description { get; set; } 

        // giá của sản phẩm, có thể null nếu chưa có thông tin giá
        public decimal? Price { get; set; }

        // ảnh đại diện chính của sp
        public string? ThumnaiUrl { get; set; }

        // Xóa mềm
        public bool IsDeleted { get; set; } = false;

        // các ảnh của sản phẩm
        public List<string> ProductImagesUrl { get; set; } = [];

        // danh sách các thông số của sp
        public List<Product_Specification> Specifications { get; set; } = [];
    }
}
