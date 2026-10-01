using AutoMapper;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;
using server.Common.Enums;
using server.Data;
using server.Dtos.Auth;
using server.Models;
using server.Services.Interfaces;
using server.Common.Exceptions;
using server.Common.Constants;

namespace server.Services.Implements
{
    public class AuthService(MongoDbContext context, ILogger<AuthService> logger, IConfiguration configuration,
        IMapper mapper, ITokenService token, IPasswordHasher<User> passCheck, IRoleService roleService): IAuthService
    {
        private readonly ILogger<AuthService> _logger = logger;
        private readonly IConfiguration _configuration = configuration;
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ITokenService _token = token;
        private readonly IPasswordHasher<User> _passCheck = passCheck;
        private readonly IRoleService _roleService = roleService;

        // get all user
        public async Task<IEnumerable<UserInfo>> GetAllUserAsync()
        {
            var users = await _context.Users.Find(_=>true).ToListAsync();
            var roles = await _context.Roles.Find(_=>true).ToListAsync();

            return users.Select(user =>
            {
                var result = _mapper.Map<UserInfo>(user);
                result.RoleName = roles
                    .FirstOrDefault(r => r.Id == user.RoleId)?.Name ?? string.Empty;

                return result;
            });
        }

        // login
        public async Task<AuthResponseDTO> LoginAsync(LoginDTO login)
        {
            var value = login.UserName.Trim().ToUpperInvariant();

            var user = await _context.Users.Find(u => u.UserName.ToUpper() == value).FirstOrDefaultAsync();
            if (user == null)
            {
                _logger.LogError("FAILD: Login with username: {name}", login.UserName);
                throw new UnauthorizedAccessException("Username or password is incorrect.");
            }

            // kiểm tra user có hoạt động không
            if (user.Status != UserStatus.Active)
            {
                _logger.LogError("WARNING: Login faild, account is not active");
                throw new UnauthorizedAccessException("User account is not active.");
            }

            // kiểm tra password
            var passwordCheck = _passCheck.VerifyHashedPassword(user, user.PasswordHash ?? string.Empty, login.Password);
            if (passwordCheck == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Username or password is incorrect.");
            }

            // lấy role
            var role = await _context.Roles.Find(r => r.Id == user.RoleId).FirstOrDefaultAsync();
            if (role == null)
            {
                _logger.LogError("FAILD: Get role user");
                throw new NotFoundExcception("User role not found");
            }

            // tạo access token
            var accessToken = _token.GenerateAccessToken(user, role);

            // tạo refresh token
            var refreshToken = _token.GenerateRefreshToken();

            // lưu token
            await _token.SaveRefreshTokenAsync(user.Id, refreshToken);

            var userInfo = _mapper.Map<UserInfo>(user);
            userInfo.RoleName = role.Name;

            return new AuthResponseDTO
            {
                AccessToken = accessToken,
                AccessTokenExpireAt = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JWT:ExpiryMinutes"]!)),
                RefreshToken = refreshToken,
                User = userInfo
            };
        }

        // đăng xuất
        public async Task LogOutAsync(RefreshTokenDTO token)
        {
            var refreshToken = await _token.ValidateRefreshTokenAsync(token.RefreshToken);

            // token không tồn tại hoặc đã hết hạn thì coi như logout rồi
            if (refreshToken == null)
                return;

            await _token.RevokeRefreshTokenAsync(refreshToken);
        }

        // refresh-token
        public async Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenDTO refreshToken)
        {
            // kiểm tra token
            var token = await _token.ValidateRefreshTokenAsync(refreshToken.RefreshToken);

            if (token == null)
            {
                _logger.LogWarning("Refresh token is invalid or expired.");

                throw new UnauthorizedAccessException("Invalid or expired refresh token.");
            }

            // lấy user
            var user = await _context.Users.Find(u => u.Id == token.UserId && u.Status == UserStatus.Active).FirstOrDefaultAsync() 
                ?? throw new UnauthorizedAccessException("User not found or inactive.");

            // lấy role
            var role = await _context.Roles.Find(r => r.Id == user.RoleId).FirstOrDefaultAsync() 
                ?? throw new NotFoundExcception("User role not found.");

            // đánh dấu thu hồi token
            await _token.RevokeRefreshTokenAsync(token);

            // tạo access token mới
            var accessToken = _token.GenerateAccessToken(user, role);

            // tạo refresh token mới
            var refreshTokenNew = _token.GenerateRefreshToken();

            // lưu token mới vào db
            await _token.SaveRefreshTokenAsync(user.Id, refreshTokenNew);

            return new AuthResponseDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenNew,
            };
        }

        // đăng ký
        public async Task<UserInfo> RegisterAsync(RegisterDTO register)
        {
            var userCheck = await _context.Users.Find(u => u.UserName == register.UserName || u.Email == register.Email).FirstOrDefaultAsync();
            if (userCheck != null)
            {
                _logger.LogError("FAILD: Register username or email already exists.");
                throw new ConflictCustomException("Username or email already exists.");
            }

            // kiểm tra Password và ConfirmPassword có giống nhau không?

            // tạo user mới
            var user = new User
            {
                UserName = register.UserName,
                Email = register.Email,
                FullName = register.FullName,
                RoleId = RoleSeedConstant.UserRoleId
            };

            user.PasswordHash = _passCheck.HashPassword(user, register.Password);

            // lưu user vào db
            await _context.Users.InsertOneAsync(user);

            // lấy role cho user
            var role = await _context.Roles.Find(r => r.Id == user.RoleId).FirstOrDefaultAsync();

            var result = _mapper.Map<UserInfo>(user);
            result.RoleName = role.Name;

            return result;
        }
    }
}
