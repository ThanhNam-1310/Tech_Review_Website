namespace server.Dtos.Auth
{
    public class AuthResponseDTO
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpireAt { get; set; }
        public UserInfo User { get; set; } = new UserInfo();
    }
}
