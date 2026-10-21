using Microsoft.AspNetCore.Authorization;

namespace server.Common.Authorization
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; } = default!;

        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }
}
