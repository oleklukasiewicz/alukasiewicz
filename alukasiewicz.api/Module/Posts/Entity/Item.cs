using alukasiewicz.api.Module.Posts.ResponseModel;
using alukasiewicz.api.Module.Resources.Entity;
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
        public ResourceItem TileImage { get; set; }
        public Guid? TileImageResourceId { get; set; }
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
            builder.Ignore(x => x.TileImage);
            builder.Ignore(x => x.Aliases);

            builder.ToTable("Posts");
        }
    }
    public static class ItemExtensions
    {
        public static ItemResponseModel ToResponseModel(this Item item)
        {
            return new ItemResponseModel
            {
                Id = item.Id,
                Aliases = item.Aliases,
                Groups = item.Groups,
                Title = item.Title,
                TileImageResourceId = item.TileImage?.Id,
                Description = item.Description,
                Content = item.Content,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                IsLink = item.IsLink,
                IsPublished = item.IsPublished
            };
        }
        public static ItemListItemResponseModel ToListItemResponseModel(this Item item)
        {
            return new ItemListItemResponseModel
            {
                Id = item.Id,
                Title = item.Title,
                TileImageResourceId = item.TileImageResourceId.Value,
                Description = item.Description,
                Href = item.IsLink ? item.Content : item.Id.ToString(),
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                IsLink = item.IsLink
            };
        }
    }
}
