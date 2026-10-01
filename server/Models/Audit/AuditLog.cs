using server.Common.Enums;

namespace server.Models.Audit
{
    public class AuditLog: BaseModels
    {
        // id của user
        public Guid? UserId { get; set; }

        // username hoặc email của user
        public string? UserName { get; set; }

        // loại hành động của user
        public ActionEnums Actions { get; set; }

        // tên models bị tác động
        public string ModelName { get; set; } = string.Empty;

        // dữ liệu trước thay đổi
        public string? OldValue { get; set; }

        // dữ liệu sau thay đổi
        public string? NewValue { get; set; }
    }
}
