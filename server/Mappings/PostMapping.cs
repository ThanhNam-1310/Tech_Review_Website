using AutoMapper;
using server.Dtos.PostContents;
using server.Dtos.Posts;
using server.Models;

namespace server.Mappings
{
    public class PostMapping: Profile
    {
        public PostMapping()
        {
            CreateMap<Post, PostDTO>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
                .ForMember(d => d.Contents, o => o.MapFrom(s => s.Contents));
            CreateMap<Post, ListPostDTO>()
                .ForMember(d => d.PostId, o => o.MapFrom(s => s.Id));
            CreateMap<PostContent, PostContentDTO>()
                .ForMember(d => d.ValueContent, o => o.MapFrom(s => s.ValueType));
        }
    }
}
