using alukasiewicz.api.Module.Matchings.Entity;

namespace alukasiewicz.api.Module.Matchings.Interfaces
{
    public interface IMatchingService
    {
        Task<Matching> Add(Matching matching);
        Task<Matching> Get(Guid id);
        Task<IQueryable<Matching>> GetForEntity(Guid entityId);
        Task<IQueryable<Matching>> GetForGroup(Guid groupId);
        Task<bool> Remove(Guid id);
    }
}