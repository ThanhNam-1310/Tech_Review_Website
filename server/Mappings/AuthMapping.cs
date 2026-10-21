using AutoMapper;
using server.Dtos.Auth;
using server.Dtos.Role;
using server.Dtos.User;
using server.Models;

namespace server.Mappings
{
    public class AuthMapping: Profile
    {
        public AuthMapping()
        {
            CreateMap<User, UserInfo>();
            CreateMap<Role,RoleDTO>();
            CreateMap<User,ListUserDTO>();
        }
    }
}
