namespace server.Dtos.Products
{
    public class ListProductDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public decimal? Price { get; set; }
        public string? ThumnailUrl { get; set; }
    }
}
