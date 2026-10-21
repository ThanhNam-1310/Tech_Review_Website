namespace server.Storage
{
    public class SupabaseSetting
    {
        public string Url { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;

        public SupabaseBuckets Buckets { get; set; } = new();
    }

    public class SupabaseBuckets
    {
        public string Avatars { get; set; } = string.Empty;
        public string Posts { get; set; } = string.Empty;
        public string Products { get; set; } = string.Empty;
    }
}
