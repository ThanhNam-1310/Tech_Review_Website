namespace server.Dtos.Specification
{
    public class SpecificationCreateDTO
    {
        public string Name { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public int DisplayOrder { get; set; }
    }
}
