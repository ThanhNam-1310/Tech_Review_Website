using AutoMapper;
using MongoDB.Driver;
using server.Common.Constants;
using server.Common.Enums;
using server.Common.Exceptions;
using server.Data;
using server.Dtos.Comment;
using server.Models;
using server.Services.Interfaces;
using System.Xml.Linq;

namespace server.Services.Implements
{
    public class CommentService(MongoDbContext context, IMapper mapper, ILogger<CommentService> logger, ICurrentUserService currentUser, MlCommentService mlService) : ICommentService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<CommentService> _logger = logger;
        private readonly ICurrentUserService _currentUser = currentUser;
        private readonly MlCommentService _mlService = mlService;

        // create / reply cho post: chỉ user đã login mới được bình luận
        public async Task<CommentDTO> CreateCommentPostAsync(Guid postId, CreateCommentDTO dTO)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to comment.");

            var postExists = await _context.Posts.Find(p => p.Id == postId).AnyAsync();
            if (!postExists)
                throw new NotFoundExcception("Post not found.");

            var comment = new Comment
            {
                TargetId = postId,
                TargetType = TargetType.Post,
                UserId = _currentUser.UserId,
                ParentCommentId = dTO.ParentCommentId,
                CommentContent = dTO.CommentContent,
                SentimentLabel = await _mlService.PhanLoaiAsync(dTO.CommentContent)
            };

            await _context.Comments.InsertOneAsync(comment);

            _logger.LogInformation("SUCCESS: Create new comment for post");

