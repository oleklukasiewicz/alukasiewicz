using alukasiewicz.api.Module.Groups.Entity;

namespace alukasiewicz.api.Module.Groups.Model
{
    public class GroupModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public static class GorupModelExtensions
    {
        public static Group ToEntity(this GroupModel group)
        {
            return new Group
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedAt = group.CreatedAt,
                UpdatedAt = group.UpdatedAt
            };
        }
    }
}
