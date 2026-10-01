namespace server.Dtos.Category
{
    public class UpdateCategoryDTO
    {
        public string Name { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public bool IsActive { get; set; }
    }
}
