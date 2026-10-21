using server.Common.Pagination;
using server.Dtos.Auth;
using server.Dtos.User;

namespace server.Services.Interfaces
{
    public interface IUserService
    {
        // lấy danh sách user thường
        Task<PageResult<ListUserDTO>> GetAllUserNormalAsync(PageRequest request);

        // lấy danh sách user có vai trò là chuyên gia
        Task<PageResult<ListUserDTO>> GetAllUserExpertAsync(PageRequest request);

        // lấy danh sách user là admin (quản trị viên)
        Task<PageResult<ListUserDTO>> GetAllUserAdminlAsync(PageRequest request);

        // lấy thông tin 1 user
        Task<UserInfo> GetUserByIdAsync(Guid id);

        // cập nhật user
        Task<UserInfo> UpdateUserByIdAsync(Guid id, UpdateUserDTO userDTO);

        // xóa user
        Task<bool> DeleteUserAsync(Guid id);


        // update avatar
        Task<string> UpdateAvatarAsync(Guid userId, IFormFile file);
    }
}
