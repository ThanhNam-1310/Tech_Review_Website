using server.Dtos.Category;

namespace server.Services.Interfaces
{
    public interface ICategoryService
    {
        // get all
        Task<IEnumerable<CategoryDTO>> GetAllCategoryAsync();

        // get by id
        Task<CategoryDTO> GetCategoryByIdAsync(Guid id);

        // create
        Task<CategoryDTO> CreateCategotyAsync(CreateCategoryDTO dTO);

        // update
        Task<CategoryDTO> UpdateCategoryAsync(Guid id, UpdateCategoryDTO dTO);

        // delete
        Task<bool> DeleteCategoryAsync(Guid id);
    }
}
