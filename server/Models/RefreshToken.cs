namespace server.Models
{
    public class RefreshToken: BaseModels
    {
        public Guid UserId { get; set; }
        public string RefreshTokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
    }
}
