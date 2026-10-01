using server.Common.Enums;

namespace server.Dtos.PostContents
{
    public class UpdatePostContentDTO
    {
        public PostContentType? PostContentType { get; set; }
        public string? ValueContent { get; set; }
    }
}
