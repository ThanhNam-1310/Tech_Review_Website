using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Common.Exceptions;
using server.Dtos.Auth;
using server.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService auth, IUserService user) : ControllerBase
    {
        private readonly IAuthService _auth = auth;
        private readonly IUserService _user = user;

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUser()
        {
            var result = await _auth.GetAllUserAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMeUser()
        {
            var user = await _user.GetUserByIdAsync(GetCurrentUserId());
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var loginResult = await _auth.LoginAsync(login);

            SetAuthCookies(loginResult);

            return Ok(loginResult);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var userRegister = await _auth.RegisterAsync(dto);
            return Ok(userRegister);
        }

        [HttpPost("log-out")]
        public async Task<IActionResult> LogOut()
        {
            // refresh token lấy từ cookie, không lấy từ body nữa
            var refreshToken = Request.Cookies["refresh_token"];
            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                await _auth.LogOutAsync(new RefreshTokenDTO { RefreshToken = refreshToken });
            }

            Response.Cookies.Delete("jwt_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            Response.Cookies.Delete("refresh_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/api/auth"
            });
            return NoContent();
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            // refresh token lấy từ cookie, không lấy từ body nữa
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrWhiteSpace(refreshToken))
                return Unauthorized();

            var result = await _auth.RefreshTokenAsync(new RefreshTokenDTO { RefreshToken = refreshToken });

            // set lại cả 2 cookie bằng token mới
            SetAuthCookies(result);

            return Ok(result);
        }

        // Set access token + refresh token vào HttpOnly cookie
        private void SetAuthCookies(AuthResponseDTO result)
        {
            if (!string.IsNullOrEmpty(result.AccessToken))
            {
                Response.Cookies.Append("jwt_token", result.AccessToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = result.AccessTokenExpireAt,
                    Path = "/"
                });
            }

            if (!string.IsNullOrEmpty(result.RefreshToken))
            {
                Response.Cookies.Append("refresh_token", result.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(5),
                    // Path bao cả refresh-token và log-out để trình duyệt gửi kèm tới 2 endpoint này
                    Path = "/api/auth"
                });
            }
        }

        // Lấy id của user đang đăng nhập từ JWT (trong cookie jwt_token)
        private Guid GetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            return Guid.TryParse(raw, out var id)
                ? id
                : throw new BadRequestException("Token không hợp lệ.");
        }
    }
}
