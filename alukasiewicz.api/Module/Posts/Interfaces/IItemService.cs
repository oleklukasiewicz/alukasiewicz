using alukasiewicz.api.Module.Posts.Entity;

namespace alukasiewicz.api.Module.Posts.Interfaces
{
    public interface IItemService
    {
        Task<Item> Add(Item item);
        Task<Item> Get(Guid itemId);
        Task<bool> Remove(Guid itemId);
        Task<Item> Update(Item item);
    }
}