using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Common.Constants;
using server.Dtos.Comment;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/comment")]
    [ApiController]
    public class CommentController(ICommentService comment) : ControllerBase
    {
        private readonly ICommentService _comment = comment;

        [HttpGet("post/{id:guid}")]
        public async Task<IActionResult> GetAllCommentPost(Guid id)
        {
            var result = await _comment.GetCommentPostAsync(id);
            return Ok(result);
        }

        [HttpGet("product/{productId:guid}/sentiment-stats")]
        public async Task<IActionResult> GetProductSentimentStats(Guid productId)
        {
            var stats = await _comment.GetProductSentimentStatsAsync(productId);
            return Ok(stats);
        }

        [HttpGet("product/{id:guid}")]
        public async Task<IActionResult> GetAllCommentProduct(Guid id)
        {
            var result = await _comment.GetCommentProductAsync(id);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetDetailComment(Guid id)
        {
            var result = await _comment.GetDetailCommentAsync(id);
            return Ok(result);
        }

        [HttpPost("add/post/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> AddNewCommentPost(Guid id, [FromBody] CreateCommentDTO dto)
        {
            var result = await _comment.CreateCommentPostAsync(id, dto);
            return Ok(result);
        }

        [HttpPost("add/product/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> AddNewCommentProduct(Guid id, [FromBody] CreateCommentDTO dto)
        {
            var result = await _comment.CreateCommentProductAsync(id, dto);
            return Ok(result);
        }

        [HttpPatch("update/{commentId:guid}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] UpdateCommentDTO dto)
        {
            var result = await _comment.UpdateCommentAsync(commentId, dto);
            return Ok(result);
        }

        [HttpDelete("delete/{commentId:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var result = await _comment.DeleteCommentAsync(commentId);
            return Ok(result);
        }

        [HttpPost("{id:guid}/like")]
        [Authorize]
        public async Task<IActionResult> LikeComment(Guid id)
        {
            var (isLiked, likeCount) = await _comment.TangLikeCountAsync(id);
            return Ok(new { isLiked, likeCount });
        }

        [HttpDelete("{id:guid}/dislike")]
        [Authorize]
        public async Task<IActionResult> DislikeComment(Guid id)
        {
            var (isLiked, likeCount) = await _comment.GiamLikeCountAsync(id);
            return Ok(new { isLiked, likeCount });
        }

        [HttpPatch("hide/{id:guid}")]
        [Authorize(Policy = PermissionConstants.Comment.Hidden)]
        public async Task<IActionResult> HideComment(Guid id)
        {
            await _comment.HiddenCommentAsync(id);
            return Ok();
        }

        [HttpPatch("unhide/{id:guid}")]
        [Authorize(Policy = PermissionConstants.Comment.Hidden)]
        public async Task<IActionResult> UnHideComment(Guid id)
        {
            await _comment.UnHiddenCommentAsync(id);
            return Ok();
        }
    }
}
