using Microsoft.AspNetCore.Authorization;
using server.Services.Implements;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Common.Authorization
{
    public class PermissionHandler(IPermissionService permission) : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IPermissionService _permission = permission;

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return;

            if (!Guid.TryParse(userIdClaim.Value, out var userId))
                return;

            var hasPermission = await _permission
                .HasPermissionAsync(userId, requirement.Permission);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
