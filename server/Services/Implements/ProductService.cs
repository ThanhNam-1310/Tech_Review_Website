using AutoMapper;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using server.Common.Constants;
using server.Common.Enums;
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

            var products = page.Items.ToList();
            var items = _mapper.Map<List<ListProductDTO>>(products);

            // Số bình luận đếm trực tiếp cho cả trang trong 1 query
            var commentCounts = await GetCommentCountsAsync(products.Select(p => p.Id));
            var expertIds = await GetExpertCreatedProductIdsAsync(products);
            for (var i = 0; i < items.Count; i++)
            {
                items[i].CommentCount = commentCounts.GetValueOrDefault(products[i].Id, 0);
                items[i].IsCreatedByExpert = expertIds.Contains(products[i].Id);
            }


            return new PageResult<ListProductDTO>
            {
                Items = items,
                TotalCount = page.TotalCount,
                PageNumber = page.PageNumber,
                PageSize = page.PageSize
            };
        }

        // Đếm bình luận cho 1 danh sách product trong 1 query, loại bình luận đã ẩn
        private async Task<Dictionary<Guid, int>> GetCommentCountsAsync(IEnumerable<Guid> productIds)
        {
            var ids = productIds.ToList();
            if (ids.Count == 0) return new Dictionary<Guid, int>();

            var grouped = await _context.Comments.Aggregate()
                .Match(c => ids.Contains(c.TargetId)
                    && c.TargetType == TargetType.Product && !c.IsHidden)
                .Group(c => c.TargetId, g => new { ProductId = g.Key, Count = g.Count() })
                .ToListAsync();

            return grouped.ToDictionary(x => x.ProductId, x => x.Count);
        }

        // Id của các product do chuyên gia tạo trong 1 trang, để gắn badge
        private async Task<HashSet<Guid>> GetExpertCreatedProductIdsAsync(List<Product> products)
        {
            var creatorIds = products.Select(p => p.CreatedById).Distinct().ToList();
            if (creatorIds.Count == 0) return [];

            var expertCreatorIds = await _context.Users
                .Find(u => creatorIds.Contains(u.Id) && u.RoleId == RoleSeedConstant.ExpertRoleId)
                .Project(u => u.Id)
                .ToListAsync();
            var expertSet = expertCreatorIds.ToHashSet();

            return products.Where(p => expertSet.Contains(p.CreatedById)).Select(p => p.Id).ToHashSet();
        }


        // Lấy chi tiết sản phẩm
        public async Task<ProductDTO> GetProductByIdAsync(Guid id)
        {
            var product = await _context.Products
                .Find(p => p.Id == id && !p.IsDeleted)
                .FirstOrDefaultAsync()
                ?? throw new NotFoundExcception("Product not found");

            var result = _mapper.Map<ProductDTO>(product);

            // Số bình luận đếm trực tiếp, luôn đúng và loại bình luận đã ẩn
            if (result.Rating != null)
                result.Rating.CommentCount = (int)await _context.Comments.CountDocumentsAsync(
                    c => c.TargetId == id && c.TargetType == TargetType.Product && !c.IsHidden);

            // Badge "Chuyên gia bình chọn": người tạo có role expert không
            var expertIds = await GetExpertCreatedProductIdsAsync([product]);
            result.IsCreatedByExpert = expertIds.Contains(product.Id);

            // Lấy các specification mẫu theo CategoryId của product
            var specifications = await _specication.GetByCategoryIdAsync(product.CategoryId);

            // Value mà product đã lưu khi tạo, tra theo SpecificationId
            var valueById = product.Specifications.ToDictionary(s => s.SpecificationId, s => s.Value);

            // Trả về danh sách specification, chưa cần value
            result.Specifications = specifications
                .Select(s => new Product_SpecificationDTO
                {
                    SpecificationId = s.Id,
                    Name = s.Name ?? string.Empty,
                    Value = valueById.TryGetValue(s.Id, out var value) ? value : string.Empty
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

            var validSpecIds = (await _specication.GetByCategoryIdAsync(dto.CategoryId)).Select(s => s.Id).ToList();

            if (dto.Specifications.Any(s => !validSpecIds.Contains(s.SpecificationId)))
                throw new Exception("Invalid specifications");

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Brand = dto.Brand,
                SearchText = TextSearch.NormalizeForSearch(dto.Name + " " + (dto.Description ?? string.Empty) + " " + dto.Brand),
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
            product.SearchText = TextSearch.NormalizeForSearch(product.Name + " " + (product.Description ?? string.Empty) + " " + product.Brand);
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

            var items = _mapper.Map<List<ListProductDTO>>(products);

            // Số bình luận đếm trực tiếp cho cả trang trong 1 query
            var commentCounts = await GetCommentCountsAsync(products.Select(p => p.Id));
            var expertIds = await GetExpertCreatedProductIdsAsync(products);
            for (var i = 0; i < items.Count; i++)
            {
                items[i].CommentCount = commentCounts.GetValueOrDefault(products[i].Id, 0);
                items[i].IsCreatedByExpert = expertIds.Contains(products[i].Id);
            }


            return new PageResult<ListProductDTO>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
            };
        }

        public async Task<PageResult<ListProductDTO>> GetProductsByUserAsync(Guid userId, PageRequest request)
        {
            // query — chỉ lấy sản phẩm đang hiện của người này
            IQueryable<Product> query = _context.Products.AsQueryable()
                .Where(p => p.CreatedById == userId && !p.IsDeleted);

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

            var items = _mapper.Map<List<ListProductDTO>>(products);

            // Số bình luận đếm trực tiếp cho cả trang trong 1 query
            var commentCounts = await GetCommentCountsAsync(products.Select(p => p.Id));
            var expertIds = await GetExpertCreatedProductIdsAsync(products);
            for (var i = 0; i < items.Count; i++)
            {
                items[i].CommentCount = commentCounts.GetValueOrDefault(products[i].Id, 0);
                items[i].IsCreatedByExpert = expertIds.Contains(products[i].Id);
            }


            return new PageResult<ListProductDTO>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
            };
        }
    }
}
