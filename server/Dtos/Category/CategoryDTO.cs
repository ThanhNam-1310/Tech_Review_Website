namespace server.Dtos.Category
{
    public class CategoryDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public List<CategoryDTO> Children { get; set; } = [];
    }
}
