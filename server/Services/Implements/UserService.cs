using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using server.Common.Constants;
using server.Common.Exceptions;
using server.Common.Pagination;
using server.Data;
using server.Data.Seeder;
using server.Dtos.Auth;
using server.Dtos.User;
using server.Models;
using server.Services.Interfaces;
using server.Storage;

namespace server.Services.Implements
{
    public class UserService(MongoDbContext context, ILogger<UserService> logger, IMapper mapper, IImageService imageService,
        IOptions<SupabaseSetting> options) : IUserService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<UserService> _logger = logger;
        private readonly IImageService _imageService = imageService;
        private readonly SupabaseSetting _storage = options.Value;

        // Lấy danh sách user thường có phân trang
        public async Task<PageResult<ListUserDTO>> GetAllUserNormalAsync(
            PageRequest request)
        {
            return await GetUsersByRoleAsync(
                RoleSeedConstant.UserRoleId, request);
        }

        // Lấy danh sách chuyên gia có phân trang
        public async Task<PageResult<ListUserDTO>> GetAllUserExpertAsync(
            PageRequest request)
        {
            return await GetUsersByRoleAsync(
                RoleSeedConstant.ExpertRoleId, request);
        }

        // Lấy danh sách quản trị viên có phân trang
        public async Task<PageResult<ListUserDTO>> GetAllUserAdminlAsync(PageRequest request)
        {
            return await GetUsersByRoleAsync(RoleSeedConstant.AdminRoleId, request);
        }

        // Hàm dùng chung để lọc, tìm kiếm và phân trang
        private async Task<PageResult<ListUserDTO>> GetUsersByRoleAsync(
            Guid roleId,
            PageRequest request)
        {
            var query = _context.Users
                .AsQueryable()
                .Where(u => u.RoleId == roleId);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.Trim();

                query = query.Where(u =>
                    u.FullName.Contains(keyword) ||
                    u.UserName.Contains(keyword) ||
                    u.Email.Contains(keyword));
            }

            query = query.OrderByDescending(u => u.CreatedAt);

            // Phân trang
            var result = await PaginationExtension.PageResultAsync(
                query, request);

            var users = result.Items;

            // Mapping User sang ListUserDTO
            var userDTOs = _mapper.Map<List<ListUserDTO>>(users);

            // Truy vấn Role một lần
            var roleIds = users
                .Select(u => u.RoleId)
                .Distinct()
                .ToList();

            var roles = await _context.Roles
                .Find(r => roleIds.Contains(r.Id))
                .ToListAsync();

            var roleDictionary = roles.ToDictionary(
                r => r.Id,
                r => r.Name);

            // Gán RoleName vào DTO
            foreach (var dto in userDTOs)
            {
                var user = users.First(u => u.Id == dto.Id);

                if (roleDictionary.TryGetValue(
                    user.RoleId, out var roleName))
                {
                    dto.RoleName = roleName;
                }
            }

            return new PageResult<ListUserDTO>
            {
                Items = userDTOs,
                TotalCount = result.TotalCount,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize
            };
        }

        // Lấy thông tin user theo ID
        public async Task<UserInfo> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("User not found");

            var result = _mapper.Map<UserInfo>(user);

            var roleName = await _context.Roles.Find(r => r.Id == user.RoleId).FirstOrDefaultAsync();

            result.RoleName = roleName?.Name ?? string.Empty;

            return result;
        }

        // Cập nhật thông tin user
        public async Task<UserInfo> UpdateUserByIdAsync(
            Guid id, UpdateUserDTO userDTO)
        {
            var user = await _context.Users
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("User not found");

            user.FullName = userDTO.FullName ?? user.FullName;
            user.Email = userDTO.Email ?? user.Email;
            user.AvatarUrl = userDTO.AvatarUrl ?? user.AvatarUrl;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.Users.ReplaceOneAsync(
                u => u.Id == id, user);

            return _mapper.Map<UserInfo>(user);
        }

        // Xóa user
        public async Task<bool> DeleteUserAsync(Guid id)
        {
            var result = await _context.Users.DeleteOneAsync(
                u => u.Id == id);

            if (result.DeletedCount == 0)
            {
                throw new NotFoundExcception("User not found");
            }

            return true;
        }

        // update avatar
        public async Task<string> UpdateAvatarAsync(Guid userId, IFormFile file)
        {
            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            if (user == null)
                throw new NotFoundExcception("User không tồn tại.");

            var oldAvatarUrl = user.AvatarUrl;

            var newAvatarUrl = await _imageService.UploadAsync(file, _storage.Buckets.Avatars, $"users/{userId}");

            try
            {
                var update = Builders<User>.Update
                    .Set(u => u.AvatarUrl, newAvatarUrl)
                    .Set(u => u.UpdatedAt, DateTime.UtcNow);

                var result = await _context.Users.UpdateOneAsync(u => u.Id == userId, update);

                if (result.MatchedCount == 0)
                    throw new NotFoundExcception("User not found.");

            }
            catch
            {
                // Nếu cập nhật MongoDB thất bại, xóa ảnh mới vừa upload.
                await _imageService.DeleteAsync(_storage.Buckets.Avatars, newAvatarUrl);

                throw;
            }

            // Chỉ xóa avatar cũ nếu đó là ảnh trên bucket Supabase hiện tại.
            if (!string.IsNullOrWhiteSpace(oldAvatarUrl) &&
                oldAvatarUrl.StartsWith($"{_storage.Url.TrimEnd('/')}/storage/v1/object/public/", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    await _imageService.DeleteAsync( _storage.Buckets.Avatars, oldAvatarUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa avatar cũ của user {UserId}", userId);
                }
            }

            return newAvatarUrl;
        }
    }
}
