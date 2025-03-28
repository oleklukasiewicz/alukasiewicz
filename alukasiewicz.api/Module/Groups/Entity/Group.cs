using alukasiewicz.api.Module.Groups.ResponseModel;
using alukasiewicz.api.Module.Posts.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace alukasiewicz.api.Module.Groups.Entity
{
    public class Group
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<Item> Items { get; set; }
        public List<Group> SubGroups { get; set; }
    }
    public class GroupEntityConfig : IEntityTypeConfiguration<Group>
    {
        public void Configure(EntityTypeBuilder<Group> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x => x.UpdatedAt).IsRequired(false);
            builder.Property(x => x.Name).IsRequired();
            //ignore
            builder.Ignore(x => x.Items);
            builder.Ignore(x => x.SubGroups);

            builder.ToTable("Groups");
        }
    }
    public static class GroupExtensions
    {
        public static GroupResponseModel ToResponseModel(this Group group, int depth = 2)
        {
            return new GroupResponseModel
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedAt = group.CreatedAt,
                UpdatedAt = group.UpdatedAt,
                Items = group.Items?.Select(x => x.ToListItemResponseModel()).ToList(),
                SubGroups = depth > 1 ? group.SubGroups?.Select(x => x.ToResponseModel(depth--)).ToList() : new List<GroupResponseModel>()
            };
        }
    }
}
