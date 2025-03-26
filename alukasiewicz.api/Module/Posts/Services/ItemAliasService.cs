using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Posts.Entity;
using alukasiewicz.api.Module.Posts.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace alukasiewicz.api.Module.Posts.Services
{
    public class ItemAliasService : IItemAliasService
    {
        private readonly BaseDbContext _context;
        public ItemAliasService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<ItemAlias> Get(Guid id)
        {
            return await _context.ItemAliases.FindAsync(id);
        }
        public async Task<List<ItemAlias>> GetByItemId(Guid itemId)
        {
            return await _context.ItemAliases.Where(x => x.ItemId == itemId).ToListAsync();
        }
        public async Task<ItemAlias> GetByValue(string value)
        {
            return await _context.ItemAliases.FirstOrDefaultAsync(x => x.Alias == value.ToLower());
        }
        public async Task<ItemAlias> Add(ItemAlias itemAlias)
        {
            itemAlias.Alias = itemAlias.Alias.ToLower();
            await _context.ItemAliases.AddAsync(itemAlias);
            await _context.SaveChangesAsync();
            return itemAlias;
        }
        public async Task<List<ItemAlias>> ValidateAndAdd(List<string> aliases, Guid itemId)
        {
            for (var i = 0; i < aliases.Count; i++)
            {
                var alias = aliases[i];
                var existing = await GetByValue(alias);
                if (existing != null)
                {
                    continue;
                }
                var itemAlias = new ItemAlias
                {
                    ItemId = itemId,
                    Alias = alias
                };
                var item = await Add(itemAlias);
            }
            var result = await GetByItemId(itemId);
            return result;
        }

        public async Task<bool> Remove(Guid id)
        {
            var item = await _context.ItemAliases.FindAsync(id);
            if (item == null)
            {
                return false;
            }
            _context.ItemAliases.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> RemoveByItemId(Guid itemId)
        {
            var items = await GetByItemId(itemId);
            if (items.Count == 0)
            {
                return false;
            }
            _context.ItemAliases.RemoveRange(items);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<ItemAlias>> Sync(List<string> aliases, Guid itemId)
        {
            var result = new List<ItemAlias>();
            var existing = await GetByItemId(itemId);

            var aliasesToLower = aliases.Select(x => x.ToLower()).ToList();
            for (var i = 0; i < existing.Count; i++)
            {
                var item = existing[i];
                if (aliasesToLower.Contains(item.Alias))
                {
                    continue;
                }
                await Remove(item.Id);
            }
            return await ValidateAndAdd(aliases, itemId);
        }
    }
}
