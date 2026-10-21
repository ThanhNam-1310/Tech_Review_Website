namespace server.Common.Constants
{
    public static class PermissionConstants
    {
        // Create/ Update/ Delete áp dụng cho các dữ liệu của user là chủ. Manage = thao tác trên dữ liệu của người khác/

        // Post
        public static class Post
        {
            public const string View = "post:view";
            public const string Create = "post:create";
            public const string Update = "post:update";
            public const string Delete = "post:delete";
            public const string Manage = "post:manage";
        }

        public static class Product
        {
            public const string View = "product:view";
            public const string Create = "product:create";
            public const string Update = "product:update";
            public const string Delete = "product:delete";
        }

        public static class Category
        {
            public const string View = "category:view";
            public const string Create = "category:create";
            public const string Update = "category:update";
            public const string Delete = "category:delete";
        }

        public static class Comment
        {
            public const string View = "comment:view";
            public const string Create = "comment:create";
            public const string Update = "comment:update";
            public const string Delete = "comment:delete";
            public const string Hidden = "comment:hidden";
        }

        public static class User
        {
            public const string View = "user:view";
            public const string Update = "user:update";
            public const string Delete = "user:delete";
            public const string AssignRole = "user:assign-role";
            // các permisison còn thiếu
        }

        public static class Role
        {
            public const string View = "role:view";
        }

        public static class Permission
        {
            public const string View = "permission:view";
            public const string SetPermission = "permission:set";
            public const string RemovePermission = "permission:remove";
        }
        
    }
}
