using alukasiewicz.api.Module.Posts.Entity;
using alukasiewicz.api.Module.Resources.Model;

namespace alukasiewicz.api.Module.Posts.Model
{
    public class ItemModel
    {
        public Guid Id { get; set; }
        public List<string> Aliases { get; set; }
        public List<Guid> Groups { get; set; }
        public string Title { get; set; }
        public ResourceItemModel? TileImage { get; set; }
        public string Description { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsLink { get; set; }
        public bool IsPublished { get; set; }
    }
    public static class ItemModelExtensions
    {
        public static Item ToEntity(this ItemModel model)
        {
            return new Item
            {
                Id = model.Id,
                Aliases = model.Aliases,
                Groups = model.Groups,
                Title = model.Title,
                TileImageResourceId = model.TileImage?.Id,
                Description = model.Description,
                Content = model.Content,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
                IsLink = model.IsLink,
                IsPublished = model.IsPublished
            };
        }
    }
}
