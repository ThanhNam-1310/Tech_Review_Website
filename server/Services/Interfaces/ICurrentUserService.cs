namespace server.Services.Interfaces
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        bool IsAdmin { get; }
        bool IsAuthen { get; }
        bool HasPermission(string permission);
    }
}
