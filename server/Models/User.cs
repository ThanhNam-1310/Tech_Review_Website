using Microsoft.AspNetCore.Identity;
using server.Common.Enums;

namespace server.Models
{
    public class User: IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        
        // trạng thái hoạt động của user
        public UserStatus Status { get; set; } = UserStatus.Active;
    }
}
