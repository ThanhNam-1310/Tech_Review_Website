using AutoMapper;
using MongoDB.Driver;
using server.Common.Enums;
using server.Common.Exceptions;
using server.Data;
using server.Dtos.Comment;
using server.Models;
using server.Services.Interfaces;
using System.Xml.Linq;

namespace server.Services.Implements
{
    public class CommentService(MongoDbContext context, IMapper mapper, ILogger<CommentService> logger, IPostService postService) : ICommentService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<CommentService> _logger = logger;
        private readonly IPostService _postService = postService;

        // create / reply
        public async Task<CommentDTO> CreateCommentPostAsync(Guid postId, CreateCommentDTO dTO)
        {
            var comment = new Comment
            {
                TargetId = postId,
                TargetType = TargetType.Post,
                ParentCommentId = dTO.ParentCommentId,
                CommentContent = dTO.CommentContent,
            };

            await _context.Comments.InsertOneAsync(comment);

            // tăng bình luận vào rating của post
            await _postService.TangCommentAsync(postId);
            _logger.LogInformation("SUCCESS: Create new comment for post");

             return _mapper.Map<CommentDTO>(comment);
        }

        // thêm bình luận cho product
        public async Task<CommentDTO> CreateCommentProductAsync(Guid productId, CreateCommentDTO dTO)
        {
            var comment = new Comment
            {
                TargetId = productId,
                TargetType = TargetType.Product,
                ParentCommentId = dTO.ParentCommentId,
                CommentContent = dTO.CommentContent,

            };

            await _context.Comments.InsertOneAsync(comment);
            _logger.LogInformation("SUCCESS: Create new comment for product");
            return _mapper.Map<CommentDTO>(comment);
        }

        public Task<bool> DeleteCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }

        // get tất cả comment của bài viết
        public  async Task<IEnumerable<CommentDTO>> GetCommentPostAsync(Guid postId)
        {
            var comments = await _context.Comments.Find(c => c.TargetId == postId && !c.IsHidden)
                .SortBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDto = _mapper.Map<List<CommentDTO>>(comments);

            var result = BuildCommentTree(commentDto);
            _logger.LogInformation("SUCCESS: Get comments of target ID: {id}", postId);

            return result;
        }

        // lấy tất cả comment của product
        public async Task<IEnumerable<CommentDTO>> GetCommentProductAsync(Guid productId)
        {
            var comment = await _context.Comments.Find(c => c.TargetId == productId && !c.IsHidden)
                .SortBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDto = _mapper.Map<List<CommentDTO>>(comment);
            var result = BuildCommentTree(commentDto);

            _logger.LogInformation("SUCCESS: Get comments of target ID: {id}", productId);
            return result;
        }

        public Task<CommentDTO> GetDetailCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task HiddenCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task UnHiddenCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }

        // update
        public async Task<CommentDTO> UpdateCommentAsync(Guid commentId, UpdateCommentDTO dTO)
        {
            var update = Builders<Comment>.Update
                .Set(c => c.CommentContent, dTO.CommentContent)
                .Set(c => c.UpdatedAt, DateTime.UtcNow);

            var commentResult = await _context.Comments.UpdateOneAsync(c => c.Id == commentId && !c.IsHidden, update);
            
            var comment = await _context.Comments.Find(c => c.Id == commentId && !c.IsHidden).FirstOrDefaultAsync();

            _logger.LogInformation("SUCCESS: Update comment ID: {id}", commentId);
             return _mapper.Map<CommentDTO>(comment);
        }

        // private
        private static List<CommentDTO> BuildCommentTree(List<CommentDTO> comments)
        {
            var commentDictionary = comments.ToDictionary(c => c.Id);

            var rootComments = new List<CommentDTO>();

            foreach (var comment in comments)
            {
                // Comment cha
                if (comment.ParentCommentId == null)
                {
                    rootComments.Add(comment);
                    continue;
                }

                // Comment con
                if (commentDictionary.TryGetValue(
                    comment.ParentCommentId.Value,
                    out var parent))
                {
                    parent.Replies.Add(comment);
                }
            }

            return rootComments;
        }
    }
}
