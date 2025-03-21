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
        public List<Group> Groups { get; set; }
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
            builder.Ignore(x => x.Groups);

            builder.ToTable("Groups");
        }
    }
}
