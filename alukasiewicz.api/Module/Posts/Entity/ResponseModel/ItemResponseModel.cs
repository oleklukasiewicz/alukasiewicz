using alukasiewicz.api.Module.Resources.Model;

namespace alukasiewicz.api.Module.Posts.Entity.ResponseModel
{
    public class ItemResponseModel
    {
        public Guid Id { get; set; }
        public List<string> Aliases { get; set; }
        public List<Guid> Groups { get; set; }
        public string Title { get; set; }
        public Guid? TileImageResourceId { get; set; }
        public string Description { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsLink { get; set; }
        public bool IsPublished { get; set; }
    }
}
