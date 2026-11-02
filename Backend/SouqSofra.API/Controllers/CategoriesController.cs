using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Application.DTOs;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;

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
                .Select(c => new CategoryDto(c.CategoryId, c.NameAr, c.NameEn, c.Slug, c.IconUrl, c.ImageUrl, c.DisplayOrder, c.IsActive))
                .ToListAsync();

            return Ok(categories);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto(c.CategoryId, c.NameAr, c.NameEn, c.Slug, c.IconUrl, c.ImageUrl, c.DisplayOrder, c.IsActive))
                .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _context.Categories.FindAsync(id);
            if (c == null) return NotFound(new { message = "القسم غير موجود." });

            return Ok(new CategoryDto(c.CategoryId, c.NameAr, c.NameEn, c.Slug, c.IconUrl, c.ImageUrl, c.DisplayOrder, c.IsActive));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
        {
            var category = new Category
            {
                NameAr = dto.NameAr,
                NameEn = dto.NameEn,
                Slug = string.IsNullOrWhiteSpace(dto.Slug) ? Guid.NewGuid().ToString("N")[..8] : dto.Slug.ToLower(),
                IconUrl = dto.IconUrl,
                ImageUrl = dto.ImageUrl,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = category.CategoryId }, category);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryCreateDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "القسم غير موجود." });

            category.NameAr = dto.NameAr;
            category.NameEn = dto.NameEn;
            category.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? Guid.NewGuid().ToString("N")[..8] : dto.Slug.Trim().ToLowerInvariant();
            category.IconUrl = dto.IconUrl;
            category.ImageUrl = dto.ImageUrl;
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "القسم غير موجود." });

            // Soft delete to protect relational integrity with products
            category.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
