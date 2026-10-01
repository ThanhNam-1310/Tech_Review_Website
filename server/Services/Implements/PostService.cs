using AutoMapper;
using MongoDB.Driver;
using server.Data;
using server.Dtos.Posts;
using server.Services.Interfaces;
using server.Common.Exceptions;
using server.Models;
using Microsoft.AspNetCore.Identity;

namespace server.Services.Implements
{
    public class PostService(MongoDbContext context, IMapper mapper, ILogger<PostService> logger, IPostContentService postContentService) : IPostService
    {
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<PostService> _logger = logger;
        private readonly MongoDbContext _context = context;
        private readonly IPostContentService _postContentService = postContentService;

        // phê duyệt bài viết (dành co admin)
        public Task ApprovePostAsync(Guid postId)
        {
            throw new NotImplementedException();
        }

        // tạo mới bài viết
        public async Task<PostDTO> CreatePostAsync(CreatePostDTO dto)
        {
            var post = new Post
            {
                Title = dto.Title,
                Description = dto.Description,
                ThumbnailUrl = dto.ThumbnailUrl,
                ProductId = dto.ProductId,
                CategoryId = dto.CategoryId,
                Visibility = dto.Visibility,
                Status = Common.Enums.PostStatus.New,
                PublicDate = DateTime.UtcNow
            };

            _logger.LogInformation("SUCCESS: Create new post ID: {id}", post.Id);
            await _context.Posts.InsertOneAsync(post);

            return _mapper.Map<PostDTO>(post);
        }

        // xóa 1 bài viết
        public async Task<bool> DeletePostAsync(Guid postId)
        {
            var post = await _context.Posts.DeleteOneAsync(p => p.Id == postId);
            if (post.DeletedCount == 0)
            {
                _logger.LogError("FAILD: Delete post ID: {id}", postId);
                throw new NotFoundExcception("Post not found or deleted");
            }

            _logger.LogInformation("SUCCESS: Deleted post ID: {id}", postId);
            return true;
        }

        // danh sách tất cả bài viết
        public async Task<IEnumerable<ListPostDTO>> GetAllPostAsync()
        {
            var posts = await _context.Posts.Find(_=>true).ToListAsync();

            var authorIds = posts.Select(p => p.AuthorId).Distinct().ToList();

            var users = await _context.Users.Find(u => authorIds.Contains(u.Id)).Project(u => new { u.Id, u.FullName }).ToListAsync();

            var authorName = users.ToDictionary(u => u.Id, u => u.FullName);

            _logger.LogInformation("SUCCESS: Get all list post");
            return posts.Select(p =>
            {
                var result = _mapper.Map<ListPostDTO>(p);
                result.AuthorName = authorName.GetValueOrDefault(p.AuthorId, string.Empty);

                return result;
            });
        }

        // lấy thông tin của 1 post theo id
        public async Task<PostDTO> GetDetailPostById(Guid id)
        {
            var post = await _context.Posts.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (post == null)
            {
                _logger.LogError("FAILD: Get detail post ID: {id}", id);
                throw new NotFoundExcception("Post not found or deleted");
            }

            //var user = await _user.FindByIdAsync(post.AuthorId.ToString());
            var user = await _context.Users.Find(u => u.Id == post.AuthorId)
                .Project(u => new { u.Id, u.FullName })
                .FirstOrDefaultAsync();

            var contents = await _postContentService.GetAllByPostIdAsync(post.Id);

            var result = _mapper.Map<PostDTO>(post);
            //result.AuthorId = user!.Id;
            result.AuthorName = user?.FullName ?? string.Empty;
            result.Contents = contents.ToList();

            _logger.LogInformation("SUCCESS: Get detail post ID: {id}", id);
            return result;
        }

        // danh sách bài viết theo danh mục
        public async Task<IEnumerable<ListPostDTO>> GetPostByCategoryIdAsync(Guid categoryId)
        {
            var postsCate = await _context.Posts.Find(p => p.CategoryId == categoryId).ToListAsync();

            var authorIds = postsCate.Select(p => p.AuthorId).Distinct().ToList();

            var users = await _context.Users.Find(u => authorIds.Contains(u.Id)).Project(u => new { u.Id, u.FullName }).ToListAsync();

            var authorName = users.ToDictionary(u => u.Id, u => u.FullName);

            _logger.LogInformation("SUCCESS: Get all list post of category");
            return postsCate.Select(p =>
            {
                var result = _mapper.Map<ListPostDTO>(p);
                result.AuthorName = authorName.GetValueOrDefault(p.AuthorId, string.Empty);

                return result;
            });
        }

        // danh sách bài viết theo sản phẩm
        public async Task<IEnumerable<ListPostDTO>> GetPostByProductId(Guid productId)
        {
            var postsProduct = await _context.Posts.Find(p => p.ProductId == productId).ToListAsync();

            var authorIds = postsProduct.Select(p => p.AuthorId).Distinct().ToList();

            var users = await _context.Users.Find(u => authorIds.Contains(u.Id)).Project(u => new { u.Id, u.FullName }).ToListAsync();

            var authorName = users.ToDictionary(u => u.Id, u => u.FullName);

            _logger.LogInformation("SUCCESS: Get all post of product");
            return postsProduct.Select(p =>
            {
                var result = _mapper.Map<ListPostDTO>(p);
                result.AuthorName = authorName.GetValueOrDefault(p.AuthorId, string.Empty);

                return result;
            });
        }

        // từ chối bài viết (dành cho admin)
        public Task RejectPostAsync(Guid postId)
        {
            throw new NotImplementedException();
        }

        // cập nhật thông tin bài viết
        public async Task<PostDTO> UpdatePostAsync(Guid postId, UpdatePostDTO dto)
        {
            var post = await _context.Posts.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null)
            {
                _logger.LogError("FAILD: Update post ID: {id}", postId);
                throw new NotFoundExcception("Post not found or deleted.");
            }

            // update các trường
            post.Title = dto.Title ?? post.Title;
            post.Description = dto.Description ?? post.Description;
            post.ThumbnailUrl = dto.ThumbnailUrl ?? post.ThumbnailUrl;
            post.CategoryId = dto.CategoryId ?? post.CategoryId;
            post.ProductId = dto.ProductId ?? post.ProductId;
            post.Visibility = dto.Visibility ?? post.Visibility;

            // audit
            post.UpdatedAt = DateTime.UtcNow;

            await _context.Posts.ReplaceOneAsync(p => p.Id == postId, post);

            _logger.LogInformation("SUCCESS: Update post ID: {id}", postId);
            return _mapper.Map<PostDTO>(post);
        }
    }
}
