using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dtos.Specification;
using server.Services.Interfaces;

namespace server.Controllers
{
    [Route("api/specification")]
    [ApiController]
    public class SpecificationController(ISpecificationService spec) : ControllerBase
    {
        private readonly ISpecificationService _spec = spec;

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<SpecificationDTO>>> GetAllSpecification()
        {
            var result = await _spec.GetAllSpeciAsync();
            return Ok(result);
        }

        [HttpGet("/category/{categoryId:guid}")]
        public async Task<ActionResult<IEnumerable<SpecificationDTO>>> GetSpecificationByCategoryId(Guid categoryId)
        {
            var result = await _spec.GetByCategoryIdAsync(categoryId);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<ActionResult<SpecificationDTO>> CreateSpecification([FromBody] SpecificationCreateDTO dto)
        {
            var result = await _spec.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("update/{id:guid}")]
        public async Task<ActionResult<SpecificationDTO>> UpdateSpecification(Guid id, [FromBody] SpecificationUpdateDTO dto)
        {
            var result = await _spec.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteSpecification(Guid id)
        {
            var result = await _spec.DeleteAsync(id);
            return Ok(result);
        }
    }
}
