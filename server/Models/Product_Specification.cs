namespace server.Models
{
    // lưu các giá trị của thông số của sp
    public class Product_Specification: BaseModels
    {
        // id của sản phẩm
        public Guid ProductId { get; set; }
        // id của thông số mẫu
        public Guid SpecificationId { get; set; }

        // giá trị của thông số mẫu
        public string Value { get; set; } = string.Empty;
    }
}
