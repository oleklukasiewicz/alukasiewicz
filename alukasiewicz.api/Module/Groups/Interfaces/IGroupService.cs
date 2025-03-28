using alukasiewicz.api.Module.Groups.Entity;

namespace alukasiewicz.api.Module.Groups.Interfaces
{
    public interface IGroupService
    {
        Task<Group> Add(Group group);
        Task<Group> Get(Guid groupId);
        Task<bool> Remove(Guid groupId);
        Task<Group> Update(Group group);
    }
}