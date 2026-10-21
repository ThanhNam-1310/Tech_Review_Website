using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Common.Pagination;
using server.Dtos.Products;
using server.Services.Implements;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController(IProductService product) : ControllerBase
    {
        private readonly IProductService _product = product;

        // GET: api/product/all?pageNumber=1&pageSize=10&search=iphone
        [HttpGet("all")]
        public async Task<IActionResult> GetAllProduct(
            [FromQuery] PageRequest request)
        {
            var result = await _product.GetAllProductAsync(request);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyProducts([FromQuery] PageRequest request)
        {
            var result = await _product.GetMyProductsAsync(request);
            return Ok(result);
        }

        // GET: api/product/category/{id}?pageNumber=1&pageSize=10
        [HttpGet("category/{id:guid}")]
        public async Task<IActionResult> GetProductByCategoryId(
            Guid id, [FromQuery] PageRequest request)
        {
            var result = await _product.GetProductByCategoryIdAsync(
                id, request);

            return Ok(result);
        }

        // GET: api/product/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var result = await _product.GetProductByIdAsync(id);
            return Ok(result);
        }

        // POST: api/product/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateProduct(
            [FromBody] CreateProductDTO dto)
        {
            var result = await _product.CreateProductAsync(dto);
            return Ok(result);
        }

        [HttpPost("{id:guid}/upload/thumbnail")]
        public async Task<IActionResult> UploadThumbnailBeforeCreate(IFormFile file, Guid id)
        {
            var imageUrl = await _product.UploadProductThumbnailAsync(file, id);
            return Ok(new { imageUrl });
        }

        [HttpPost("{id:guid}/upload/image")]
        public async Task<IActionResult> UploadImageBeforeCreate(IFormFile file, Guid id)
        {
            var imageUrl = await _product.UploadProductImageAsync(file, id);
            return Ok(new { imageUrl });
        }

        // PATCH: api/product/update/{id}
        [HttpPatch("update/{id:guid}")]
        public async Task<IActionResult> UpdateProduct(
            Guid id, [FromBody] UpdateProductDTO dto)
        {
            var result = await _product.UpdateProductAsync(id, dto);
            return Ok(result);
        }

        // PATCH: api/product/soft-delete/{id}
        [HttpPatch("soft-delete/{id:guid}")]
        public async Task<IActionResult> SoftDeleteProduct(Guid id)
        {
            var result = await _product.SoftDeleteProductAsync(id);
            return Ok(result);
        }

        // PATCH: api/product/{id}/restore
        [HttpPatch("{id:guid}/restore")]
        public async Task<IActionResult> RevokeSoftDeleteProduct(Guid id)
        {
            var result = await _product.RevokeSoftDeleteProductAsync(id);
            return Ok(result);
        }

        // DELETE: api/product/delete/{id}
        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var result = await _product.DeleteProductAsync(id);
            return Ok(result);
        }

        // POST: api/product/{id}/view
        [HttpPost("{id:guid}/view")]
        public async Task<IActionResult> ViewProduct(Guid id)
        {
            await _product.IncreaseViewCountAsync(id);
            return Ok();
        }

        // POST: api/product/{id}/like
        [HttpPost("{id:guid}/like")]
        public async Task<IActionResult> LikeProduct(Guid id)
        {
            await _product.TangLikeCountAsync(id);
            return Ok();
        }

        // DELETE: api/product/{id}/dislike
        [HttpDelete("{id:guid}/dislike")]
        public async Task<IActionResult> GiamLikeProduct(Guid id)
        {
            await _product.GiamLikeCountAsync(id);
            return Ok();
        }

        // POST: api/product/{id}/share
        [HttpPost("{id:guid}/share")]
        public async Task<IActionResult> SharedProduct(Guid id)
        {
            await _product.IncreaseSharedCountAsync(id);
            return Ok();
        }
    }
}