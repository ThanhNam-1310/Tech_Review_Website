namespace server.Dtos.Specification
{
    public class SpecificationUpdateDTO
    {
        public string? Name { get; set; }
        public Guid? CategoryId { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
