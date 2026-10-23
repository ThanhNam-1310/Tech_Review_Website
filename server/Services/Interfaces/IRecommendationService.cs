using server.Dtos.Gioi_Thieu_Items;

namespace server.Services.Interfaces
{
    public interface IRecommendationService
    {
        Task<object> GetRecommendationsAsync(GioiThieuDTO request);
    }
}
