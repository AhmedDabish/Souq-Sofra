using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Application.DTOs;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/addons")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class AddonTemplatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AddonTemplatesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var addons = await _context.AddonTemplates.AsNoTracking()
                .OrderByDescending(addon => addon.AddonTemplateId)
                .Select(addon => new AddonTemplateDto(addon.AddonTemplateId, addon.NameAr, addon.NameEn, addon.Price, addon.IsAvailable, addon.ScopeType, addon.CategoryId, addon.ProductId))
                .ToListAsync();
            return Ok(addons);
        }

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailable([FromQuery] int? categoryId, [FromQuery] int? productId)
        {
            var query = _context.AddonTemplates.AsNoTracking().Where(item => item.IsAvailable);
            query = query.Where(item => item.ScopeType == "All"
                || (categoryId.HasValue && item.ScopeType == "Category" && item.CategoryId == categoryId.Value)
                || (productId.HasValue && item.ScopeType == "Product" && item.ProductId == productId.Value));
            return Ok(await query.OrderBy(item => item.NameAr).Select(item => new AddonTemplateDto(item.AddonTemplateId, item.NameAr, item.NameEn, item.Price, item.IsAvailable, item.ScopeType, item.CategoryId, item.ProductId)).ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddonTemplateCreateDto dto)
        {
            var invalid = await Validate(dto);
            if (invalid != null) return invalid;
            var template = new AddonTemplate();
            Apply(template, dto);
            await using var transaction = await _context.Database.BeginTransactionAsync();
            _context.AddonTemplates.Add(template);
            await _context.SaveChangesAsync();
            await SynchronizeAssignments(template);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(ToDto(template));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AddonTemplateCreateDto dto)
        {
            var invalid = await Validate(dto);
            if (invalid != null) return invalid;
            var template = await _context.AddonTemplates.FirstOrDefaultAsync(item => item.AddonTemplateId == id);
            if (template == null) return NotFound(new { message = "الإضافة غير موجودة." });
            await using var transaction = await _context.Database.BeginTransactionAsync();
            Apply(template, dto);
            await SynchronizeAssignments(template);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(ToDto(template));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var template = await _context.AddonTemplates.FirstOrDefaultAsync(item => item.AddonTemplateId == id);
            if (template == null) return NotFound(new { message = "الإضافة غير موجودة." });
            template.IsAvailable = false;
            var linkedAddons = await _context.ProductAddons.Where(addon => addon.CatalogTemplateId == id).ToListAsync();
            foreach (var addon in linkedAddons) addon.IsAvailable = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task SynchronizeAssignments(AddonTemplate template)
        {
            var products = _context.Products.AsQueryable();
            if (template.ScopeType == "Category" && template.CategoryId.HasValue)
                products = products.Where(product => product.CategoryId == template.CategoryId.Value);
            else if (template.ScopeType == "Product" && template.ProductId.HasValue)
                products = products.Where(product => product.ProductId == template.ProductId.Value);
            else if (template.ScopeType != "All") return;

            var targetProducts = await products.Select(product => product.ProductId).ToListAsync();
            var existing = await _context.ProductAddons.Where(addon => addon.CatalogTemplateId == template.AddonTemplateId).ToListAsync();
            var existingByProduct = existing.ToDictionary(addon => addon.ProductId);
            foreach (var productId in targetProducts)
            {
                if (existingByProduct.TryGetValue(productId, out var linked))
                {
                    linked.NameAr = template.NameAr;
                    linked.NameEn = template.NameEn;
                    linked.Price = template.Price;
                    linked.IsAvailable = template.IsAvailable;
                }
                else
                {
                    _context.ProductAddons.Add(new ProductAddon
                    {
                        ProductId = productId,
                        NameAr = template.NameAr,
                        NameEn = template.NameEn,
                        Price = template.Price,
                        IsAvailable = template.IsAvailable,
                        CatalogTemplateId = template.AddonTemplateId
                    });
                }
            }
            foreach (var linked in existing.Where(addon => !targetProducts.Contains(addon.ProductId)))
                linked.IsAvailable = false;
        }

        private async Task<IActionResult?> Validate(AddonTemplateCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NameAr) || dto.NameAr.Trim().Length > 100 ||
                string.IsNullOrWhiteSpace(dto.NameEn) || dto.NameEn.Trim().Length > 100 ||
                dto.Price < 0 || dto.Price > 9999999999999999.99m || decimal.Round(dto.Price, 2) != dto.Price)
                return BadRequest(new { message = "أدخل اسمَي الإضافة وسعرًا صالحًا حتى منزلتين عشريتين." });
            if (dto.ScopeType is not ("All" or "Category" or "Product"))
                return BadRequest(new { message = "نطاق الإضافة غير صالح." });
            if (dto.ScopeType == "Category" && (!dto.CategoryId.HasValue || !await _context.Categories.AnyAsync(item => item.CategoryId == dto.CategoryId.Value)))
                return BadRequest(new { message = "اختر قسمًا موجودًا للإضافة." });
            if (dto.ScopeType == "Product" && (!dto.ProductId.HasValue || !await _context.Products.AnyAsync(item => item.ProductId == dto.ProductId.Value)))
                return BadRequest(new { message = "اختر صنفًا موجودًا للإضافة." });
            return null;
        }

        private static void Apply(AddonTemplate template, AddonTemplateCreateDto dto)
        {
            template.NameAr = dto.NameAr.Trim();
            template.NameEn = dto.NameEn.Trim();
            template.Price = dto.Price;
            template.IsAvailable = dto.IsAvailable;
            template.ScopeType = dto.ScopeType;
            template.CategoryId = dto.ScopeType == "Category" ? dto.CategoryId : null;
            template.ProductId = dto.ScopeType == "Product" ? dto.ProductId : null;
        }

        private static AddonTemplateDto ToDto(AddonTemplate item) =>
            new(item.AddonTemplateId, item.NameAr, item.NameEn, item.Price, item.IsAvailable, item.ScopeType, item.CategoryId, item.ProductId);
    }
}
