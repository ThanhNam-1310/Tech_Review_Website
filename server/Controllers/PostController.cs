using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Common.Exceptions;
using server.Common.Pagination;
using server.Common.Pagination.Query;
using server.Dtos.Posts;
using server.Services.Implements;
using server.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/post")]
    [ApiController]
    public class PostController(IPostService post) : ControllerBase
    {
        private readonly IPostService _post = post;

        // GET: api/post/all?pageNumber=1&pageSize=10&search=iphone
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPost(
            [FromQuery] PostQueryRequest request)
        {
            var result = await _post.GetAllPostAsync(request);
            return Ok(result);
        }

        // GET: api/post/category/{id}?pageNumber=1&pageSize=10
        [HttpGet("category/{id:guid}")]
        public async Task<IActionResult> GetAllPostByCategory(
            Guid id, [FromQuery] PageRequest request)
        {
            var result = await _post.GetPostByCategoryIdAsync(id, request);
            return Ok(result);
        }

        // GET: api/post/product/{id}?pageNumber=1&pageSize=10
        [HttpGet("product/{id:guid}")]
        public async Task<IActionResult> GetAllPostByProduct(
            Guid id, [FromQuery] PageRequest request)
        {
            var result = await _post.GetPostByProductIdAsync(id, request);
            return Ok(result);
        }

        // GET: api/post/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetDetailPost(Guid id)
        {
            var result = await _post.GetDetailPostById(id);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPosts([FromQuery] PageRequest request)
        {
            var result = await _post.GetPostByAuthorIdAsync(GetCurrentUserId(), request);
            return Ok(result);
        }

        // POST: api/post/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateNewPost(
            [FromBody] CreatePostDTO dto)
        {
            var result = await _post.CreatePostAsync(dto);
            return Ok(result);
        }

        [HttpPost("{id:guid}/upload/thumbnail")]
        public async Task<IActionResult> UploadThumbnail(IFormFile file, Guid id)
        {
            var imageUrl = await _post.UploadPostThumbnailAsync(file, id);

            return Ok(new { imageUrl });
        }

        [HttpPost("{id:guid}/upload/content-image")]
        public async Task<IActionResult> UploadContentImage(IFormFile file, Guid id)
        {
            var imageUrl = await _post.UploadPostContentImageAsync(file, id);

            return Ok(new { imageUrl });
        }

        // PATCH: api/post/update/{id}
        [HttpPatch("update/{id:guid}")]
        public async Task<IActionResult> UpdatePost(
            Guid id, [FromBody] UpdatePostDTO dto)
        {
            var result = await _post.UpdatePostAsync(id, dto);
            return Ok(result);
        }

        // PATCH: api/post/{id}/hero
        [HttpPatch("{id:guid}/hero")]
        public async Task<IActionResult> SetHeroPost(Guid id)
        {
            var result = await _post.SetHeroPostAsync(id);
            return Ok(result);
        }


        // DELETE: api/post/delete/{id}
        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var result = await _post.DeletePostAsync(id);
            return Ok(result);
        }

        // POST: api/post/{id}/view
        [HttpPost("{id:guid}/view")]
        public async Task<IActionResult> ViewPost(Guid id)
        {
            await _post.IncreaseViewCountAsync(id);
            return Ok();
        }

        // POST: api/post/{id}/like
        [HttpPost("{id:guid}/like")]
        public async Task<IActionResult> LikePost(Guid id)
        {
            await _post.TangLikeCountAsync(id);
            return Ok();
        }

        // DELETE: api/post/{id}/dislike
        [HttpDelete("{id:guid}/dislike")]
        public async Task<IActionResult> GiamLikePost(Guid id)
        {
            await _post.GiamLikeCountAsync(id);
            return Ok();
        }

        // POST: api/post/{id}/share
        [HttpPost("{id:guid}/share")]
        public async Task<IActionResult> SharedPost(Guid id)
        {
            await _post.IncreaseSharedCountAsync(id);
            return Ok();
        }

        // Lấy id của user đang đăng nhập từ JWT
        private Guid GetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            return Guid.TryParse(raw, out var id)
                ? id
                : throw new BadRequestException("Token không hợp lệ.");
        }
    }
}