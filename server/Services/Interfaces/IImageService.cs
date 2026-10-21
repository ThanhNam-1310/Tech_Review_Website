namespace server.Services.Interfaces
{
    public interface IImageService
    {
        Task<string> UploadAsync(IFormFile file, string bucketName, string? folder = null);

        Task DeleteAsync(string bucketName, string imageUrl);
    }
}
