using AutoMapper;
using MongoDB.Driver;
using server.Common.Exceptions;
using server.Data;
using server.Dtos.Role;
using server.Models;
using server.Services.Interfaces;

namespace server.Services.Implements
{
    public class RoleService(MongoDbContext context, IMapper mapper) : IRoleService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        public async Task<IEnumerable<RoleDTO>> GetAllRoles()
        {
            var roles = await _context.Roles.Find(_=>true).ToListAsync();

            return _mapper.Map<IEnumerable<RoleDTO>>(roles);
        }

        public async Task<bool> SetRoleAsync(Guid userId, Guid roleId)
        {

            var role = await _context.Roles.Find(r => r.Id == roleId).FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Role not found");

            var result = await _context.Users.UpdateOneAsync(u => u.Id == userId, Builders<User>.Update
                .Set(u => u.RoleId, roleId)
                .Set(u => u.UpdatedAt, DateTime.UtcNow));

            if (result.MatchedCount == 0)
                throw new NotFoundExcception("User not found.");

            return true;
        }
    }
}
