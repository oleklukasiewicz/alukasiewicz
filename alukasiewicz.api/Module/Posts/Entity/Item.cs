using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace alukasiewicz.api.Module.Posts.Entity
{
    public class Item
    {
        public Guid Id { get; set; }
        public List<string> Aliases { get; set; }
        public List<Guid> Groups { get; set; }
        public string Title { get; set; }
        public string TileImage { get; set; }
        public string Description { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsLink { get; set; }
        public bool IsPublished { get; set; }
    }
    public class ItemEntityConfig : IEntityTypeConfiguration<Item>
    {
        public void Configure(EntityTypeBuilder<Item> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x => x.UpdatedAt).IsRequired(false);
            builder.Property(x => x.Title).IsRequired();

            //ignore
            builder.Ignore(x => x.Groups);
            builder.Ignore(x => x.Aliases);

            builder.ToTable("Posts");
        }
    }
}
