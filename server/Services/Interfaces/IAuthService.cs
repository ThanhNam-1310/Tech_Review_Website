using server.Dtos.Auth;

namespace server.Services.Interfaces
{
    public interface IAuthService
    {
        // login
        Task<AuthResponseDTO> LoginAsync(LoginDTO login);

        // register
        Task<UserInfo> RegisterAsync(RegisterDTO register);

        // Refresh token
        Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenDTO refreshToken);

        // log out
        Task LogOutAsync(RefreshTokenDTO token);

        // get all user
        Task<IEnumerable<UserInfo>> GetAllUserAsync();
    }
}
