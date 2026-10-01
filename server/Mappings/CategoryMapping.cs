using AutoMapper;
using server.Dtos.Category;
using server.Models;

namespace server.Mappings
{
    public class CategoryMapping: Profile
    {
        public CategoryMapping()
        {
            CreateMap<Category, CategoryDTO>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.Name, o => o.MapFrom(s => s.NameCategory))
                .ForMember(d => d.ParentId, o => o.MapFrom(s => s.ParentId))
                .ForMember(d => d.IsActive, o => o.MapFrom(s => s.IsActive))
                .ForMember(d => d.CreatedDate, o => o.MapFrom(s => s.CreatedAt))
                .ForMember(d => d.UpdatedDate, o => o.MapFrom(s => s.UpdatedAt));
        }
    }
}
