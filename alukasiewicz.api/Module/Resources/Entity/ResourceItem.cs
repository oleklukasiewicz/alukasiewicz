using alukasiewicz.api.Module.Resources.ResponseModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace alukasiewicz.api.Module.Resources.Entity
{
    public class ResourceItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
    }
    public class ResourceItemEntityConfig : IEntityTypeConfiguration<ResourceItem>
    {
        public void Configure(EntityTypeBuilder<ResourceItem> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Content).IsRequired();
            builder.Property(x => x.Type).IsRequired();
            builder.ToTable("Resources");
        }
    }
    public static class ResourceItemExtensions
    {
        public static ResourceItemResponseModel ToResponseModel(this ResourceItem item)
        {
            return new ResourceItemResponseModel
            {
                Id = item.Id,
                Name = item.Name,
                Content = item.Content,
                Type = item.Type
            };
        }

    }

}
