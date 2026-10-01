namespace server.Dtos.Role
{
    public class RoleDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<Guid?> Permissions { get; set; } = [];
    }
}
