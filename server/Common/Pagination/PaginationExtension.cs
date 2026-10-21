using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace server.Common.Pagination
{
    public static class PaginationExtension
    {
        private const int MaxPageSize = 100;

        public static async Task<PageResult<T>> PageResultAsync<T>(
            IQueryable<T> query, PageRequest request)
        {
            var page = Math.Max(1, request.PageNumber);
            var pageSize = Math.Clamp(request.PageSize, 1, MaxPageSize);


            // total count
            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((int)Math.Min((long)(page - 1) * pageSize, int.MaxValue))
                .Take(pageSize)
                .ToListAsync();

            return new PageResult<T>
            {
                Items = items,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = (int)totalCount
            };
        }
    }
}
