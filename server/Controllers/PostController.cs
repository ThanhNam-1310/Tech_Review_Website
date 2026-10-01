using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.Posts;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/post")]
    [ApiController]
    public class PostController(IPostService post) : ControllerBase
    {
        private readonly IPostService _post = post;

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPost()
        {
            var result = await _post.GetAllPostAsync();
            return Ok(result);
        }

        [HttpGet("category/{id:guid}")]
        public async Task<IActionResult> GetPostByCategory(Guid id)
        {
            var result = await _post.GetPostByCategoryIdAsync(id);
            return Ok(result);
        }

        [HttpGet("product/{id:guid}")]
        public async Task<IActionResult> GetPostByProduct(Guid id)
        {
            var result = await _post.GetPostByProductId(id);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetDetailPost(Guid id)
        {
            var result = await _post.GetDetailPostById(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateNewPost([FromBody] CreatePostDTO dto)
        {
            var result = await _post.CreatePostAsync(dto);
            return Ok(result);
        }

        [HttpPatch("update/{id:guid}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostDTO dto)
        {
            var result = await _post.UpdatePostAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var result = await _post.DeletePostAsync(id);
            return Ok(result);
        }
    }
}
