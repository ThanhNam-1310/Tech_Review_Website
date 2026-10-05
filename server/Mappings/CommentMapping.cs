using AutoMapper;
using server.Dtos.Comment;
using server.Models;

namespace server.Mappings
{
    public class CommentMapping: Profile
    {
        public CommentMapping()
        {
            CreateMap<Comment, CommentDTO>();
        }
    }
}
