using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using server.Common.Exceptions;
using server.Common.Helper;
using server.Common.Pagination;
using server.Data;
using server.Dtos.Products;
using server.Models;
using server.Services.Interfaces;
using server.Storage;

namespace server.Services.Implements
{
    public class ProductService(MongoDbContext context, IMapper mapper, ILogger<ProductService> logger, IImageService imageService,
        IOptions<SupabaseSetting> options, ISpecificationService specification, ICurrentUserService currentUser) : IProductService
    {
        private readonly MongoDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<ProductService> _logger = logger;
        private readonly IImageService _imageService = imageService;
        private readonly SupabaseSetting _storage = options.Value;
        private readonly ISpecificationService _specication = specification;
        private readonly ICurrentUserService _currentUser = currentUser;

        // Lấy tất cả sản phẩm có phân trang
        public async Task<PageResult<ListProductDTO>> GetAllProductAsync(
            PageRequest request)
        {
            var query = _context.Products
                .AsQueryable()
                .Where(p => !p.IsDeleted);

            return await GetProductsAsync(query, request);
        }

        // Lấy sản phẩm theo danh mục
        public async Task<PageResult<ListProductDTO>> GetProductByCategoryIdAsync(
            Guid categoryId, PageRequest request)
        {
            var query = _context.Products
                .AsQueryable()
                .Where(p => p.CategoryId == categoryId && !p.IsDeleted);

            return await GetProductsAsync(query, request);
        }

        // Hàm dùng chung: tìm kiếm và phân trang
        private async Task<PageResult<ListProductDTO>> GetProductsAsync(
            IQueryable<Product> query, PageRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.Trim();

                query = query.Where(p =>
                    p.Name.Contains(keyword) ||
                    p.Description!.Contains(keyword) ||
                    p.Brand.Contains(keyword));
            }

            // Sản phẩm mới nhất trước
            query = query.OrderByDescending(p => p.CreatedAt);

            var page = await PaginationExtension.PageResultAsync(
                query, request);

            return new PageResult<ListProductDTO>
            {
                Items = _mapper.Map<List<ListProductDTO>>(page.Items),
                TotalCount = page.TotalCount,
                PageNumber = page.PageNumber,
                PageSize = page.PageSize
            };
        }

        // Lấy chi tiết sản phẩm
        public async Task<ProductDTO> GetProductByIdAsync(Guid id)
        {
            var product = await _context.Products
                .Find(p => p.Id == id && !p.IsDeleted)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Product not found");

            var result = _mapper.Map<ProductDTO>(product);

            // Lấy các specification mẫu theo CategoryId của product
            var specifications = await _context.Specifications
                .Find(s => s.CategoryId == product.CategoryId)
                .ToListAsync();

            // Trả về danh sách specification, chưa cần value
            result.Specifications = specifications
                .Select(s => new Product_SpecificationDTO
                {
                    SpecificationId = s.Id,
                    Name = s.Name,
                    Value = string.Empty
                })
                .ToList();


            return result;
        }

        // Tạo sản phẩm
        public async Task<ProductDTO> CreateProductAsync(CreateProductDTO dto)
        {
            if (!_currentUser.IsAuthen) throw new ForbiddenException("You need to log in to create a product.");

            var categoryExists = await _context.Categories.Find(c => c.Id == dto.CategoryId).AnyAsync();

            if (!categoryExists)
                throw new NotFoundExcception("Category not found");

            var specIds = dto.Specifications.Select(s => s.SpecificationId).ToList();

            var validSpecCount = await _context.Specifications.Find(s => s.CategoryId == dto.CategoryId && specIds.Contains(s.Id))
                .CountDocumentsAsync();

            if (validSpecCount != specIds.Distinct().Count()) throw new Exception("Invalid specifications");

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Brand = dto.Brand,
                CategoryId = dto.CategoryId,
                CreatedById = _currentUser.UserId,
                Price = dto.Price,
                ThumnaiUrl = string.Empty,
                ProductImagesUrl = [],

                Specifications = dto.Specifications.Select(s => new Product_Specification
                {
                    SpecificationId = s.SpecificationId,
                    Value = s.Value
                }).ToList()
            };

            await _context.Products.InsertOneAsync(product);

            _logger.LogInformation("Created product {ProductId}", product.Id);

