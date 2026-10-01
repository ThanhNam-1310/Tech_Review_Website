namespace server.Dtos.Products
{
    public class CreateProductDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public decimal? Price { get; set; }
        public string? ThumnailUrl { get; set; }
        public List<string> Images { get; set; } = [];
    }
}
