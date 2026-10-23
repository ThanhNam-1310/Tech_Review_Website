using MongoDB.Driver;
using server.Common.Enums;
using server.Data;
using server.Dtos.Gioi_Thieu_Items;
using server.Services.Interfaces;

namespace server.Services.Implements
{
    public class RecommendationService(HttpClient httpClient, MongoDbContext context) : IRecommendationService
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly MongoDbContext _context = context;

        public async Task<object> GetRecommendationsAsync(GioiThieuDTO request)
        {
            List<GioiThieu_ItemDTO> items;

            // Lấy dữ liệu theo loại đối tượng cần gợi ý
            if (request.ItemType == "product")
                items = await GetProductsAsync();
            else if (request.ItemType == "post")
                items = await GetPostsAsync();
            else
                throw new ArgumentException("ItemType phải là product hoặc post.");

            // Gửi dữ liệu sang Python để tính độ tương đồng
            var payload = new
            {
                request.ItemType,
                request.ItemId,
                request.Limit,
                Items = items
            };

            var response = await _httpClient.PostAsJsonAsync(
                "/recommendations", payload);

            response.EnsureSuccessStatusCode();

            var ketQua = await response.Content
                .ReadFromJsonAsync<PythonRecommendationResponse>()
                ?? new PythonRecommendationResponse();

            // Ghép dữ liệu hiển thị (ảnh, giá, tác giả...) theo itemId,
            // giữ nguyên thứ tự xếp hạng Python đã tính
            if (request.ItemType == "product")
            {
                return new
                {
                    itemType = ketQua.ItemType,
                    itemId = ketQua.ItemId,
                    recommendations = await GhepSanPhamAsync(ketQua.Recommendations)
                };
            }

            return new
            {
                itemType = ketQua.ItemType,
                itemId = ketQua.ItemId,
                recommendations = await GhepBaiVietAsync(ketQua.Recommendations)
            };
        }

        // Ghép ảnh + thương hiệu + giá cho từng sản phẩm gợi ý
        private async Task<List<object>> GhepSanPhamAsync(
            List<PythonRecommendationItem> recommendations)
        {
            var ids = recommendations.Select(r => r.ItemId).ToList();

            var products = await _context.Products
                .Find(p => ids.Contains(p.Id))
                .ToListAsync();

            var theoId = products.ToDictionary(p => p.Id);

            var ketQua = new List<object>();
            foreach (var r in recommendations)
            {
                if (!theoId.TryGetValue(r.ItemId, out var p)) continue;

                ketQua.Add(new
                {
                    itemId = r.ItemId,
                    title = r.Title,
                    score = r.Score,
                    thumnailUrl = p.ThumnaiUrl,
                    brand = p.Brand,
                    price = p.Price
                });
            }

            return ketQua;
        }

        // Ghép ảnh + tác giả + ngày đăng + lượt xem/thích cho từng bài gợi ý
        private async Task<List<object>> GhepBaiVietAsync(
            List<PythonRecommendationItem> recommendations)
        {
            var ids = recommendations.Select(r => r.ItemId).ToList();

            var posts = await _context.Posts
                .Find(p => ids.Contains(p.Id))
                .ToListAsync();

            var theoId = posts.ToDictionary(p => p.Id);

            var authorIds = posts.Select(p => p.AuthorId).Distinct().ToList();
            var authors = await _context.Users
                .Find(u => authorIds.Contains(u.Id))
                .ToListAsync();
            var tenTacGia = authors.ToDictionary(u => u.Id, u => u.FullName);

            var ketQua = new List<object>();
            foreach (var r in recommendations)
            {
                if (!theoId.TryGetValue(r.ItemId, out var p)) continue;

                ketQua.Add(new
                {
                    itemId = r.ItemId,
                    title = r.Title,
                    score = r.Score,
                    thumbnailUrl = p.ThumbnailUrl,
                    authorName = tenTacGia.TryGetValue(p.AuthorId, out var ten)
                        ? ten
                        : string.Empty,
                    publicDate = p.PublicDate,
                    viewCount = p.Rating.ViewCount,
                    likeCount = p.Rating.LikeCount
                });
            }

            return ketQua;
        }

        // Lấy sản phẩm và chuyển thành DTO
        private async Task<List<GioiThieu_ItemDTO>> GetProductsAsync()
        {
            var products = await _context.Products.Find(p => !p.IsDeleted).ToListAsync();

            var categories = await _context.Categories.Find(_ => true).ToListAsync();

            var specifications = await _context.Specifications.Find(_ => true).ToListAsync();

            return products.Select(p => new GioiThieu_ItemDTO
            {
                Id = p.Id,
                Title = p.Name,
                Description = p.Description ?? "",
                Category = categories
                    .FirstOrDefault(c => c.Id == p.CategoryId)?.NameCategory ?? "",

                // Ghép thương hiệu và thông số thành văn bản
                Content = p.Brand + " " + string.Join(" ",
                    p.Specifications.Select(s =>
                        specifications.FirstOrDefault(x =>
                            x.Id == s.SpecificationId)?.Name + " " + s.Value))
            }).ToList();
        }

        // Lấy bài viết công khai và chuyển thành DTO
        private async Task<List<GioiThieu_ItemDTO>> GetPostsAsync()
        {
            var posts = await _context.Posts.Find(p => p.Visibility == PostVisibility.PostPublic)
                .ToListAsync();

            var categories = await _context.Categories.Find(_ => true).ToListAsync();

            return posts.Select(p => new GioiThieu_ItemDTO
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Category = categories
                    .FirstOrDefault(c => c.Id == p.CategoryId)?.NameCategory ?? "",

                // Chỉ lấy nội dung văn bản, bỏ qua ảnh
                Content = string.Join(" ",
                    p.Contents
                        .Where(c => c.Type == PostContentType.Text)
                        .Select(c => c.ValueType))
            }).ToList();
        }
    }

    // Dạng dữ liệu Python trả về từ endpoint /recommendations
    public class PythonRecommendationResponse
    {
        public string ItemType { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public List<PythonRecommendationItem> Recommendations { get; set; } = [];
    }

    public class PythonRecommendationItem
    {
        public Guid ItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double Score { get; set; }
    }
}
