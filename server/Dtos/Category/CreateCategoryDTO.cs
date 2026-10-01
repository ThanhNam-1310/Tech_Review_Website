namespace server.Dtos.Category
{
    public class CreateCategoryDTO
    {
        public string Name { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
    }
}
