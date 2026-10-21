
using Microsoft.Extensions.Options;
using server.Services.Interfaces;
using server.Storage;
using System.Net.Http.Headers;

namespace server.Services.Implements;

public class ImageService : IImageService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseSetting _settings;

    private const long MaxFileSize = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    public ImageService(
        HttpClient httpClient,
        IOptions<SupabaseSetting> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;

        _httpClient.BaseAddress = new Uri(_settings.Url.TrimEnd('/') + "/");
        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation(
            "apikey", _settings.Key);
    }

    public async Task<string> UploadAsync(
        IFormFile file,
        string bucketName,
        string? folder = null)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Vui lòng chọn ảnh.");

        if (file.Length > MaxFileSize)
            throw new ArgumentException("Ảnh tối đa 5 MB.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
            throw new ArgumentException("Định dạng ảnh không hợp lệ.");

        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            _ => throw new ArgumentException("Định dạng ảnh không hợp lệ.")
        };

        var fileName = $"{Guid.NewGuid():N}{extension}";

        var path = string.IsNullOrWhiteSpace(folder)
            ? fileName
            : $"{folder.Trim('/')}/{fileName}";

        var encodedPath = string.Join("/",
            path.Split('/').Select(Uri.EscapeDataString));

        using var content = new StreamContent(file.OpenReadStream());
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var response = await _httpClient.PostAsync(
            $"storage/v1/object/{Uri.EscapeDataString(bucketName)}/{encodedPath}",
            content);

        response.EnsureSuccessStatusCode();

        return $"{_settings.Url.TrimEnd('/')}/storage/v1/object/public/" +
               $"{Uri.EscapeDataString(bucketName)}/{encodedPath}";
    }

    public async Task DeleteAsync(string bucketName, string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        var prefix = $"{_settings.Url.TrimEnd('/')}/storage/v1/object/public/";

        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
            !imageUrl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("URL ảnh không hợp lệ.");

        var relativePath = imageUrl[prefix.Length..];
        var parts = relativePath.Split('/', 2);

        if (parts.Length != 2 ||
            Uri.UnescapeDataString(parts[0]) != bucketName)
            throw new ArgumentException("Bucket ảnh không khớp.");

        var path = string.Join("/",
            parts[1].Split('/').Select(segment =>
                Uri.EscapeDataString(Uri.UnescapeDataString(segment))));

        using var response = await _httpClient.DeleteAsync(
            $"storage/v1/object/{Uri.EscapeDataString(bucketName)}/{path}");

        response.EnsureSuccessStatusCode();
    }
}
