using Microsoft.OpenApi;

namespace server.Configurations
{
    public static class SwaggerConfiguration
    {
        public static IServiceCollection AddSwaggerConfiguration(
            this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc(
                    "v1",
                    new OpenApiInfo
                    {
                        Title = "Tech Review API",
                        Version = "v1",
                        Description = "API for Tech Review Website"
                    });
            });

            return services;
        }
    }
}
