using alukasiewicz.api.Module.Matchings.Interfaces;
using alukasiewicz.api.Module.Matchings.Model;
using Microsoft.AspNetCore.Mvc;

namespace alukasiewicz.api.Module.Matchings.Controllers
{
    [Route("Matchings")]
    public class MatchingController : Controller
    {
        private readonly IMatchingService _matchingService;
        public MatchingController(IMatchingService matchingService )
        {
            _matchingService = matchingService;
        }
        [HttpPost]
        public async Task<IActionResult> Add(MatchingModel matching)
        {
            var result = await _matchingService.Add(matching.ToEntity());
            return Ok(result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var result = await _matchingService.Remove(id);
            return Ok(result);
        }
        [HttpGet("{entityId}/Entity")]
        public async Task<IActionResult> GetForEntity(Guid entityId)
        {
            var result = await _matchingService.GetForEntity(entityId);
            return Ok(result);
        }
        [HttpGet("{groupId}/Group")]
        public async Task<IActionResult> GetForGroup(Guid groupId)
        {
            var result = await _matchingService.GetForGroup(groupId);
            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _matchingService.Get(id);
            return Ok(result);
        }

    }
}
