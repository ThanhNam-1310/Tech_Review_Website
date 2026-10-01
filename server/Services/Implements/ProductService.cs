using AutoMapper;
using MongoDB.Driver;
using server.Data;
using server.Dtos.Products;
using server.Models;
using server.Services.Interfaces;
using server.Common.Exceptions;

namespace server.Services.Implements
{
    public class ProductService(MongoDbContext context, IMapper mapper, ILogger<ProductService> logger) : IProductService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<ProductService> _logger = logger;

        // create
        public async Task<ProductDTO> CreateProductAsync(CreateProductDTO dTO)
        {
            var categoryCheck = await _context.Categories.Find(c => c.Id == dTO.CategoryId).AnyAsync();
            if (!categoryCheck)
            {
                throw new NotFoundExcception("Not found category");
            }

            var product = new Product
            {
                Name = dTO.Name,
                Description = dTO.Description,
                Brand = dTO.Brand,
                CategoryId = dTO.CategoryId,
                Price = dTO.Price,
                ThumnaiUrl = dTO.ThumnailUrl,
                ProductImagesUrl = dTO.Images
            };

            var result = _mapper.Map<ProductDTO>(product);

            await _context.Products.InsertOneAsync(product);
            _logger.LogInformation("Created product {ProductId}", product.Id);

            return result;
        }

        // delete
        public async Task<bool> DeleteProductAsync(Guid id)
        {
            var productCheck = await _context.Products.Find(p => p.Id == id && !p.IsDeleted).AnyAsync();
            if (!productCheck)
            {
                throw new NotFoundExcception("Product not found");
            }

            await _context.Products.DeleteOneAsync(p => p.Id == id && !p.IsDeleted);
            return true;
        }

        // get all
        public async Task<IEnumerable<ListProductDTO>> GetAllProductAsync()
        {
            var products = await _context.Products.Find(_=> true).ToListAsync();

            return _mapper.Map<IEnumerable<ListProductDTO>>(products);
        }

        // get theo category
        public async Task<IEnumerable<ListProductDTO>> GetProductByCategoryId(Guid categoryId)
        {
            var product = await _context.Products.Find(p => p.CategoryId == categoryId && !p.IsDeleted).ToListAsync();

            return _mapper.Map<IEnumerable<ListProductDTO>>(product);
        }

        // get detail
        public async Task<ProductDTO> GetProductByIdAsync(Guid id)
        {
            var product = await _context.Products.Find(p => p.Id == id && !p.IsDeleted).FirstOrDefaultAsync();

            if (product == null)
            {
                _logger.LogInformation("Get faild information product with ID: {id}", id);
                throw new BadRequestException("Not found product.");
            }

            return _mapper.Map<ProductDTO>(product);
        }

        // khôi phục xóa mềm
        public async Task<bool> RevokeSoftDeleteProductAsync(Guid id)
        {
            var update = Builders<Product>.Update
                .Set(p => p.IsDeleted, false)
                .Set(p => p.DeletedAt, null)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);

            var result = await _context.Products.UpdateOneAsync(
                p => p.Id == id && p.IsDeleted,
                update
            );

            if (result.MatchedCount == 0)
                throw new NotFoundExcception("Product not found or not deleted");

            return true;
        }

        // xóa mềm
        public async Task<bool> SoftDeleteProductAsync(Guid id)
        {
            var update = Builders<Product>.Update.Set(p => p.IsDeleted, true)
                .Set(p => p.DeletedAt, DateTime.UtcNow)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);

            var result = await _context.Products.UpdateOneAsync(p => p.Id == id && !p.IsDeleted, update);
            if (result.MatchedCount == 0)
                throw new NotFoundExcception("Product not found or deleted");

            return true;
        }

        // update
        public async Task<ProductDTO> UpdateProductAsync(Guid id, UpdateProductDTO dTO)
        {
            var product = await _context.Products.Find(p => p.Id == id && !p.IsDeleted).FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Product not found or deleted");

            //update
            product.Name = dTO.Name ?? product.Name;
            product.Description = dTO.Description ?? product.Description;
            product.Brand = dTO.Brand ?? product.Brand;
            product.CategoryId = dTO.CategoryId ?? product.CategoryId;
            product.Price = dTO.Price ?? product.Price;
            product.ThumnaiUrl = dTO.ThumnailUrl ?? product.ThumnaiUrl;
            product.ProductImagesUrl = dTO.Images ?? product.ProductImagesUrl;
            if (dTO.Specifications != null)
            {
                product.Specifications = _mapper.Map<List<Product_Specification>>(dTO.Specifications);
            }
            product.UpdatedAt = DateTime.UtcNow;

            await _context.Products.ReplaceOneAsync(p => p.Id == id && !p.IsDeleted, product);

            return _mapper.Map<ProductDTO>(product);
        }
    }
}
