using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.Auth;
using server.Services.Implements;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService auth) : ControllerBase
    {
        private readonly IAuthService _auth = auth;

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUser()
        {
            var result = await _auth.GetAllUserAsync();
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var loginResult = await _auth.LoginAsync(login);

            // set HttpOnly cookie
            if (!string.IsNullOrEmpty(loginResult.AccessToken))
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Expires = loginResult.AccessTokenExpireAt,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/"
                };
                Response.Cookies.Append("jwt_token", loginResult.AccessToken, cookieOptions);
            }

            if (!string.IsNullOrEmpty(loginResult.RefreshToken))
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(5),
                    Path = "/api/auth/refresh-token"
                };
            }

            return Ok(loginResult);
            //return Ok(new AuthResponseDTO
            //{
            //    AccessToken = loginResult.AccessToken,
            //    AccessTokenExpireAt = loginResult.AccessTokenExpireAt,
            //    User = loginResult.User
            //});
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var userRegister = await _auth.RegisterAsync(dto);
            return Ok(userRegister);
        }

        [HttpPost("log-out")]
        public async Task<IActionResult> LogOut([FromBody] RefreshTokenDTO dto)
        {
            await _auth.LogOutAsync(dto);
            Response.Cookies.Delete("jwt_token", new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            return NoContent();
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDTO dto)
        {
            var token = await _auth.RefreshTokenAsync(dto);
            return Ok(token);
        }
    }
}
