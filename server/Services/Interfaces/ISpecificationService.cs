using server.Dtos.Products;
using server.Dtos.Specification;

namespace server.Services.Interfaces
{
    public interface ISpecificationService
    {
        // get all
        Task<IEnumerable<SpecificationDTO>> GetAllSpeciAsync();

        // get by category id
        Task<IEnumerable<SpecificationDTO>> GetByCategoryIdAsync(Guid categoryId);

        // tạo mới
        Task<SpecificationDTO> CreateAsync(SpecificationCreateDTO dto);

        // update
        Task<SpecificationDTO> UpdateAsync(Guid id, SpecificationUpdateDTO dto);

        // xóa theo id
        Task<bool> DeleteAsync(Guid id);
    }
}
