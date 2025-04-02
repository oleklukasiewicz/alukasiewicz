using alukasiewicz.api.Module.Groups.Entity;

namespace alukasiewicz.api.Module.Groups.Interfaces
{
    public interface IGroupService
    {
        Task<Group> Add(Group group);
        Task<Group> Get(Guid groupId, int depth = 1);
        Task<bool> Remove(Guid groupId);
        Task<Group> Update(Group group);
        Task<Group> GetDefault();
    }
}