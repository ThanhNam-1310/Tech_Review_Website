using AutoMapper;
using MongoDB.Driver;
using server.Data;
using server.Dtos.PostContents;
using server.Models;
using server.Services.Interfaces;
using server.Common.Exceptions;

namespace server.Services.Implements
{
    public class PostContentService(MongoDbContext context, IMapper mapper, ILogger<PostContentService> logger) : IPostContentService
    {
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<PostContentService> _logger = logger;
        private readonly MongoDbContext _context = context;

        // tạo mới content cho bài viết
        public async Task<PostContentDTO> CreateContentAsync(Guid postId, CreatePostContentDTO dto)
        {
            var post = await _context.Posts.Find(p => p.Id == postId).AnyAsync();
            if (!post)
            {
                _logger.LogError("FAILD: Post not found");
                throw new NotFoundExcception("Post not found or deleted.");
            }

            var content = new PostContent
            {
                PostId = postId,
                Type = dto.PostContentType,
                ValueType = dto.ValueContent
            };

            await _context.PostContents.InsertOneAsync(content);

            _logger.LogInformation("SUCESS: Create new content");
            return _mapper.Map<PostContentDTO>(content);
        }

        // xóa 1 content
        public async Task<bool> DeleteContentAsync(Guid contentId, Guid postId)
        {
            var post = await _context.PostContents.DeleteOneAsync(c => c.Id == contentId && c.PostId == postId);

            if (post.DeletedCount == 0)
            {
                _logger.LogError("FAILD: Delete content");
                throw new BadRequestException("Content not found or deleted");
            }

            return true;
        }

        // danh sách tất cả content của bài viết
        public async Task<IEnumerable<PostContentDTO>> GetAllByPostIdAsync(Guid postId)
        {
            var contents = await _context.PostContents.Find(c => c.PostId == postId).ToListAsync();

            return _mapper.Map<IEnumerable<PostContentDTO>>(contents);
        }

        // cập nhật
        public async Task<PostContentDTO> UpdateContentAsync(Guid contentId, Guid postId, UpdatePostContentDTO dTO)
        {
            var content = await _context.PostContents.Find(c => c.Id == contentId && c.PostId == postId).FirstOrDefaultAsync();
            if (content == null)
            {
                _logger.LogError("FAILD: Update content ID: {id}", contentId);
                throw new NotFoundExcception("Content or post not found/deleted");
            }

            // update
            content.Type = dTO.PostContentType ?? content.Type;
            content.ValueType = dTO.ValueContent ?? content.ValueType;

            content.UpdatedAt = DateTime.UtcNow;

            await _context.PostContents.ReplaceOneAsync(c => c.Id == contentId && c.PostId == postId, content);

            _logger.LogInformation("SUCCESS: Update content");
            return _mapper.Map<PostContentDTO>(content);
        }
    }
}