            return _mapper.Map<ProductDTO>(product);
        }

        // Cập nhật sản phẩm
        public async Task<ProductDTO> UpdateProductAsync(
            Guid id, UpdateProductDTO dto)
        {
            var product = await _context.Products
                .Find(p => p.Id == id && !p.IsDeleted)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Product not found or deleted");

            if (dto.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories
                    .Find(c => c.Id == dto.CategoryId.Value)
                    .AnyAsync();

                if (!categoryExists)
                {
                    throw new NotFoundExcception("Category not found");
                }
            }

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;
            product.Brand = dto.Brand ?? product.Brand;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;
            product.Price = dto.Price ?? product.Price;
            product.ThumnaiUrl = dto.ThumnailUrl ?? product.ThumnaiUrl;
            product.ProductImagesUrl = dto.Images ?? product.ProductImagesUrl;

            if (dto.Specifications != null)
            {
                product.Specifications =
                    _mapper.Map<List<Product_Specification>>(
                        dto.Specifications);
            }

            product.UpdatedAt = DateTime.UtcNow;

            await _context.Products.ReplaceOneAsync(
                p => p.Id == id && !p.IsDeleted, product);

            _logger.LogInformation(
                "Updated product {ProductId}", id);

            return _mapper.Map<ProductDTO>(product);
        }

        // Xóa mềm sản phẩm
        public async Task<bool> SoftDeleteProductAsync(Guid id)
        {
            var update = Builders<Product>.Update
                .Set(p => p.IsDeleted, true)
                .Set(p => p.DeletedAt, DateTime.UtcNow)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);

            var result = await _context.Products.UpdateOneAsync(
                p => p.Id == id && !p.IsDeleted, update);

            if (result.MatchedCount == 0)
            {
                throw new NotFoundExcception(
                    "Product not found or already deleted");
            }

            return true;
        }

        // Khôi phục sản phẩm
        public async Task<bool> RevokeSoftDeleteProductAsync(Guid id)
        {
            var update = Builders<Product>.Update
                .Set(p => p.IsDeleted, false)
                .Set(p => p.DeletedAt, (DateTime?)null)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);

            var result = await _context.Products.UpdateOneAsync(
                p => p.Id == id && p.IsDeleted, update);

            if (result.MatchedCount == 0)
            {
                throw new NotFoundExcception(
                    "Product not found or not deleted");
            }

            return true;
        }

        // Xóa vĩnh viễn
        public async Task<bool> DeleteProductAsync(Guid id)
        {
            var result = await _context.Products.DeleteOneAsync(
                p => p.Id == id);

            if (result.DeletedCount == 0)
            {
                throw new NotFoundExcception("Product not found");
            }

            return true;
        }

        // upload ảnh đại diện chính
        public async Task<string> UploadProductThumbnailAsync(IFormFile file, Guid productId)
        {
            if (file == null || file.Length == 0)
                throw new BadRequestException("Vui lòng chọn ảnh thumbnail.");

            var product = await _context.Products
                .Find(p => p.Id == productId && !p.IsDeleted)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Product not found.");

            var newUrl = await _imageService.UploadAsync(
                file,
                _storage.Buckets.Products,
                $"{productId}/thumbnail");

            try
            {
                var result = await _context.Products.UpdateOneAsync(
                    p => p.Id == productId && !p.IsDeleted,
                    Builders<Product>.Update
                        .Set(p => p.ThumnaiUrl, newUrl)
                        .Set(p => p.UpdatedAt, DateTime.UtcNow));

                if (result.MatchedCount == 0)
                    throw new NotFoundExcception("Product not found.");
            }
            catch
            {
                try
                {
                    await _imageService.DeleteAsync(
                        _storage.Buckets.Products, newUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa thumbnail mới.");
                }

                throw;
            }

            if (!string.IsNullOrWhiteSpace(product.ThumnaiUrl))
            {
                try
                {
                    await _imageService.DeleteAsync(
                        _storage.Buckets.Products, product.ThumnaiUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa thumbnail cũ.");
                }
            }

            return newUrl;
        }

        // upload các ảnh khác cho product
        public async Task<string> UploadProductImageAsync(IFormFile file, Guid productId)
        {
            if (file == null || file.Length == 0)
                throw new BadRequestException("Vui lòng chọn ảnh sản phẩm.");

            var exists = await _context.Products
                .Find(p => p.Id == productId && !p.IsDeleted)
                .AnyAsync();

            if (!exists)
                throw new NotFoundExcception("Product not found.");

            var imageUrl = await _imageService.UploadAsync(
                file,
                _storage.Buckets.Products,
                $"{productId}/images");

            try
            {
                var result = await _context.Products.UpdateOneAsync(
                    p => p.Id == productId && !p.IsDeleted,
                    Builders<Product>.Update
                        .AddToSet(p => p.ProductImagesUrl, imageUrl)
                        .Set(p => p.UpdatedAt, DateTime.UtcNow));

                if (result.MatchedCount == 0)
                    throw new NotFoundExcception("Product not found.");
            }
            catch
            {
                try
                {
                    await _imageService.DeleteAsync(
                        _storage.Buckets.Products, imageUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa ảnh sản phẩm mới.");
                }

                throw;
            }

            return imageUrl;
        }

        // Tăng lượt xem
        public async Task IncreaseViewCountAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.ViewCount, 1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        // Tăng lượt thích
        public async Task TangLikeCountAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.LikeCount, 1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        // Giảm lượt thích
        public async Task GiamLikeCountAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.LikeCount, -1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        // Tăng lượt chia sẻ
        public async Task IncreaseSharedCountAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.SharedCount, 1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        // Tăng số bình luận
        public async Task TangCommentAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.CommentCount, 1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        // Giảm số bình luận
        public async Task GiamCommentAsync(Guid productId)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Rating.CommentCount, -1);

            await _context.Products.UpdateOneAsync(
                p => p.Id == productId && !p.IsDeleted, update);
        }

        public async Task<PageResult<ListProductDTO>> GetMyProductsAsync(PageRequest request)
        {
            if (!_currentUser.IsAuthen) throw new ForbiddenException("You need to log in to view your products.");

            // query
            IQueryable<Product> query = _context.Products.AsQueryable().Where(p => p.CreatedById == _currentUser.UserId);

            // Tìm kiếm không dấu — cùng cơ chế SearchText như list thường
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = TextSearch.NormalizeForSearch(request.Search);
                query = query.Where(p => p.SearchText.Contains(keyword));
            }

            // Sắp xếp
            var asc = string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            query = (request.SortBy ?? string.Empty).ToLower() switch
            {
                "price" => asc ? query.OrderBy(p => p.Price) : query.OrderByDescending(p => p.Price),
                "name" => asc ? query.OrderBy(p => p.Name) : query.OrderByDescending(p => p.Name),
                _ => asc ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt),
            };

            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return new PageResult<ListProductDTO>
            {
                Items = _mapper.Map<List<ListProductDTO>>(products),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
            };
        }
    }
}