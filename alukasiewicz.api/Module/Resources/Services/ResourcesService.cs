using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Resources.Entity;
using alukasiewicz.api.Module.Resources.Interfaces;

namespace alukasiewicz.api.Module.Resources.Services
{
    public class ResourcesService : IResourcesService
    {
        private readonly BaseDbContext _context;
        public ResourcesService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<ResourceItem> Add(ResourceItem item)
        {
            await _context.ResourceItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<bool> Remove(Guid resourceId)
        {
            var item = await _context.ResourceItems.FindAsync(resourceId);
            if (item == null)
            {
                return false;
            }
            _context.ResourceItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<ResourceItem> Get(Guid resourceId)
        {
            return await _context.ResourceItems.FindAsync(resourceId);
        }
    }
}
