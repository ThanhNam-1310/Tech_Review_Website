namespace server.Models
{
    public abstract class BaseModels
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
