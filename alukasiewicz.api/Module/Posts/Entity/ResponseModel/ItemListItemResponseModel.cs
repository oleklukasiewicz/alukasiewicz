namespace alukasiewicz.api.Module.Posts.Entity.ResponseModel
{
    public class ItemListItemResponseModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public Guid? TileImageResourceId { get; set; }
        public string Description { get; set; }
        public string Href { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsLink { get; set; }
    }
}
