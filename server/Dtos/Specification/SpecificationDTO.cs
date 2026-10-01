namespace server.Dtos.Specification
{
    public class SpecificationDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string? Name { get; set; }
        public int DisplayOrder { get; set; }
    }
}
