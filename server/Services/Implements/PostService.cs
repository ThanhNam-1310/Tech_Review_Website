using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using server.Common.Constants;
using server.Common.Enums;
using server.Common.Exceptions;
using server.Common.Helper;
using server.Common.Pagination;
using server.Common.Pagination.Query;
using server.Data;
using server.Dtos.Posts;
using server.Models;
using server.Services.Interfaces;
using server.Storage;
using System.Text.RegularExpressions;

namespace server.Services.Implements
{
    public class PostService(MongoDbContext context, IMapper mapper, ILogger<PostService> logger, IImageService imageService,
        IOptions<SupabaseSetting> options, ICurrentUserService currentUser) : IPostService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<PostService> _logger = logger;
        private readonly IImageService _imageService = imageService;
        private readonly SupabaseSetting _storage = options.Value;
        private readonly ICurrentUserService _currentUser = currentUser;

        // Lấy tất cả bài viết
        public async Task<PageResult<ListPostDTO>> GetAllPostAsync(PostQueryRequest request)
        {
            var now = DateTime.UtcNow;
            var query = _context.Posts.AsQueryable();

            // Chỉ lấy bài đã duyệt và đang hiển thị công khai
            query = query.Where(p => p.Visibility == PostVisibility.PostPublic
                && (p.PublicDate == null || p.PublicDate <= now));

            // Lọc bài trong N ngày gần nhất (?days=30)
            if (request.Days.HasValue)
            {
                var from = now.AddDays(-request.Days.Value);
                query = query.Where(p => p.CreatedAt >= from);
            }

            // ?highlight=true → bài hero do admin đánh dấu
            if (request.Highlight == true)
                query = query.Where(p => p.IsHightLight);

            // ?editorPick=true → bài do chuyên gia chọn
            if (request.EditorPick == true)
                query = query.Where(p => p.IsEditorPick);

            return await GetPostsAsync(query, request);
        }

        // Lấy bài viết theo danh mục
        public async Task<PageResult<ListPostDTO>> GetPostByCategoryIdAsync(
            Guid categoryId, PageRequest request)
        {
            var query = _context.Posts
                .AsQueryable()
                .Where(p => p.CategoryId == categoryId);

            return await GetPostsAsync(query, request);
        }

        // Lấy bài viết theo sản phẩm
        public async Task<PageResult<ListPostDTO>> GetPostByProductIdAsync(
            Guid productId, PageRequest request)
        {
            var query = _context.Posts
                .AsQueryable()
                .Where(p => p.ProductId == productId);

            return await GetPostsAsync(query, request);
        }

        // Hàm dùng chung: tìm kiếm, phân trang và lấy tên tác giả
        private async Task<PageResult<ListPostDTO>> GetPostsAsync(IQueryable<Post> query, PageRequest request)
        {
            // Tìm kiếm theo tiêu đề hoặc mô tả
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = TextSearch.NormalizeForSearch(request.Search);
                var pattern = new Regex(Regex.Escape(keyword));

                query = query.Where(p => pattern.IsMatch(p.SearchText));
            }

            // Sắp xếp bài viết theo SortBy/SortOrder
            query = ApplySorting(query, request);

            // Phân trang trực tiếp trên MongoDB
            var page = await PaginationExtension.PageResultAsync(
                query, request);

            var posts = page.Items;

            // Lấy danh sách ID tác giả không trùng nhau
            var authorIds = posts
                .Select(p => p.AuthorId)
                .Distinct()
                .ToList();

            var authorNames = new Dictionary<Guid, string>();

            // Chỉ truy vấn user khi trang có bài viết
            if (authorIds.Count > 0)
            {
                var users = await _context.Users
                    .Find(u => authorIds.Contains(u.Id))
                    .Project(u => new
                    {
                        u.Id,
                        u.FullName
                    })
                    .ToListAsync();

                authorNames = users.ToDictionary(
                    u => u.Id,
                    u => u.FullName ?? string.Empty);
            }

            // Mapping sang ListPostDTO
            var items = posts.Select(p => new ListPostDTO
            {
                PostId = p.Id,
                Title = p.Title,
                ThumbnailUrl = p.ThumbnailUrl ?? string.Empty,
                AuthorName = authorNames.GetValueOrDefault(p.AuthorId, string.Empty),
                PublicDate = p.PublicDate,
                IsHightLight = p.IsHightLight,
                ViewCount = p.Rating?.ViewCount ?? 0,
                LikeCount = p.Rating?.LikeCount ?? 0
            }).ToList();

            _logger.LogInformation(
                "SUCCESS: Get posts. Page: {PageNumber}, Total: {TotalCount}",
                page.PageNumber,
                page.TotalCount);

