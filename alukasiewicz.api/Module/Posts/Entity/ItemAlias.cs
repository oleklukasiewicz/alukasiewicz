using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace alukasiewicz.api.Module.Posts.Entity
{
    public class ItemAlias
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public string Alias { get; set; }
    }
    public class ItemAliasEntityConfig : IEntityTypeConfiguration<ItemAlias>
    {
        public void Configure(EntityTypeBuilder<ItemAlias> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.ItemId).IsRequired();
            builder.Property(x => x.Alias).IsRequired();

            builder.ToTable("PostsAliases");
        }
    }
}
