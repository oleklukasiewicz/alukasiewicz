using alukasiewicz.api.Module.Groups.Entity;
using alukasiewicz.api.Module.Matchings.Entity;
using alukasiewicz.api.Module.Posts.Entity;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace alukasiewicz.api.Database
{
    public class BaseDbContext:DbContext
    {
        //public DbSet<Item> Items { get; set; }
        //public DbSet<ItemAlias> ItemAliases { get; set; }
        //public DbSet<Group> Groups { get; set; }
        //public DbSet<Matching> Matchings { get; set; }

        public BaseDbContext(DbContextOptions<BaseDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