            return new PageResult<ListPostDTO>
            {
                Items = items,
                TotalCount = page.TotalCount,
                PageNumber = page.PageNumber,
                PageSize = page.PageSize
            };
        }

        // Sắp xếp theo SortBy/SortOrder (?sortBy=LikeCount&sortOrder=desc)
        private static IQueryable<Post> ApplySorting(IQueryable<Post> query, PageRequest request)
        {
            var desc = !string.Equals(request.SortOrder, "asc",
                StringComparison.OrdinalIgnoreCase);

            return request.SortBy?.Trim().ToLowerInvariant() switch
            {
                "likecount" => desc ? query.OrderByDescending(p => p.Rating.LikeCount)
                                     : query.OrderBy(p => p.Rating.LikeCount),
                "viewcount" => desc ? query.OrderByDescending(p => p.Rating.ViewCount)
                                     : query.OrderBy(p => p.Rating.ViewCount),
                "publicdate" => desc ? query.OrderByDescending(p => p.PublicDate)
                                     : query.OrderBy(p => p.PublicDate),
                "title" => desc ? query.OrderByDescending(p => p.Title)
                                     : query.OrderBy(p => p.Title),
                _ => desc ? query.OrderByDescending(p => p.CreatedAt)
                                     : query.OrderBy(p => p.CreatedAt),
            };
        }

        // Lấy post kèm kiểm tra điều kiện user
        private async Task<Post> GetPostForModifyAsync(Guid postId, string ownPermission)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to perform this action.");

            var post = await _context.Posts
                .Find(p => p.Id == postId)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Post not found.");

            if (post.AuthorId == _currentUser.UserId)
            {
                // Bài của mình → cần quyền trên dữ liệu của mình
                if (!_currentUser.HasPermission(ownPermission))
                    throw new ForbiddenException("You do not have permission to perform this action.");
            }
            else if (!_currentUser.HasPermission(PermissionConstants.Post.Manage))
            {
                throw new ForbiddenException("You do not have permission to edit this post.");
            }


            return post;
        }

        // Lấy chi tiết bài viết
        public async Task<PostDTO> GetDetailPostById(Guid id)
        {
            var post = await _context.Posts
        .Find(p => p.Id == id)
        .FirstOrDefaultAsync()
        ?? throw new NotFoundExcception("Post not found");

            var user = await _context.Users
                .Find(u => u.Id == post.AuthorId)
                .Project(u => new
                {
                    u.FullName
                })
                .FirstOrDefaultAsync();

            var result = _mapper.Map<PostDTO>(post);

            result.AuthorName = user?.FullName ?? string.Empty;

            _logger.LogInformation(
                "SUCCESS: Get detail post ID: {Id}", id);

            return result;
        }

        // Tạo bài viết
        public async Task<PostDTO> CreatePostAsync(CreatePostDTO dto)
        {
            if (!_currentUser.IsAuthen) throw new UnauthorizedAccessException("You need to log in to create a post.");

            var post = new Post
            {
                Title = dto.Title,
                Description = dto.Description,
                ThumbnailUrl = string.Empty,
                AuthorId = _currentUser.UserId,
                ProductId = dto.ProductId,
                CategoryId = dto.CategoryId,
                Visibility = dto.Visibility,
                PublicDate = DateTime.UtcNow,
                SearchText = TextSearch.NormalizeForSearch(dto.Title + " " + dto.Description),
                Contents = dto.Contents.Select(c => new PostContent
                {
                    Type = c.PostContentType,
                    ValueType = c.ValueContent
                }).ToList()
            };

            await _context.Posts.InsertOneAsync(post);

            _logger.LogInformation(
                "SUCCESS: Create new post ID: {Id}", post.Id);

            return _mapper.Map<PostDTO>(post);
        }

        // Cập nhật bài viết
        public async Task<PostDTO> UpdatePostAsync(
            Guid postId, UpdatePostDTO dto)
        {
            var post = await GetPostForModifyAsync(postId, PermissionConstants.Post.Update);

            var oldImages = dto.Contents == null
                ? []
                : post.Contents.Where(c => c.Type == PostContentType.Image).Select(c => c.ValueType).ToHashSet();

            post.Title = dto.Title ?? post.Title;
            post.Description = dto.Description ?? post.Description;
            post.CategoryId = dto.CategoryId ?? post.CategoryId;
            post.ProductId = dto.ProductId ?? post.ProductId;
            post.Visibility = dto.Visibility ?? post.Visibility;

            if (dto.Contents != null)
                post.Contents = dto.Contents.Select(c => new PostContent
                {
                    Type = c.PostContentType,
                    ValueType = c.ValueContent ?? string.Empty
                }).ToList();

            post.SearchText = TextSearch.NormalizeForSearch(post.Title + " " + post.Description);
            post.UpdatedAt = DateTime.UtcNow;
            await _context.Posts.ReplaceOneAsync(p => p.Id == postId, post);

            if (dto.Contents != null)
            {
                var newImages = post.Contents.Where(c => c.Type == PostContentType.Image)
                    .Select(c => c.ValueType)
                    .ToHashSet();

                foreach (var url in oldImages.Except(newImages))
                {
                    try
                    {
                        await _imageService.DeleteAsync(_storage.Buckets.Posts, url);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể xóa ảnh content cũ: {Url}", url);
                    }
                }
            }

            return _mapper.Map<PostDTO>(post);
        }

        // upload ảnh đại diện cho post
        public async Task<string> UploadPostThumbnailAsync(IFormFile file, Guid postId)
        {
            if(file == null || file.Length == 0)
        throw new BadRequestException("Vui lòng chọn ảnh thumbnail.");

            var post = await _context.Posts
                .Find(p => p.Id == postId)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Post not found.");

            var newUrl = await _imageService.UploadAsync(
                file,
                _storage.Buckets.Posts,
                $"{postId}/thumbnail");

            try
            {
                var result = await _context.Posts.UpdateOneAsync(
                    p => p.Id == postId,
                    Builders<Post>.Update
                        .Set(p => p.ThumbnailUrl, newUrl)
                        .Set(p => p.UpdatedAt, DateTime.UtcNow));

                if (result.MatchedCount == 0)
                    throw new NotFoundExcception("Post not found.");
            }
            catch
            {
                try { await _imageService.DeleteAsync(_storage.Buckets.Posts, newUrl); }
                catch (Exception ex) { _logger.LogWarning(ex, "Không thể xóa thumbnail mới."); }
                throw;
            }

            if (!string.IsNullOrWhiteSpace(post.ThumbnailUrl))
            {
                try { await _imageService.DeleteAsync(_storage.Buckets.Posts, post.ThumbnailUrl); }
                catch (Exception ex) { _logger.LogWarning(ex, "Không thể xóa thumbnail cũ."); }
            }

            return newUrl;
        }

        // upload ảnh cho content
        public async Task<string> UploadPostContentImageAsync(IFormFile file, Guid postId)
        {
            if (file == null || file.Length == 0)
                throw new BadRequestException("Vui lòng chọn ảnh content.");

            var exists = await _context.Posts
                .Find(p => p.Id == postId)
                .AnyAsync();

            if (!exists)
                throw new NotFoundExcception("Post not found.");

            return await _imageService.UploadAsync(
                file,
                _storage.Buckets.Posts,
                $"{postId}/contents");
        }

        // Xóa bài viết
        public async Task<bool> DeletePostAsync(Guid postId)
        {
            await GetPostForModifyAsync(postId, PermissionConstants.Post.Delete);

            var result = await _context.Posts.DeleteOneAsync(
                p => p.Id == postId);

            if (result.DeletedCount == 0)
            {
                _logger.LogError(
                    "FAILED: Delete post ID: {Id}", postId);

                throw new NotFoundExcception("Post not found or deleted");
            }

            _logger.LogInformation(
                "SUCCESS: Deleted post ID: {Id}", postId);

            return true;
        }

        // bài viết chủ đề
        public async Task<PostDTO> SetHeroPostAsync(Guid postId)
        {
            var exists = await _context.Posts
                .Find(p => p.Id == postId)
                .AnyAsync();
            if (!exists)
                throw new NotFoundExcception("Post not found");

            // Chỉ 1 hero tại 1 thời điểm: gỡ cờ ở tất cả bài khác trước
            await _context.Posts.UpdateManyAsync(
                Builders<Post>.Filter.Ne(p => p.Id, postId) &
                Builders<Post>.Filter.Eq(p => p.IsHightLight, true),
                Builders<Post>.Update.Set(p => p.IsHightLight, false));

            await _context.Posts.UpdateOneAsync(
                Builders<Post>.Filter.Eq(p => p.Id, postId),
                Builders<Post>.Update.Set(p => p.IsHightLight, true));

            var post = await _context.Posts
                .Find(p => p.Id == postId)
                .FirstOrDefaultAsync();

            _logger.LogInformation("Set hero post {PostId}", postId);
            return _mapper.Map<PostDTO>(post);
        }


        // Tăng lượt xem
        public async Task IncreaseViewCountAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.ViewCount, 1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // Tăng lượt thích
        public async Task TangLikeCountAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.LikeCount, 1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // Giảm lượt thích
        public async Task GiamLikeCountAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.LikeCount, -1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // Tăng lượt chia sẻ
        public async Task IncreaseSharedCountAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.SharedCount, 1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // Tăng số bình luận
        public async Task TangCommentAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.CommentCount, 1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // Giảm số bình luận
        public async Task GiamCommentAsync(Guid postId)
        {
            var update = Builders<Post>.Update
                .Inc(p => p.Rating.CommentCount, -1);

            await _context.Posts.UpdateOneAsync(
                p => p.Id == postId, update);
        }

        // danh sách bài viết theo user id 
        public async Task<PageResult<ListPostDTO>> GetPostByAuthorIdAsync(Guid authorId, PageRequest request)
        {
            var query = _context.Posts.AsQueryable().Where(p => p.AuthorId == authorId);

            return await GetPostsAsync(query, request);
        }
    }
}