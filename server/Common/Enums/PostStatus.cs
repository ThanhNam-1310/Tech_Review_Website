namespace server.Common.Enums
{
    public enum PostStatus
    {
        // bài viết mới tạo, chua được công khai
        New = 0,

        // bài viết đang được xét duyệt
        PenddingPost = 1,

        // bài viết được duyệt
        ApprovedPost = 2,

        // bài viết bị từ chối
        RejectedPost = 3,

        // bài viết đã bị ẩn
        HiddenPost = 4,
    }
}
