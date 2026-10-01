namespace server.Models
{
    public class Permission: BaseModels
    {
        // tên quyền hạn cho role
        public string Name { get; set; } = string.Empty;

        // mô tả quyền hạn
        public string Description { get; set; } = string.Empty;
    }
}
