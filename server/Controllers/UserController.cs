using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Common.Exceptions;
using server.Common.Pagination;
using server.Dtos.User;
using server.Services.Implements;
using server.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController(IUserService user) : ControllerBase
    {
        private readonly IUserService _user = user;


        [HttpGet("normal")]
        public async Task<IActionResult> GetAllUsersNormal([FromQuery] PageRequest page)
        {
            var result = await _user.GetAllUserNormalAsync(page);
            return Ok(result);
        }

        [HttpGet("experts")]
        public async Task<IActionResult> GetAllUsersExperts([FromQuery] PageRequest page)
        {
            var result = await _user.GetAllUserExpertAsync(page);
            return Ok(result);
        }

        [HttpGet("admins")]
        public async Task<IActionResult> GetAllUsersAdmins([FromQuery] PageRequest page)
        {
            var result = await _user.GetAllUserAdminlAsync(page);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetailUserById(Guid id)
        {
            var result = await _user.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPatch("{id:guid}/avatar")]
        public async Task<IActionResult> UpdateAvatar(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn ảnh đại diện." });

            var avatarUrl = await _user.UpdateAvatarAsync(id, file);

            return Ok(new
            {
                message = "Cập nhật avatar thành công.",
                avatarUrl
            });
        }

        [HttpPatch("update/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDTO dto)
        {
            var result = await _user.UpdateUserByIdAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _user.DeleteUserAsync(id);
            return Ok(result);
        }
    }
}
