using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.Category;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/categories")]
    [ApiController]
    public class CategoryController(ICategoryService category) : ControllerBase
    {
        private readonly ICategoryService _category = category;

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetAllCategory()
        {
            var result = await _category.GetAllCategoryAsync();
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CategoryDTO>> GetCategoryById(Guid id)
        {
            var result = await _category.GetCategoryByIdAsync(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<ActionResult<CategoryDTO>> CreateCategory([FromBody] CreateCategoryDTO dto)
        {
            var result = await _category.CreateCategotyAsync(dto);
            return Ok(result);
        }

        [HttpPut("update/{id:guid}")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategory(Guid id, [FromBody] UpdateCategoryDTO dto)
        {
            var result = await _category.UpdateCategoryAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("delete/{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var result = await _category.DeleteCategoryAsync(id);
            return Ok(result);
        }
    }
}