            return _mapper.Map<CommentDTO>(comment);
        }

        // thêm bình luận cho product: chỉ user đã login mới được bình luận
        public async Task<CommentDTO> CreateCommentProductAsync(Guid productId, CreateCommentDTO dTO)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to comment.");

            var productExists = await _context.Products.Find(p => p.Id == productId).AnyAsync();
            if (!productExists)
                throw new NotFoundExcception("Product not found.");

            var comment = new Comment
            {
                TargetId = productId,
                TargetType = TargetType.Product,
                UserId = _currentUser.UserId,
                ParentCommentId = dTO.ParentCommentId,
                CommentContent = dTO.CommentContent,
                SentimentLabel = await _mlService.PhanLoaiAsync(dTO.CommentContent)
            };

            await _context.Comments.InsertOneAsync(comment);

            _logger.LogInformation("SUCCESS: Create new comment for product");
            return _mapper.Map<CommentDTO>(comment);
        }

        // xóa bình luận: chỉ chủ bình luận mới được xóa, xóa cả nhánh trả lời bên dưới
        public async Task<bool> DeleteCommentAsync(Guid commentId)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to delete a comment.");

            var comment = await _context.Comments
                .Find(c => c.Id == commentId)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Comment not found.");

            if (comment.UserId != _currentUser.UserId)
                throw new ForbiddenException("You can only delete your own comments.");

            // Thu thập comment + toàn bộ trả lời bên dưới
            var idsToDelete = new List<Guid>();
            var queue = new Queue<Guid>();
            queue.Enqueue(commentId);
            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                idsToDelete.Add(currentId);

                var children = await _context.Comments
                    .Find(c => c.ParentCommentId == currentId)
                    .Project(c => c.Id)
                    .ToListAsync();
                foreach (var childId in children)
                    queue.Enqueue(childId);
            }

            var deleted = await _context.Comments.DeleteManyAsync(c => idsToDelete.Contains(c.Id));
            if (deleted.DeletedCount == 0) return false;

            _logger.LogInformation("SUCCESS: Delete comment ID: {id}", commentId);
            return true;
        }

        // get tất cả comment của bài viết
        public async Task<IEnumerable<CommentDTO>> GetCommentPostAsync(Guid postId)
        {
            var comments = await _context.Comments.Find(c => c.TargetId == postId)
                .SortBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDto = _mapper.Map<List<CommentDTO>>(comments);

            await EnrichCommentDtosAsync(comments, commentDto);

            var result = BuildCommentTree(commentDto);
            _logger.LogInformation("SUCCESS: Get comments of target ID: {id}", postId);

            return result;
        }

        // lấy tất cả comment của product
        public async Task<IEnumerable<CommentDTO>> GetCommentProductAsync(Guid productId)
        {
            var comment = await _context.Comments.Find(c => c.TargetId == productId)
                .SortBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDto = _mapper.Map<List<CommentDTO>>(comment);

            await EnrichCommentDtosAsync(comment, commentDto);

            var result = BuildCommentTree(commentDto);

            _logger.LogInformation("SUCCESS: Get comments of target ID: {id}", productId);
            return result;
        }

        // chi tiết 1 bình luận: chỉ trả bình luận chưa bị ẩn
        public async Task<CommentDTO> GetDetailCommentAsync(Guid commentId)
        {
            var comment = await _context.Comments
                .Find(c => c.Id == commentId && !c.IsHidden)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Comment not found.");

            _logger.LogInformation("SUCCESS: Get detail comment ID: {id}", commentId);

            var dto = _mapper.Map<CommentDTO>(comment);
            await EnrichCommentDtosAsync([comment], [dto]);
            return dto;
        }

        // ẩn bình luận (kiểm duyệt): yêu cầu đăng nhập, quyền comment:hidden chặn ở controller
        public async Task HiddenCommentAsync(Guid commentId)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to hide a comment.");

            var commentExists = await _context.Comments.Find(c => c.Id == commentId).AnyAsync();
            if (!commentExists)
                throw new NotFoundExcception("Comment not found.");

            await _context.Comments.UpdateOneAsync(
                c => c.Id == commentId,
                Builders<Comment>.Update
                    .Set(c => c.IsHidden, true)
                    .Set(c => c.UpdatedAt, DateTime.UtcNow));

            _logger.LogInformation("SUCCESS: Hide comment ID: {id}", commentId);
        }

        // bỏ ẩn bình luận: yêu cầu đăng nhập, quyền comment:hidden chặn ở controller
        public async Task UnHiddenCommentAsync(Guid commentId)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to unhide a comment.");

            var commentExists = await _context.Comments.Find(c => c.Id == commentId).AnyAsync();
            if (!commentExists)
                throw new NotFoundExcception("Comment not found.");

            await _context.Comments.UpdateOneAsync(
                c => c.Id == commentId,
                Builders<Comment>.Update
                    .Set(c => c.IsHidden, false)
                    .Set(c => c.UpdatedAt, DateTime.UtcNow));

            _logger.LogInformation("SUCCESS: Unhide comment ID: {id}", commentId);
        }

        // update: chỉ chủ bình luận mới được sửa, lưu lại nhãn cảm xúc mới
        public async Task<CommentDTO> UpdateCommentAsync(Guid commentId, UpdateCommentDTO dTO)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to update a comment.");

            var existing = await _context.Comments
                .Find(c => c.Id == commentId && !c.IsHidden)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Comment not found.");

            if (existing.UserId != _currentUser.UserId)
                throw new ForbiddenException("You can only update your own comments.");

            var sentimentLabel = await _mlService.PhanLoaiAsync(dTO.CommentContent);

            var update = Builders<Comment>.Update
                .Set(c => c.CommentContent, dTO.CommentContent)
                .Set(c => c.SentimentLabel, sentimentLabel)
                .Set(c => c.UpdatedAt, DateTime.UtcNow);

            await _context.Comments.UpdateOneAsync(c => c.Id == commentId && !c.IsHidden, update);

            var comment = await _context.Comments.Find(c => c.Id == commentId && !c.IsHidden).FirstOrDefaultAsync();

            _logger.LogInformation("SUCCESS: Update comment ID: {id}", commentId);
            return _mapper.Map<CommentDTO>(comment);
        }

        // like bình luận: mỗi user tối đa 1 lần
        public async Task<(bool IsLiked, int LikeCount)> TangLikeCountAsync(Guid commentId)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to like a comment.");

            var comment = await _context.Comments
                .Find(c => c.Id == commentId)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Comment not found.");

            var alreadyLiked = comment.LikeByUserIds?.Contains(_currentUser.UserId) == true;
            if (alreadyLiked)
                return (true, comment.LikeByUserIds!.Count);

            await _context.Comments.UpdateOneAsync(
                c => c.Id == commentId,
                Builders<Comment>.Update.AddToSet(c => c.LikeByUserIds, _currentUser.UserId));

            return (true, (comment.LikeByUserIds?.Count ?? 0) + 1);
        }

        // bỏ like bình luận
        public async Task<(bool IsLiked, int LikeCount)> GiamLikeCountAsync(Guid commentId)
        {
            if (!_currentUser.IsAuthen)
                throw new UnauthorizedAccessException("You need to log in to unlike a comment.");

            var comment = await _context.Comments
                .Find(c => c.Id == commentId)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Comment not found.");

            var alreadyLiked = comment.LikeByUserIds?.Contains(_currentUser.UserId) == true;
            if (!alreadyLiked)
                return (false, comment.LikeByUserIds?.Count ?? 0);

            await _context.Comments.UpdateOneAsync(
                c => c.Id == commentId,
                Builders<Comment>.Update.Pull(c => c.LikeByUserIds, _currentUser.UserId));

            return (false, (comment.LikeByUserIds?.Count ?? 0) - 1);
        }

        // Điền tên/avatar/role tác giả + số like cho danh sách DTO, 1 query Users
        private async Task EnrichCommentDtosAsync(List<Comment> comments, List<CommentDTO> dtos)
        {
            var userIds = dtos.Select(d => d.UserId).Distinct().ToList();
            if (userIds.Count > 0)
            {
                var users = await _context.Users
                    .Find(u => userIds.Contains(u.Id))
                    .Project(u => new { u.Id, u.UserName, u.AvatarUrl, u.RoleId })
                    .ToListAsync();
                var byId = users.ToDictionary(u => u.Id);
                foreach (var dto in dtos)
                {
                    if (!byId.TryGetValue(dto.UserId, out var user)) continue;
                    dto.UserName = user.UserName;
                    dto.UserAvatarUrl = user.AvatarUrl;
                    dto.RoleName = user.RoleId == RoleSeedConstant.AdminRoleId ? RoleConstants.Admin
                        : user.RoleId == RoleSeedConstant.ExpertRoleId ? RoleConstants.Expert
                        : RoleConstants.User;
                }
            }

            // Số like = số phần tử trong danh sách, không cần counter riêng
            for (var i = 0; i < dtos.Count; i++)
            {
                // Bình luận đã ẩn: không trả nội dung ra ngoài
                if (dtos[i].IsHidden) dtos[i].CommentContent = string.Empty;

                dtos[i].LikeCount = comments[i].LikeByUserIds?.Count ?? 0;
                dtos[i].IsLiked = _currentUser.IsAuthen
                    && (comments[i].LikeByUserIds?.Contains(_currentUser.UserId) == true);
            }
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


        public async Task<CommentSentimentStatsDTO> GetProductSentimentStatsAsync(Guid productId)
        {
            var chuaCoNhan = await _context.Comments
        .Find(c => c.TargetId == productId
                && c.TargetType == TargetType.Product
                && !c.IsHidden
                && c.SentimentLabel == null)
        .ToListAsync();

            foreach (var comment in chuaCoNhan)
            {
                var label = await _mlService.PhanLoaiAsync(comment.CommentContent);
                if (label == null) continue; // API đang lỗi thì bỏ qua, lần sau thử lại
                await _context.Comments.UpdateOneAsync(
                    c => c.Id == comment.Id,
                    Builders<Comment>.Update.Set(c => c.SentimentLabel, label));
            }

            // Đếm thống kê trên các bình luận đã có nhãn
            var tatCaNhan = await _context.Comments
                .Find(c => c.TargetId == productId
                        && c.TargetType == TargetType.Product
                        && !c.IsHidden
                        && c.SentimentLabel != null)
                .Project(c => c.SentimentLabel)
                .ToListAsync();

            var stats = new CommentSentimentStatsDTO
            {
                Total = tatCaNhan.Count,
                PositiveCount = tatCaNhan.Count(l => l == "positive"),
                NegativeCount = tatCaNhan.Count(l => l == "negative"),
                NeutralCount = tatCaNhan.Count(l => l == "neutral"),
            };

            if (stats.Total > 0)
            {
                stats.PositivePercent = Math.Round(stats.PositiveCount * 100.0 / stats.Total, 2);
                stats.NegativePercent = Math.Round(stats.NegativeCount * 100.0 / stats.Total, 2);
                stats.NeutralPercent = Math.Round(stats.NeutralCount * 100.0 / stats.Total, 2);
            }

            return stats;
        }
    }
}
