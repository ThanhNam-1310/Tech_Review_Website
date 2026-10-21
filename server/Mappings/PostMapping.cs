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
                .ForMember(d => d.ThumbnailUrl, o => o.MapFrom(s => s.ThumbnailUrl))
                .ForMember(d => d.AuthorId, o => o.MapFrom(s => s.AuthorId))
                .ForMember(d => d.AuthorName, o => o.Ignore())
                .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
                .ForMember(d => d.Contents, o => o.MapFrom(s => s.Contents));
            CreateMap<Post, ListPostDTO>()
                .ForMember(d => d.PostId, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.AuthorName, o => o.Ignore())
                .ForMember(d => d.ThumbnailUrl, o => o.MapFrom(s => s.ThumbnailUrl))
                .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
                .ForMember(d => d.ViewCount, o => o.MapFrom(s => s.Rating.ViewCount))
                .ForMember(d => d.LikeCount, o => o.MapFrom(s => s.Rating.LikeCount));
            CreateMap<PostContent, PostContentDTO>()
                .ForMember(d => d.ValueContent, o => o.MapFrom(s => s.ValueType));
        }
    }
}
