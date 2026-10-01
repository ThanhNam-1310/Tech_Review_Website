using server.Common.Enums;

namespace server.Dtos.PostContents
{
    public class PostContentDTO
    {
        public Guid Id { get; set; }
        public PostContentType Type { get; set; }
        public string ValueContent { get; set; } = string.Empty;
    }
}
