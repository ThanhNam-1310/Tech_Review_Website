using MongoDB.Driver;
using server.Common.Constants;
using server.Models;

namespace server.Data.Seeder
{
    public class PermissionSeeder
    {
        public static async Task SeedPermissionAsync(MongoDbContext db)
        {
            // kiểm tra đã có permission chưa
            var count = await db.Permissions.CountDocumentsAsync(FilterDefinition<Permission>.Empty);

            if (count > 0) return;

            // Tạo permission
            var permissions = new List<Permission>
            {
                // Post
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Post.View,
                    Description = "Xem bài viết",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Post.Create,
                    Description = "Tạo bài viết",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Post.Update,
                    Description = "Cập nhật bài viết của mình",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Post.Delete,
                    Description = "Xóa bài viết của mình",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Post.Manage,
                    Description = "Quản lý bài viết của người khác",
                    CreatedAt = DateTime.UtcNow
                },

                // Product
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Product.View,
                    Description = "Xem sản phẩm",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Product.Create,
                    Description = "Tạo sản phẩm",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Product.Update,
                    Description = "Cập nhật sản phẩm",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Product.Delete,
                    Description = "Xóa sản phẩm",
                    CreatedAt = DateTime.UtcNow
                },

                // Category
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Category.View,
                    Description = "Xem danh mục",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Category.Create,
                    Description = "Tạo danh mục",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Category.Update,
                    Description = "Cập nhật danh mục",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Category.Delete,
                    Description = "Xóa danh mục",
                    CreatedAt = DateTime.UtcNow
                },

                // Comment
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Comment.View,
                    Description = "Xem bình luận",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Comment.Create,
                    Description = "Tạo bình luận",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Comment.Update,
                    Description = "Cập nhật bình luận của mình",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Comment.Delete,
                    Description = "Xóa bình luận của mình",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Comment.Hidden,
                    Description = "Ẩn bình luận",
                    CreatedAt = DateTime.UtcNow
                },

                // User
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.User.View,
                    Description = "Xem thông tin người dùng",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.User.Update,
                    Description = "Cập nhật thông tin người dùng",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.User.Delete,
                    Description = "Xóa người dùng",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.User.AssignRole,
                    Description = "Gán role cho người dùng",
                    CreatedAt = DateTime.UtcNow
                },

                // Role
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Role.View,
                    Description = "Xem role",
                    CreatedAt = DateTime.UtcNow
                },

                // Permission
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Permission.View,
                    Description = "Xem permission",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Permission.SetPermission,
                    Description = "Cập nhật permission",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.CreateVersion7(),
                    Name = PermissionConstants.Permission.RemovePermission,
                    Description = "Xóa permission",
                    CreatedAt = DateTime.UtcNow
                }
            };

            await db.Permissions.InsertManyAsync(permissions);
        }
    }
}
