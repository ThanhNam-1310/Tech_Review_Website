using server.Dtos.Products;

namespace server.Services.Interfaces
{
    public interface IProductService
    {
        // get all product
        Task<IEnumerable<ListProductDTO>> GetAllProductAsync();

        // lấy danh sách product của 1 category
        Task<IEnumerable<ListProductDTO>> GetProductByCategoryId(Guid categoryId);

        // get product by id
        Task<ProductDTO> GetProductByIdAsync(Guid id);

        // thêm mới product
        Task<ProductDTO> CreateProductAsync(CreateProductDTO dTO);

        // cập nhật product
        Task<ProductDTO> UpdateProductAsync(Guid id, UpdateProductDTO dTO);

        // xóa mềm product
        Task<bool> SoftDeleteProductAsync(Guid id);

        // khôi phục
        Task<bool> RevokeSoftDeleteProductAsync(Guid id);

        // xóa product
        Task<bool> DeleteProductAsync(Guid id);

        //rating
        Task IncreaseViewCountAsync(Guid productId);
        Task TangLikeCountAsync(Guid productId);
        Task GiamLikeCountAsync(Guid productId);
        Task IncreaseSharedCountAsync(Guid productId);
        Task TangCommentAsync(Guid productId);
        Task GiamCommentAsync(Guid productId);
    }
}
