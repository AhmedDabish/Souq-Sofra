using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Infrastructure.Data;
using SouqSofra.Domain.Entities;
using SouqSofra.Application.DTOs;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto(c.CategoryId, c.NameAr, c.NameEn, c.Slug, c.IconUrl, c.DisplayOrder))
                .ToListAsync();
            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = category.CategoryId }, category);
        }
    }
}
