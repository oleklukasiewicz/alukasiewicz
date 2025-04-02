using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Matchings.Entity;
using alukasiewicz.api.Module.Matchings.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace alukasiewicz.api.Module.Matchings.Services
{
    public class MatchingService : IMatchingService
    {
        private readonly BaseDbContext _dbContext;
        public MatchingService(BaseDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Matching> Get(Guid id)
        {
            return await _dbContext.Matchings.FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task<IQueryable<Matching>> GetForEntity(Guid entityId)
        {
            return _dbContext.Matchings.Where(x => x.EntityId == entityId);
        }
        public async Task<IQueryable<Matching>> GetForGroup(Guid groupId)
        {
            return _dbContext.Matchings.Where(x => x.GroupId == groupId);
        }
        public async Task<Matching> Add(Matching matching)
        {
            var existingForEntity = await _dbContext.Matchings.Where(x => x.EntityId == matching.EntityId && x.Type == matching.Type && x.GroupId == matching.GroupId).FirstOrDefaultAsync();
            if (existingForEntity != null)
                return existingForEntity;

            await _dbContext.Matchings.AddAsync(matching);
            await _dbContext.SaveChangesAsync();
            return matching;
        }
        public async Task<bool> Remove(Guid id)
        {
            var matching = await _dbContext.Matchings.FirstOrDefaultAsync(x => x.Id == id);
            if (matching == null)
            {
                return false;
            }
            _dbContext.Matchings.Remove(matching);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
