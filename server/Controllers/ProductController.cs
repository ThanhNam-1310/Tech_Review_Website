using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.Products;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController(IProductService product) : ControllerBase
    {
        private readonly IProductService _product = product;

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<ListProductDTO>>> GetAllProduct()
        {
            var result = await _product.GetAllProductAsync();
            return Ok(result);
        }

        [HttpGet("category/{id:guid}")]
        public async Task<ActionResult<IEnumerable<ListProductDTO>>> GetProductByCaterogyId(Guid id)
        {
            var result = await _product.GetProductByCategoryId(id);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ProductDTO>> GetProductById(Guid id)
        {
            var result = await _product.GetProductByIdAsync(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDTO dto)
        {
            var result = await _product.CreateProductAsync(dto);
            return Ok(result);
        }

        [HttpPatch("update/{id:guid}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDTO dto)
        {
            var result = await _product.UpdateProductAsync(id, dto);
            return Ok(result);
        }

        [HttpPatch("soft-delete/{id:guid}")]
        public async Task<IActionResult> SoftDeleteProduct(Guid id)
        {
            var result = await _product.SoftDeleteProductAsync(id);
            return Ok(result);
        }

        [HttpPatch("{id:guid}/revoke")]
        public async Task<IActionResult> RevokeSoftDeleteProduct(Guid id)
        {
            var result = await _product.RevokeSoftDeleteProductAsync(id);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var result = await _product.DeleteProductAsync(id);
            return Ok(result);
        }

    }
}
