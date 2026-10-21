using MongoDB.Driver;
using server.Data;
using server.Dtos.Permission;
using server.Services.Interfaces;
using server.Common.Exceptions;
using AutoMapper;

namespace server.Services.Implements
{
    public class PermissionService(MongoDbContext db, IMapper mapper) : IPermissionService
    {
        private readonly MongoDbContext _db = db;
        private readonly IMapper _mapper = mapper;

        public async Task<IEnumerable<PermissionDTO>> GetPermissionByUserIdAsync(Guid userId)
        {
            var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("User not found");

            return await GetPermissionsByRoleIdAsync(user.RoleId);
        }

        public async Task<IEnumerable<PermissionDTO>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            var role = await _db.Roles.Find(r => r.Id == roleId).FirstOrDefaultAsync();
            if (role == null) throw new NotFoundExcception("Not found role");

            var permissions = await _db.Permissions.Find(p => role.PermissionIds.Contains(p.Id)).ToListAsync();

            return _mapper.Map<IEnumerable<PermissionDTO>>(permissions);
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permission)
        {
            // lấy user
            var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return false;

            // lấy role
            var role = await _db.Roles.Find(r => r.Id == user.RoleId).FirstOrDefaultAsync();
            if (role == null) return false;

            // kiểm tra permission
            return await _db.Permissions.Find(x => role.PermissionIds.Contains(x.Id) && x.Name == permission).AnyAsync();
        }
    }
}
