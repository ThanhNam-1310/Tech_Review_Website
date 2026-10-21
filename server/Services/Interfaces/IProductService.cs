using server.Common.Pagination;
using server.Dtos.Products;

namespace server.Services.Interfaces
{
    public interface IProductService
    {
        // Lấy tất cả sản phẩm có phân trang
        Task<PageResult<ListProductDTO>> GetAllProductAsync(PageRequest request);

        // Lấy sản phẩm theo danh mục có phân trang
        Task<PageResult<ListProductDTO>> GetProductByCategoryIdAsync(
            Guid categoryId, PageRequest request);

        // lấy danh sách sản phẩm mà user đã tạo
        Task<PageResult<ListProductDTO>> GetMyProductsAsync(PageRequest request);

        // Chi tiết sản phẩm
        Task<ProductDTO> GetProductByIdAsync(Guid id);

        // Thêm sản phẩm
        Task<ProductDTO> CreateProductAsync(CreateProductDTO dto);

        // Cập nhật sản phẩm
        Task<ProductDTO> UpdateProductAsync(Guid id, UpdateProductDTO dto);

        // Xóa mềm
        Task<bool> SoftDeleteProductAsync(Guid id);

        // Khôi phục sản phẩm
        Task<bool> RevokeSoftDeleteProductAsync(Guid id);

        // Xóa vĩnh viễn
        Task<bool> DeleteProductAsync(Guid id);

        // upload ảnh
        Task<string> UploadProductThumbnailAsync(IFormFile file, Guid productId);
        Task<string> UploadProductImageAsync(IFormFile file, Guid productId);

        // Rating
        Task IncreaseViewCountAsync(Guid productId);
        Task TangLikeCountAsync(Guid productId);
        Task GiamLikeCountAsync(Guid productId);
        Task IncreaseSharedCountAsync(Guid productId);
        Task TangCommentAsync(Guid productId);
        Task GiamCommentAsync(Guid productId);
    }
}