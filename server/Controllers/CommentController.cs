using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("product/{productId}/sentiment-stats")]
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

        [HttpPost("add/post/{id:guid}")]
        public async Task<IActionResult> AddNewCommentPost(Guid id, [FromBody] CreateCommentDTO dto)
        {
            var result = await _comment.CreateCommentPostAsync(id, dto);
            return Ok(result);
        }

        [HttpPost("add/product/{id:guid}")]
        public async Task<IActionResult> AddNewCommentProduct(Guid id, [FromBody] CreateCommentDTO dto)
        {
            var result = await _comment.CreateCommentProductAsync(id, dto);
            return Ok(result);
        }

        [HttpPatch("update/{targetId:guid}")]
        public async Task<IActionResult> UpdateComment(Guid targetId, [FromBody] UpdateCommentDTO dto)
        {
            var result = await _comment.UpdateCommentAsync(targetId, dto);
            return Ok(result);
        }

        [HttpDelete("delete/{targetId:guid}")]
        public async Task<IActionResult> DeleteComment(Guid targetId)
        {
            var result = await _comment.DeleteCommentAsync(targetId);
            return Ok(result);
        }
    }
}
