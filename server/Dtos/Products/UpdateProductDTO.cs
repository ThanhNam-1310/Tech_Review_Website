namespace server.Dtos.Products
{
    public class UpdateProductDTO
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal? Price { get; set; }
        public string? ThumnailUrl { get; set; }
        public List<string>? Images { get; set; } 
        public List<Product_SpecificationDTO>? Specifications { get; set; }
    }
}
