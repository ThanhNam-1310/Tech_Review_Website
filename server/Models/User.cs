using Microsoft.AspNetCore.Identity;
using server.Common.Enums;

namespace server.Models
{
    public class User: BaseModels
    {
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        
        // trạng thái hoạt động của user
        public UserStatus Status { get; set; } = UserStatus.Active;
        public Guid RoleId { get; set; }
    }
}
