using alukasiewicz.api.Module.Resources.Entity;

namespace alukasiewicz.api.Module.Resources.Interfaces
{
    public interface IResourcesService
    {
        Task<ResourceItem> Add(ResourceItem item);
        Task<bool> Remove(Guid resourceId);
        Task<ResourceItem> Update(ResourceItem resource);
        Task<ResourceItem> Get(Guid resourceId);
    }
}