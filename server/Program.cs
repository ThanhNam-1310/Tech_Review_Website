using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using Serilog;
using Serilog.Events;
using server.Configurations;
using server.Data;
using server.Data.Seeder;
using server.Middleware;
using server.Models;
using server.Services.Implements;
using server.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ==============================
// Serilog
// ==============================

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting Tech Review API...");

    // ==============================
    // MongoDB
    // ==============================

    var mongoSetting = builder.Configuration
        .GetSection("MongoDB")
        .Get<MongoDbSetting>()
        ?? throw new InvalidOperationException(
            "MongoDB is not configured!");

    // Configure Guid serialization for MongoDB
    BsonSerializer.RegisterSerializer(
        new GuidSerializer(GuidRepresentation.Standard));

    builder.Services.AddSingleton(
        new MongoDbContext(mongoSetting));

    // JWT
    builder.Services.AddJwtAuthencation(builder.Configuration);

    // ==============================
    // AutoMapper
    // ==============================

    builder.Services.AddAutoMapper(cfg => { }, typeof(Program));

    // ==============================
    // Controllers
    // ==============================

    builder.Services.AddControllers();

    // ==============================
    // Swagger
    // ==============================

    builder.Services.AddSwaggerConfiguration();

    // ==============================
    // Services
    // ==============================
    builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<ISpecificationService, SpecificationService>();
    builder.Services.AddScoped<IProductService, ProductService>();
    builder.Services.AddScoped<IPostContentService, PostContentService>();
    builder.Services.AddScoped<IPostService, PostService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IRoleService, RoleService>();

    var app = builder.Build();
    // Seeder
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider
            .GetRequiredService<MongoDbContext>();

        await RoleSeeder.SeedRoleAsync(context);
    }

    // ==============================
    // Middleware
    // ==============================

    app.UseMiddleware<ExceptionMiddleawre>();

    // ==============================
    // Swagger
    // ==============================

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();

        app.UseSwaggerUI(p =>
        {
            p.SwaggerEndpoint(
                "/swagger/v1/swagger.json",
                "Tech Review API V1");

            p.RoutePrefix = string.Empty;
        });
    }

    // ==============================
    // Request Logging
    // ==============================

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate =
            "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";

        options.GetLevel = (httpContext, elapsed, ex) =>
            ex == null
                ? LogEventLevel.Information
                : LogEventLevel.Error;
    });

    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // ==============================
    // Application Started
    // ==============================

    app.Lifetime.ApplicationStarted.Register(() =>
    {
        foreach (var url in app.Urls)
        {
            Log.Information("Swagger UI: {SwaggerUrl}", url);
        }

        Log.Information("Tech Review API started successfully.");
    });

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Tech Review API terminated unexpectedly.");
    //Console.WriteLine(ex.ToString());
    //throw;
}
finally
{
    Log.CloseAndFlush();
}