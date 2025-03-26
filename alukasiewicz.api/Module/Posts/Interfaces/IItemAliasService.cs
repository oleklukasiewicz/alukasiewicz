using alukasiewicz.api.Module.Posts.Entity;

namespace alukasiewicz.api.Module.Posts.Interfaces
{
    public interface IItemAliasService
    {
        Task<ItemAlias> Add(ItemAlias itemAlias);
        Task<ItemAlias> Get(Guid id);
        Task<List<ItemAlias>> GetByItemId(Guid itemId);
        Task<ItemAlias> GetByValue(string value);
        Task<bool> Remove(Guid id);
        Task<bool> RemoveByItemId(Guid itemId);
        Task<List<ItemAlias>> Sync(List<string> aliases, Guid itemId);
        Task<List<ItemAlias>> ValidateAndAdd(List<string> aliases, Guid itemId);
    }
}