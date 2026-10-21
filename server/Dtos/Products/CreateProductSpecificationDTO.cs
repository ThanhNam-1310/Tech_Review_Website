namespace server.Dtos.Products
{
    public class CreateProductSpecificationDTO
    {
        public Guid SpecificationId { get; set; }
        public string Value { get; set; } = string.Empty;
    }
}
