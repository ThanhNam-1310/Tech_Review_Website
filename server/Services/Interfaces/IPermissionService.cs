using server.Dtos.Permission;

namespace server.Services.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(Guid userId, string permission);
        
        // xem danh sách quyền của role
        Task<IEnumerable<PermissionDTO>> GetPermissionsByRoleIdAsync(Guid roleId);

        // xem danh sách quyền của user
        Task<IEnumerable<PermissionDTO>> GetPermissionByUserIdAsync(Guid userId);
    }
}
