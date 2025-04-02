using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Groups.Entity;
using alukasiewicz.api.Module.Groups.Interfaces;
using alukasiewicz.api.Module.Matchings.Entity;
using alukasiewicz.api.Module.Matchings.Interfaces;
using alukasiewicz.api.Module.Posts.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace alukasiewicz.api.Module.Groups.Services
{
    public class GroupService : IGroupService
    {
        private readonly BaseDbContext _context;
        private readonly IMatchingService _matchingService;
        private readonly IItemService _itemService;
        public GroupService(BaseDbContext context, IMatchingService matchingService, IItemService itemService)
        {
            _context = context;
            _matchingService = matchingService;
            _itemService = itemService;
        }
        public async Task<Group> Add(Group group)
        {
            await _context.Groups.AddAsync(group);
            if (group.IsDefault)
            {
                var defaultGroup = await _context.Groups.FirstOrDefaultAsync(x => x.IsDefault);
                if (defaultGroup != null)
                {
                    defaultGroup.IsDefault = false;
                    _context.Entry(defaultGroup).State = EntityState.Modified;
                }
            }

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

            if (group.IsDefault)
            {
                var defaultGroup = await _context.Groups.FirstOrDefaultAsync();
                defaultGroup.IsDefault = true;
                _context.Entry(defaultGroup).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }

            return true;
        }
        public async Task<Group> Get(Guid groupId, int depth = 1)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
            {
                return null;
            }
            group.Items = new List<Posts.Entity.Item>();
            group.SubGroups = new List<Group>();
            var getMatching = await _matchingService.GetForGroup(groupId);
            var itemsMatching = await getMatching.Where(x => x.Type == MatchingType.Item).ToListAsync();
            for (var i = 0; i < itemsMatching.Count; i++)
            {
                var item = await _itemService.Get(itemsMatching[i].EntityId);
                group.Items.Add(item);
            }
            if (depth > 0)
            {
                var subGroupsMatching = await getMatching.Where(x => x.Type == MatchingType.Group).ToListAsync();
                for (var i = 0; i < subGroupsMatching.Count; i++)
                {
                    var subGroup = await Get(subGroupsMatching[i].EntityId, depth - 1);
                    group.SubGroups.Add(subGroup);
                }
            }
            return group;
        }
        public async Task<Group> Update(Group group)
        {
            var existing = await Get(group.Id);
            if (existing == null)
            {
                return null;
            }
            _context.Entry(existing).CurrentValues.SetValues(group);

            if (group.IsDefault)
            {
                var defaultGroup = await _context.Groups.FirstOrDefaultAsync(x => x.IsDefault);
                if (defaultGroup != null && defaultGroup.Id != group.Id)
                {
                    defaultGroup.IsDefault = false;
                    _context.Entry(defaultGroup).State = EntityState.Modified;
                }
            }

            await _context.SaveChangesAsync();
            return existing;
        }
        public async Task<Group> GetDefault()
        {
            var defaultgroup = await _context.Groups.FirstOrDefaultAsync(x => x.IsDefault);
            return await Get(defaultgroup.Id);
        }
    }
}
