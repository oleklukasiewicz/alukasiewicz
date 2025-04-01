using alukasiewicz.api.Module.Matchings.Entity;

namespace alukasiewicz.api.Module.Matchings.Model
{
    public class MatchingModel
    {
        public Guid Id { get; set; }
        public Guid EntityId { get; set; }
        public Guid GroupId { get; set; }
        public string Type { get; set; }
    }
    public static class MatchingModelExtensions
    {
        public static Matching ToEntity(this MatchingModel model)
        {
            return new Matching
            {
                Id = model.Id,
                EntityId = model.EntityId,
                GroupId = model.GroupId,
                Type = model.Type.ToLower() == "group" ? MatchingType.Group : MatchingType.Item
            };
        }
    }
}
