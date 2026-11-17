namespace server.Services.Interfaces
{
    public interface IViewTrackingService
    {
        // true = lượt xem được tính, false = bỏ qua không được tính
        //
        bool TryRecordView(Guid postId, Guid authorId);
    }
}
