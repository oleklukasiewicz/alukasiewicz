using alukasiewicz.api.Module.Posts.Entity;
using alukasiewicz.api.Module.Posts.Interfaces;
using alukasiewicz.api.Module.Posts.Model;
using Microsoft.AspNetCore.Mvc;

namespace alukasiewicz.api.Module.Posts.Controllers
{
    [Route("Item")]
    public class ItemController : Controller
    {
        private readonly IItemService _itemService;
        public ItemController(IItemService itemService)
        {
            _itemService = itemService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAction(Guid id)
        {
            var item = await _itemService.Get(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item.ToResponseModel());
        }
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] ItemModel item)
        {
            var newItem = await _itemService.Add(item.ToEntity());
           
            return Ok(newItem.ToResponseModel());
        }
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ItemModel item)
        {
            var updatedItem = await _itemService.Update(item.ToEntity());
            if (updatedItem == null)
            {
                return NotFound();
            }
            return Ok(updatedItem.ToResponseModel());
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(Guid id)
        {
            var result = await _itemService.Remove(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok();
        }
    }
}
