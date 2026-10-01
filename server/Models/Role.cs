using Microsoft.AspNetCore.Identity;

namespace server.Models
{
    public class Role: IdentityRole<Guid>
    {
        public string? Description { get; set; }
        public List<Guid> PermissionIds { get; set; } = [];
    }
}
