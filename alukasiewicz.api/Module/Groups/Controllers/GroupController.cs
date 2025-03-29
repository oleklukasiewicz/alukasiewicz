using alukasiewicz.api.Module.Groups.Entity;
using alukasiewicz.api.Module.Groups.Interfaces;
using alukasiewicz.api.Module.Groups.Model;
using Microsoft.AspNetCore.Mvc;

namespace alukasiewicz.api.Module.Groups.Controllers
{
    [Route("Group")]
    public class GroupController : Controller
    {
        private readonly IGroupService _groupService;
        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAction(Guid id)
        {
            var group = await _groupService.Get(id);
            if (group == null)
            {
                return NotFound();
            }
            return Ok(group.ToResponseModel());
        }
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] GroupModel group)
        {
            var newGroup = await _groupService.Add(group.ToEntity());
            return Ok(newGroup.ToResponseModel());
        }
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] GroupModel group)
        {
            var updatedGroup = await _groupService.Update(group.ToEntity());
            if (updatedGroup == null)
            {
                return NotFound();
            }
            return Ok(updatedGroup.ToResponseModel());
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var result = await _groupService.Remove(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok();
        }
    }
}
