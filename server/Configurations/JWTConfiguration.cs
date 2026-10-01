using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;

namespace server.Configurations
{
    public static class JWTConfiguration
    {
        public static IServiceCollection AddJwtAuthencation(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(option =>
            {
                option.TokenValidationParameters =
                        new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,

                            ValidIssuer =
                                configuration["JWT:Issuer"],

                            ValidAudience =
                                configuration["JWT:Audience"],

                            IssuerSigningKey =
                                new SymmetricSecurityKey(
                                    Encoding.UTF8.GetBytes(
                                        configuration["JWT:Key"]!)),

                            ClockSkew = TimeSpan.Zero
                        };
                option.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        context.Token = context.Request.Cookies["jwt_token"];
                        return Task.CompletedTask;
                    }
                };
            });
            services.AddAuthorization();

            return services;
        }
    }
}
