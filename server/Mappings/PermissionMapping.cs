using AutoMapper;
using server.Dtos.Permission;
using server.Models;

namespace server.Mappings
{
    public class PermissionMapping: Profile
    {
        public PermissionMapping()
        {
            CreateMap<Permission, PermissionDTO>();
        }
    }
}
