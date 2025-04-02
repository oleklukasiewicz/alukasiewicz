using alukasiewicz.api.Module.Resources.Interfaces;
using alukasiewicz.api.Module.Resources.Model;
using Microsoft.AspNetCore.Mvc;

namespace alukasiewicz.api.Module.Resources.Controllers
{
    [Route("api/Resources")]
    public class ResourcesController : Controller
    {
        private readonly IResourcesService _resourceService;
        public ResourcesController(IResourcesService resourcesService)
        {
            _resourceService = resourcesService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var resource = await _resourceService.Get(id);
            return Ok(resource);
        }
        [HttpPost]
        public async Task<IActionResult> Add(ResourceItemModel resource)
        {
            var result = await _resourceService.Add(resource.ToEntity());
            return Ok(result);
        }
        [HttpPut]
        public async Task<IActionResult> Update(ResourceItemModel resource)
        {
            var result = await _resourceService.Update(resource.ToEntity());
            return Ok(result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var result = await _resourceService.Remove(id);
            return Ok(result);
        }
        [HttpGet("{id}/Content")]
        public async Task<IActionResult> GetContent(Guid id)
        {
            var resource = await _resourceService.Get(id);
            return Ok(resource.Content);
        }
    }
}
