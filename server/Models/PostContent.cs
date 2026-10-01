using server.Common.Enums;

namespace server.Models
{
    public class PostContent
    {
        // loại content: image / text
        public PostContentType Type { get; set; } = PostContentType.Image;

        // giá trị: url / text
        public string ValueType { get; set; } = string.Empty;
    }
}
