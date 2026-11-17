using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;
using server.Common.Constants;
using server.Common.Enums;
using server.Models;

namespace server.Data.Seeder
{
    public static class AdminSeeder
    {
        private const string AdminUserName = "admin";
        private const string AdminPassword = "admin@123";
        private const string AdminEmail = "admin@techreview.local";

        public static async Task SeedAdminAsync(MongoDbContext context, IPasswordHasher<User> passwordHasher)
        {
            var exists = await context.Users
                .Find(u => u.UserName == AdminUserName)
                .AnyAsync();
            if (exists)
                return;

            var admin = new User
            {
                UserName = AdminUserName,
                FullName = "Administrator",
                Email = AdminEmail,
                AvatarUrl = string.Empty,
                RoleId = RoleSeedConstant.AdminRoleId,
                Status = UserStatus.Active,
            };

            admin.PasswordHash = passwordHasher.HashPassword(admin, AdminPassword);

            await context.Users.InsertOneAsync(admin);
        }
    }
}
