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
        public IMongoCollection<Category> Categories => _db.GetCollection<Category>("categories");
        public IMongoCollection<Product> Products => _db.GetCollection<Product>("products");
        public IMongoCollection<Specification> Specifications => _db.GetCollection<Specification>("specifications");
        public IMongoCollection<AuditLog> AuditLogs => _db.GetCollection<AuditLog>("audit_logs");
    }
}
