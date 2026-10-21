using MongoDB.Driver;
using server.Common.Constants;
using server.Models;

namespace server.Data.Seeder
{
    public static class RoleSeeder
    {
        public static async Task SeedRoleAsync(MongoDbContext context)
        {
            //Tạm xóa role cũ để seed lại
            //await context.Roles.DeleteManyAsync(
            //    FilterDefinition<Role>.Empty);
            // kiểm tra đã có role chưa
            var countRole = await context.Roles.CountDocumentsAsync(FilterDefinition<Role>.Empty);

            if (countRole > 0) return;

            // lấy permission
            var permissions = await context.Permissions
                .Find(FilterDefinition<Permission>.Empty)
                .ToListAsync();

            var permissionIds = permissions
                .ToDictionary(x => x.Name, x => x.Id);

            // User
            var userPermissions = new List<Guid>
            {
                permissionIds[PermissionConstants.Post.View],
                permissionIds[PermissionConstants.Post.Create],
                permissionIds[PermissionConstants.Post.Update],
                permissionIds[PermissionConstants.Post.Delete],

                permissionIds[PermissionConstants.Product.View],

                permissionIds[PermissionConstants.Comment.View],
                permissionIds[PermissionConstants.Comment.Create],
                permissionIds[PermissionConstants.Comment.Update],
                permissionIds[PermissionConstants.Comment.Delete]
            };

            // Expert = quyền của User + thêm quyền tạo/cập nhật Product
            var expertPermissions = new List<Guid>(userPermissions)
            {
                permissionIds[PermissionConstants.Product.Create],
                permissionIds[PermissionConstants.Product.Update]
            };

            // Admin = tất cả permission
            var adminPermissions = permissions
                .Select(x => x.Id)
                .ToList();

            // tạo role
            var roles = new List<Role>
            {
                new() {
                    Id = RoleSeedConstant.UserRoleId,
                    Name = RoleConstants.User,
                    Description = "Người dùng thường",
                    PermissionIds = userPermissions,
                },
                new() {
                    Id = RoleSeedConstant.AdminRoleId,
                    Name = RoleConstants.Admin,
                    Description = "Quản trị viên",
                    PermissionIds = adminPermissions,
                },

                new() {
                    Id = RoleSeedConstant.ExpertRoleId,
                    Name = RoleConstants.Expert,
                    Description = "Người dùng là chuyên gia",
                    PermissionIds = expertPermissions,
                }
            };

            await context.Roles.InsertManyAsync(roles);
        }
    }
}
