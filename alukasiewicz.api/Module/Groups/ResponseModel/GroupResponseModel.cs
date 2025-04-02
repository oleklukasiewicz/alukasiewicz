using alukasiewicz.api.Module.Groups.Entity;
using alukasiewicz.api.Module.Posts.ResponseModel;

namespace alukasiewicz.api.Module.Groups.ResponseModel
{
    public class GroupResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ItemListItemResponseModel> Items { get; set; }
        public List<GroupResponseModel> SubGroups { get; set; }
        public bool IsDefault { get; set; }
    }
}
