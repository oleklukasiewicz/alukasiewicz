using alukasiewicz.api.Module.Resources.Entity;

namespace alukasiewicz.api.Module.Resources.Model
{
    public class ResourceItemModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
    }
    public static class ResourceItemModelExtensions
    {
        public static ResourceItem ToEntity(this ResourceItemModel model)
        {
            return new ResourceItem
            {
                Id = model.Id,
                Name = model.Name,
                Content = model.Content,
                Type = model.Type
            };
        }
    }

}
