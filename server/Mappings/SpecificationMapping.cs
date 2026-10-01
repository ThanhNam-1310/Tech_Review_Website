using AutoMapper;
using server.Dtos.Specification;
using server.Models;

namespace server.Mappings
{
    public class SpecificationMapping: Profile
    {
        public SpecificationMapping()
        {
            CreateMap<Specification, SpecificationDTO>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.Name))
                .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.CategoryId, o => o.MapFrom(s => s.CategoryId))
                .ForMember(d => d.DisplayOrder, o => o.MapFrom(s => s.DisplayOrder));
        }
    }
}
