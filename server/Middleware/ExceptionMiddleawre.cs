using server.Common.Exceptions;
using System.Text.Json;

namespace server.Middleware
{
    public class ExceptionMiddleawre(RequestDelegate next, ILogger<ExceptionMiddleawre> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<ExceptionMiddleawre> _logger = logger;

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred.");

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = exception switch
            {
                BaseException appException =>
                    appException.StatusCode,

                _ => StatusCodes.Status500InternalServerError
            };

            var response = new
            {
                statusCode,
                message = exception.Message
            };

            context.Response.ContentType =
                "application/json";

            context.Response.StatusCode = statusCode;

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}
