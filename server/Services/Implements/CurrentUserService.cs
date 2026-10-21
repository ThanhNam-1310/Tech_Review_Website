using server.Common.Constants;
using server.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Services.Implements
{
    public class CurrentUserService(IHttpContextAccessor accessor) : ICurrentUserService
    {
        private ClaimsPrincipal? User => accessor.HttpContext?.User;
        public Guid UserId
        {
            get
            {
                var raw = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User?.FindFirstValue(JwtRegisteredClaimNames.Sub);
                return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
            }
        }

        public bool IsAdmin => User?.IsInRole(RoleConstants.Admin) ?? false;

        public bool IsAuthen => User?.Identity?.IsAuthenticated ?? false;

        public bool HasPermission(string permission) => User?.FindAll("permission").Any(c => c.Value == permission) ?? false;
    }
}
