namespace server.Common.Constants
{
    public class RoleConstants
    {
        public const string User = "user";      // người dùng thường
        public const string Admin = "admin";    // quản trị viên
        public const string Expert = "expert";  //  người dùng là chuyên gia
    }

    public class RoleSeedConstant
    {
        public static readonly Guid UserRoleId = Guid.Parse("9aab276f-65f6-41f9-87c5-ea4c5b95c559");
        public static readonly Guid AdminRoleId = Guid.Parse("d836c64e-602b-43ca-b522-03a30c4ca5d9");
        public static readonly Guid ExpertRoleId = Guid.Parse("b8f8aa27-bafa-4955-9929-3538c22e613b");
    }
}
