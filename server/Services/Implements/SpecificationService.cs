using AutoMapper;
using MongoDB.Driver;
using server.Data;
using server.Dtos.Specification;
using server.Models;
using server.Services.Interfaces;
using server.Common.Exceptions;

namespace server.Services.Implements
{
    public class SpecificationService(IMapper mapper, ILogger<SpecificationService> logger, MongoDbContext context) : ISpecificationService
    {
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<SpecificationService> _logger = logger;
        private readonly MongoDbContext _context = context;

        // create
        public async Task<SpecificationDTO> CreateAsync(SpecificationCreateDTO dto)
        {
            var exists = await _context.Specifications.Find(s => s.CategoryId == dto.CategoryId && s.Name == dto.Name).AnyAsync();

            if (exists)
            {
                throw new ConflictCustomException("Specification already exists");
            }
            var specification = new Specification
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                DisplayOrder = dto.DisplayOrder,
                UpdatedAt = null
            };
            var result = _mapper.Map<SpecificationDTO>(specification);

            await _context.Specifications.InsertOneAsync(specification);
            _logger.LogInformation("Create new specification for category ID: {cateId}", dto.CategoryId);

            return result;
        }

        // delete
        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _context.Specifications.DeleteOneAsync(s => s.Id == id);

            return result.DeletedCount > 0;
        }

        public async Task<IEnumerable<SpecificationDTO>> GetAllSpeciAsync()
        {
            var specifications = await _context.Specifications.Find(_ => true)
                .SortBy(x => x.DisplayOrder).ToListAsync();

            return _mapper.Map<IEnumerable<SpecificationDTO>>(specifications);
        }

        public async Task<IEnumerable<SpecificationDTO>> GetByCategoryIdAsync(Guid categoryId)
        {
            var specification = await _context.Specifications.Find(s => s.CategoryId == categoryId)
                .SortBy(s => s.DisplayOrder).ToListAsync();

            return _mapper.Map<IEnumerable<SpecificationDTO>>(specification);
        }

        // update
        public async Task<SpecificationDTO> UpdateAsync(Guid id, SpecificationUpdateDTO dto)
        {
            var specification = await _context.Specifications.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (specification == null)
            {
                _logger.LogError("Not found specification ID: {id}", id);
                throw new NotFoundExcception("Not found specification"); 
            }

            if (dto.Name != null) 
                specification.Name = dto.Name;
            if (dto.CategoryId.HasValue)
                specification.CategoryId = dto.CategoryId.Value;
            if (dto.DisplayOrder.HasValue)
                specification.DisplayOrder = dto.DisplayOrder.Value;

            specification.UpdatedAt = DateTime.UtcNow;

            await _context.Specifications.ReplaceOneAsync(s => s.Id == id, specification);

            _logger.LogInformation("Updated specification ID: {id}", id);

            return _mapper.Map<SpecificationDTO>(specification);
        }
    }
}
