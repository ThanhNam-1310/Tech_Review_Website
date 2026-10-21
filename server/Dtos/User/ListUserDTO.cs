namespace server.Dtos.User
{
    public class ListUserDTO
    {
        public Guid Id { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public string? RoleName { get; set; }
    }
}
