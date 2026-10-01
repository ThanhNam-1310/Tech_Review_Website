using server.Models;

namespace server.Services.Interfaces
{
    public interface ITokenService
    {
        // tạo access token
        string GenerateAccessToken(User user, Role role);

        // tạo refresh token
        string GenerateRefreshToken();

        // lưu refresh token vào db
        Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string refreshToken);

        // revoke refresh token
        Task RevokeRefreshTokenAsync(RefreshToken token);

        // xác thực refresh token
        Task<RefreshToken?> ValidateRefreshTokenAsync(string token);
    }
}
