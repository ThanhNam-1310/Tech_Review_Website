using AutoMapper;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using server.Common.Exceptions;
using server.Data;
using server.Dtos.Category;
using server.Models;
using server.Services.Interfaces;

namespace server.Services.Implements
{
    public class CategoryService(IMapper mapper, ILogger<CategoryService> logger, MongoDbContext context) : ICategoryService
    {
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<CategoryService> _logger = logger;
        private readonly MongoDbContext _context = context;

        // create
        public async Task<CategoryDTO> CreateCategotyAsync(CreateCategoryDTO dTO)
        {
            var category = new Category
            {
                NameCategory = dTO.Name,
                ParentId = dTO.ParentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            await _context.Categories.InsertOneAsync(category);

            _logger.LogInformation("Create new category successfully!");
            return _mapper.Map<CategoryDTO>(category);
        }

        // delete
        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _context.Categories.DeleteOneAsync(category => category.Id == id);

            if (category.DeletedCount == 0)
            {
                _logger.LogError("Not found category with ID: {id}", id);
                throw new NotFoundExcception("Not found category");
            }

            return true;
        }

        // get all
        public async Task<IEnumerable<CategoryDTO>> GetAllCategoryAsync()
        {
            var categories = await _context.Categories.Find(_ => true).ToListAsync();

            var result = _mapper.Map<IEnumerable<CategoryDTO>>(categories);

            foreach (var category in result)
            {
                if(category.ParentId != null)
                {
                    var parent = result.FirstOrDefault(x => x.Id == category.ParentId);
                    parent?.Children.Add(category);
                }
            }

            _logger.LogInformation("Get all information categories successfully!");
            return result.Where(x => x.ParentId == null);
        }

        // get by id
        public async Task<CategoryDTO> GetCategoryByIdAsync(Guid id)
        {
            var category = await _context.Categories.Find(x => x.Id == id).FirstOrDefaultAsync();

            if (category == null)
            {
                _logger.LogError("Category not found with ID {id}", id);
                throw new NotFoundExcception("Category not found. Get information category faild.");
            }

            return _mapper.Map<CategoryDTO>(category);
        }

        // update
        public async Task<CategoryDTO> UpdateCategoryAsync(Guid id, UpdateCategoryDTO dTO)
        {
            var category = await _context.Categories.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (category == null)
            {
                _logger.LogError("Category not found with ID {id}", id);
                throw new NotFoundExcception("Category not found.");
            }

            category.NameCategory = dTO.Name;
            category.ParentId = dTO.ParentId;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.Categories.ReplaceOneAsync(x => x.Id == id, category);

            _logger.LogInformation("Update success category.");

            return _mapper.Map<CategoryDTO>(category);
        }
    }
}
