using server.Common.Enums;

namespace server.Dtos.PostContents
{
    public class CreatePostContentDTO
    {
        public PostContentType PostContentType { get; set; }
        public string ValueContent { get; set; } = string.Empty;
    }
}
