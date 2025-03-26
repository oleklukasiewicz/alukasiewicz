using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Posts.Entity;
using alukasiewicz.api.Module.Posts.Interfaces;
using alukasiewicz.api.Module.Resources.Interfaces;

namespace alukasiewicz.api.Module.Posts.Services
{
    public class ItemService : IItemService
    {
        private readonly BaseDbContext _context;
        private readonly IResourcesService _resourceService;
        private readonly IItemAliasService _aliasService;

        public ItemService(BaseDbContext context, IResourcesService resourceService, IItemAliasService itemAliasService)
        {
            _context = context;
            _resourceService = resourceService;
            _aliasService = itemAliasService;
        }
        public async Task<Item> Add(Item item)
        {
            //tile image
            if (item.TileImage != null)
            {
                var tileImageResource = await _resourceService.Get(item.TileImageResourceId.Value);
                if (tileImageResource == null)
                {
                    var newResource = await _resourceService.Add(item.TileImage);
                    item.TileImageResourceId = newResource.Id;
                }
            }
            await _context.Items.AddAsync(item);
            await _context.SaveChangesAsync();

            //aliases
            await _aliasService.Sync(item.Aliases, item.Id);

            return item;
        }
        public async Task<bool> Remove(Guid itemId)
        {
            var item = await _context.Items.FindAsync(itemId);
            if (item == null)
            {
                return false;
            }

            //remove tileimage
            if (item.TileImageResourceId.HasValue)
                await _resourceService.Remove(item.TileImageResourceId.Value);
            //remove aliases
            await _aliasService.RemoveByItemId(itemId);

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<Item> Update(Item item)
        {
            var existing = await Get(item.Id);
            if (existing == null)
            {
                return null;
            }

            if (existing.TileImageResourceId != item.TileImageResourceId)
            {
                //remove existing tile image
                if (existing.TileImageResourceId.HasValue)
                    await _resourceService.Remove(existing.TileImageResourceId.Value);
                var newTileResource = await _resourceService.Add(item.TileImage);
                item.TileImageResourceId = newTileResource.Id;
            }
            //aliases
            await _aliasService.Sync(item.Aliases, item.Id);

            _context.Entry(existing).CurrentValues.SetValues(item);
            await _context.SaveChangesAsync();
            return await Get(item.Id);
        }
        public async Task<Item> Get(Guid itemId)
        {
            var item = await _context.Items.FindAsync(itemId);

            if (item == null)
            {
                return null;
            }

            var aliases = await _aliasService.GetByItemId(itemId);
            item.Aliases = aliases.Select(x => x.Alias).ToList();

            return item;
        }

    }
}
