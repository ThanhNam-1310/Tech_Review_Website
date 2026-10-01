using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.PostContents;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/post-content")]
    [ApiController]
    public class PostContentController(IPostContentService postContent) : ControllerBase
    {
        private readonly IPostContentService _postContent = postContent;

        [HttpGet("post/{id:guid}")]
        public async Task<IActionResult> GetContentPostId(Guid id)
        {
            var result = await _postContent.GetAllByPostIdAsync(id);
            return Ok(result);

        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateNewContent(Guid id, [FromBody] CreatePostContentDTO dto)
        {
            var result = await _postContent.CreateContentAsync(id, dto);
            return Ok(result);
        }

        [HttpPatch("update/{id:guid}/post/{postId:guid}")]
        public async Task<IActionResult> UpdateContent(Guid id, Guid postId, [FromBody] UpdatePostContentDTO dto)
        {
            var result = await _postContent.UpdateContentAsync(id, postId, dto);
            return Ok(result);
        }

        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> DeleteContent(Guid id, Guid postId)
        {
            var result = await _postContent.DeleteContentAsync(id, postId);
            return Ok(result);
        }
    }
}
