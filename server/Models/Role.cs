using Microsoft.AspNetCore.Identity;

namespace server.Models
{
    public class Role: BaseModels
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<Guid> PermissionIds { get; set; } = [];
    }
}
