using Microsoft.Extensions.Caching.Memory;
using server.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace server.Services.Implements
{
    public class ViewTrackingService(IMemoryCache cache, IHttpContextAccessor httpContextAccessor, ICurrentUserService currentUser) : IViewTrackingService
    {
        private readonly IMemoryCache _cache = cache;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly ICurrentUserService _currentUserService = currentUser;

        // Mỗi người xem chỉ tính 1 lần trong 1 giờ
        private static readonly TimeSpan ViewWindow = TimeSpan.FromHours(1);

        public bool TryRecordView(Guid postId, Guid authorId)
        {
            // Nếu là tác giả xem bài viết mình thì không tính
            if (_currentUserService.IsAuthen && authorId == _currentUserService.UserId)
                return false;

            var cacheKey = $"post-view:{postId}:{GetViewerKey()}";

            if (_cache.TryGetValue(cacheKey, out _))
                return false; // Đã tính trong 1 giờ qua → không tính nữa

            _cache.Set(cacheKey, true, ViewWindow);

            return true;
        }

        private string GetViewerKey()
        {
            if (_currentUserService.IsAuthen) return $"user:{_currentUserService.UserId}";

            var ip = _currentUserService.IpAddress ?? "unknown";
            var userAgent = _currentUserService.UserAgent ?? string.Empty;
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes($"{ip}|{userAgent}"));
            return $"anon:{Convert.ToHexString(hash)[..16]}";
        }
    }
}
