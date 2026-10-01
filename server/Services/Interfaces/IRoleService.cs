using server.Dtos.Role;

namespace server.Services.Interfaces
{
    public interface IRoleService
    {
        // lấy danh sách các role
        Task<IEnumerable<RoleDTO>> GetAllRoles();

        // set role cho user
        Task<bool> SetRoleAsync(Guid userId, Guid roleId);

    }
}
