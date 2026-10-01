using MongoDB.Driver;
using server.Common.Constants;
using server.Models;

namespace server.Data.Seeder
{
    public static class RoleSeeder
    {
        public static async Task SeedRoleAsync(MongoDbContext context)
        {
            // kiểm tra đã có role chưa
            var countRole = await context.Roles.CountDocumentsAsync(FilterDefinition<Role>.Empty);

            if (countRole > 0) return;

            // tạo role
            var roles = new List<Role>
            {
                new() {
                    Id = RoleSeedConstant.UserRoleId,
                    Name = RoleConstants.User,
                    Description = "Người dùng thường"
                },
                new() {
                    Id = RoleSeedConstant.AdminRoleId,
                    Name = RoleConstants.Admin,
                    Description = "Quản trị viên"
                },

                new() {
                    Id = RoleSeedConstant.ExpertRoleId,
                    Name = RoleConstants.Expert,
                    Description = "Người dùng là chuyên gia"
                }
            };

            await context.Roles.InsertManyAsync(roles);
        }
    }
}
