using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using server.Data;
using server.Models;
using server.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace server.Services.Implements
{
    public class TokenService(MongoDbContext context, IConfiguration configuration) : ITokenService
    {
        private MongoDbContext _context = context;
        private IConfiguration _configuration = configuration;

        // tạo access token
        public string GenerateAccessToken(User user, Role role)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, role.Name ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JWT:ExpiryMinutes"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // tạo refresh token
        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        // revoke token
        public async Task RevokeRefreshTokenAsync(RefreshToken token)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;

            await _context.RefreshTokens.ReplaceOneAsync(t => t.Id == token.Id && !token.IsRevoked, token);
        }

        // lưu token vào db
        public async Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var token = new RefreshToken
            {
                UserId = userId,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(int.Parse(_configuration["JWT:RefreshTokenDays"]!)),
                IsRevoked = false,
            };

            await _context.RefreshTokens.InsertOneAsync(token);
            return token;
        }

        // xác thực token
        public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens.Find(t => t.Token == token && 
                !t.IsRevoked && 
                t.RevokedAt == null && 
                t.ExpiresAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();
        }
    }
}
