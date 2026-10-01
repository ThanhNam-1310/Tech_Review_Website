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
    }
}
