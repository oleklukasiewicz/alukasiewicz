using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace alukasiewicz.api.Module.Matchings.Entity
{
    public enum MatchingType
    {
        Group,
        Item
    }
    public class Matching
    {
        public Guid Id { get; set; }
        public Guid EntityId { get; set; }
        public Guid GroupId { get; set; }
        public MatchingType Type { get; set; }
    }
    public class MatchingEntityConfig : IEntityTypeConfiguration<Matching>
    {
        public void Configure(EntityTypeBuilder<Matching> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.EntityId).IsRequired();
            builder.Property(x => x.GroupId).IsRequired();
            builder.Property(x => x.Type).IsRequired();
            builder.ToTable("Matchings");
        }
    }
}
