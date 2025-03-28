using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Groups.Entity;
using alukasiewicz.api.Module.Groups.Interfaces;

namespace alukasiewicz.api.Module.Groups.Services
{
    public class GroupService : IGroupService
    {
        private readonly BaseDbContext _context;
        public GroupService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<Group> Add(Group group)
        {
            await _context.Groups.AddAsync(group);
            await _context.SaveChangesAsync();
            return group;
        }
        public async Task<bool> Remove(Guid groupId)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
            {
                return false;
            }
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<Group> Get(Guid groupId)
        {
            return await _context.Groups.FindAsync(groupId);
        }
        public async Task<Group> Update(Group group)
        {
            var existing = await Get(group.Id);
            if (existing == null)
            {
                return null;
            }
            _context.Entry(existing).CurrentValues.SetValues(group);

            await _context.SaveChangesAsync();
            return existing;
        }
    }
}
