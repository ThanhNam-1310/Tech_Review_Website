using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/permission")]
    [ApiController]
    public class PermissionController(IPermissionService permission) : ControllerBase
    {
        private readonly IPermissionService _permission = permission;

        [HttpGet("role/{id:guid}")]
        public async Task<IActionResult> GetPermissionForRole(Guid id)
        {
            var result = await _permission.GetPermissionsByRoleIdAsync(id);
            return Ok(result);
        }

        [HttpGet("user/{id:guid}")]
        public async Task<IActionResult> GetPermissionForUser(Guid id)
        {
            var result = await _permission.GetPermissionByUserIdAsync(id);
            return Ok(result);
        }
    }
}
