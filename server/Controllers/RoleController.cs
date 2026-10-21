using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Services.Implements;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RoleController(IRoleService roleService) : ControllerBase
    {
        private readonly IRoleService _roleService = roleService;

        [HttpGet("all")]
        public async Task<IActionResult> GetAllRole()
        {
            var result = await _roleService.GetAllRoles();
            return Ok(result);
        }

        [HttpPatch("{roleId:guid}/user/{id:guid}")]
        public async Task<IActionResult> SetRoleUser(Guid id, Guid roleId)
        {
            var result = await _roleService.SetRoleAsync(id, roleId);
            return Ok(result);
        }
    }
}
