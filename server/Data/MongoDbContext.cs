using MongoDB.Driver;
using server.Models;
using server.Models.Audit;

namespace server.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _db;

        public MongoDbContext(MongoDbSetting setting)
        {
            var client = new MongoClient(setting.ConectionString);

            // database
            _db = client.GetDatabase(setting.DatabaseName);
        }


        // Collection db
        public IMongoCollection<User> Users => _db.GetCollection<User>("users");
        public IMongoCollection<RefreshToken> RefreshTokens => _db.GetCollection<RefreshToken>("refresh_tokens");
        public IMongoCollection<Role> Roles => _db.GetCollection<Role>("roles");
        public IMongoCollection<Category> Categories => _db.GetCollection<Category>("categories");
        public IMongoCollection<Product> Products => _db.GetCollection<Product>("products");
        public IMongoCollection<Specification> Specifications => _db.GetCollection<Specification>("specifications");
        public IMongoCollection<Post> Posts => _db.GetCollection<Post>("posts");
        public IMongoCollection<PostContent> PostContents => _db.GetCollection<PostContent>("post_contents");
        public IMongoCollection<AuditLog> AuditLogs => _db.GetCollection<AuditLog>("audit_logs");
    }
}
