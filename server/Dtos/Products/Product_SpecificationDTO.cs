namespace server.Dtos.Products
{
    public class Product_SpecificationDTO
    {
        public Guid SpecificationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
