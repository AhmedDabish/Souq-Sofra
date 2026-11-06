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
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProductsController(AppDbContext context) => _context = context;

        // Public storefront endpoint (active & available products)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] bool? featured, [FromQuery] string? search)
        {
            var query = _context.Products.Include(p => p.Variants).Include(p => p.Addons).AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (featured.HasValue && featured.Value)
                query = query.Where(p => p.IsFeatured);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p => p.NameAr.ToLower().Contains(term) || p.NameEn.ToLower().Contains(term));
            }

            var products = await query
                .Where(p => p.IsAvailable)
                .OrderByDescending(p => p.IsFeatured)
                .ThenBy(p => p.ProductId)
                .Select(p => new ProductDto(
                    p.ProductId,
                    p.CategoryId,
                    p.NameAr,
                    p.NameEn,
                    p.DescriptionAr,
                    p.DescriptionEn,
                    p.BasePrice,
                    p.DiscountPrice,
                    p.ImageUrl,
                    p.IsAvailable,
                    p.IsFeatured,
                    p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList(),
                    p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price, a.CatalogTemplateId)).ToList(),
                    p.IsManuallyBestSelling,
                    _context.OrderItems.Where(item => item.ProductId == p.ProductId && item.Order != null && item.Order.OrderStatus == "Completed").Sum(item => (int?)item.Quantity) ?? 0,
                    _context.ProductReviews.Where(r => r.ProductId == p.ProductId && r.IsApproved).Select(r => (double?)r.Rating).Average() ?? 5.0,
                    _context.ProductReviews.Count(r => r.ProductId == p.ProductId && r.IsApproved)
                ))
                .ToListAsync();

            return Ok(products);
        }

        // Best sellers include products pinned by staff and products ranked by completed-order quantities.
        [HttpGet("best-selling")]
        public async Task<IActionResult> GetBestSelling()
        {
            var products = await _context.Products
                .Include(product => product.Variants).Include(product => product.Addons)
                .Where(product => product.IsAvailable)
                .Select(product => new
                {
                    Product = product,
                    CompletedQuantity = _context.OrderItems
                        .Where(item => item.ProductId == product.ProductId && item.Order != null && item.Order.OrderStatus == "Completed")
                        .Sum(item => (int?)item.Quantity) ?? 0
                })
                .Where(row => row.Product.IsManuallyBestSelling || row.CompletedQuantity > 0)
                .OrderByDescending(row => row.Product.IsManuallyBestSelling)
                .ThenByDescending(row => row.CompletedQuantity)
                .ThenBy(row => row.Product.ProductId)
                .Take(10)
                .Select(row => new ProductDto(
                    row.Product.ProductId,
                    row.Product.CategoryId,
                    row.Product.NameAr,
                    row.Product.NameEn,
                    row.Product.DescriptionAr,
                    row.Product.DescriptionEn,
                    row.Product.BasePrice,
                    row.Product.DiscountPrice,
                    row.Product.ImageUrl,
                    row.Product.IsAvailable,
                    row.Product.IsFeatured,
                    row.Product.Variants.Select(variant => new ProductVariantDto(variant.VariantId, variant.NameAr, variant.NameEn, variant.Price, variant.IsDefault)).ToList(),
                    row.Product.Addons.Where(addon => addon.IsAvailable).Select(addon => new ProductAddonDto(addon.AddonId, addon.NameAr, addon.NameEn, addon.Price, addon.CatalogTemplateId)).ToList(),
                    row.Product.IsManuallyBestSelling,
                    row.CompletedQuantity,
                    _context.ProductReviews.Where(r => r.ProductId == row.Product.ProductId && r.IsApproved).Select(r => (double?)r.Rating).Average() ?? 5.0,
                    _context.ProductReviews.Count(r => r.ProductId == row.Product.ProductId && r.IsApproved)
                ))
                .ToListAsync();

            return Ok(products);
        }

        // Admin endpoint (returns all products including hidden/unavailable)
        [Authorize(Policy = "Permission:products.view")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var products = await _context.Products
                .Include(p => p.Variants).Include(p => p.Addons)
                .OrderByDescending(p => p.ProductId)
                .Select(p => new ProductDto(
                    p.ProductId,
                    p.CategoryId,
                    p.NameAr,
                    p.NameEn,
                    p.DescriptionAr,
                    p.DescriptionEn,
                    p.BasePrice,
                    p.DiscountPrice,
                    p.ImageUrl,
                    p.IsAvailable,
                    p.IsFeatured,
                    p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList(),
                    p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price, a.CatalogTemplateId)).ToList(),
                    p.IsManuallyBestSelling,
                    _context.OrderItems.Where(item => item.ProductId == p.ProductId && item.Order != null && item.Order.OrderStatus == "Completed").Sum(item => (int?)item.Quantity) ?? 0,
                    _context.ProductReviews.Where(r => r.ProductId == p.ProductId && r.IsApproved).Select(r => (double?)r.Rating).Average() ?? 5.0,
                    _context.ProductReviews.Count(r => r.ProductId == p.ProductId && r.IsApproved)
                ))
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var p = await _context.Products.Include(x => x.Variants).Include(x => x.Addons).FirstOrDefaultAsync(x => x.ProductId == id);
            if (p == null) return NotFound(new { message = "المنتج غير موجود." });

            var dto = new ProductDto(
                p.ProductId, p.CategoryId, p.NameAr, p.NameEn, p.DescriptionAr, p.DescriptionEn,
                p.BasePrice, p.DiscountPrice, p.ImageUrl, p.IsAvailable, p.IsFeatured,
                p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList(),
                p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price, a.CatalogTemplateId)).ToList(),
                p.IsManuallyBestSelling,
                await _context.OrderItems.Where(item => item.ProductId == p.ProductId && item.Order != null && item.Order.OrderStatus == "Completed").SumAsync(item => (int?)item.Quantity) ?? 0,
                await _context.ProductReviews.Where(r => r.ProductId == p.ProductId && r.IsApproved).Select(r => (double?)r.Rating).AverageAsync() ?? 5.0,
                await _context.ProductReviews.CountAsync(r => r.ProductId == p.ProductId && r.IsApproved)
            );

            return Ok(dto);
        }

        [Authorize(Policy = "Permission:products.create")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            if (dto.DiscountPrice.HasValue && (dto.DiscountPrice.Value <= 0 || dto.DiscountPrice.Value >= dto.BasePrice))
                return BadRequest(new { message = "سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي." });

            var addonValidation = ValidateAddons(dto.Addons);
            if (addonValidation != null) return addonValidation;
            dto = dto with { CatalogAddonIds = dto.CatalogAddonIds ?? await GetDefaultCatalogAddonIds(dto.CategoryId) };
            var catalogValidation = await ValidateCatalogAddonSelection(dto.CategoryId, dto.CatalogAddonIds);
            if (catalogValidation != null) return catalogValidation;

            var product = new Product
            {
                CategoryId = dto.CategoryId,
                NameAr = dto.NameAr,
                NameEn = dto.NameEn,
                DescriptionAr = dto.DescriptionAr,
                DescriptionEn = dto.DescriptionEn,
                BasePrice = dto.BasePrice,
                DiscountPrice = dto.DiscountPrice,
                ImageUrl = dto.ImageUrl,
                IsAvailable = dto.IsAvailable,
                IsFeatured = dto.IsFeatured,
                IsManuallyBestSelling = dto.IsManuallyBestSelling,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.Variants != null && dto.Variants.Any())
            {
                foreach (var v in dto.Variants)
                {
                    product.Variants.Add(new ProductVariant
                    {
                        NameAr = v.NameAr,
                        NameEn = v.NameEn,
                        Price = v.Price,
                        IsDefault = v.IsDefault
                    });
                }
            }

            if (dto.Addons != null)
                foreach (var addon in dto.Addons)
                    product.Addons.Add(new ProductAddon { NameAr = addon.NameAr.Trim(), NameEn = addon.NameEn.Trim(), Price = addon.Price, IsAvailable = true });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            await ReplaceCatalogAddons(product, dto.CatalogAddonIds);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        [Authorize(Policy = "Permission:products.update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductCreateDto dto)
        {
            if (dto.DiscountPrice.HasValue && (dto.DiscountPrice.Value <= 0 || dto.DiscountPrice.Value >= dto.BasePrice))
                return BadRequest(new { message = "سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي." });

            var addonValidation = ValidateAddons(dto.Addons);
            if (addonValidation != null) return addonValidation;

            var product = await _context.Products.Include(p => p.Variants).Include(p => p.Addons).FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });
            var catalogValidation = await ValidateCatalogAddonSelection(dto.CategoryId, dto.CatalogAddonIds, id);
            if (catalogValidation != null) return catalogValidation;
            await using var transaction = await _context.Database.BeginTransactionAsync();

            product.CategoryId = dto.CategoryId;
            product.NameAr = dto.NameAr;
            product.NameEn = dto.NameEn;
            product.DescriptionAr = dto.DescriptionAr;
            product.DescriptionEn = dto.DescriptionEn;
            product.BasePrice = dto.BasePrice;
            product.DiscountPrice = dto.DiscountPrice;
            product.ImageUrl = dto.ImageUrl;
            product.IsAvailable = dto.IsAvailable;
            product.IsFeatured = dto.IsFeatured;
            product.IsManuallyBestSelling = dto.IsManuallyBestSelling;

            // Update variants if provided
            if (dto.Variants != null)
            {
                _context.ProductVariants.RemoveRange(product.Variants);
                product.Variants.Clear();
                foreach (var v in dto.Variants)
                {
                    product.Variants.Add(new ProductVariant
                    {
                        NameAr = v.NameAr,
                        NameEn = v.NameEn,
                        Price = v.Price,
                        IsDefault = v.IsDefault
                    });
                }
            }

            if (dto.Addons != null)
            {
                var customAddons = product.Addons.Where(addon => addon.CatalogTemplateId == null).ToList();
                _context.ProductAddons.RemoveRange(customAddons);
                foreach (var customAddon in customAddons) product.Addons.Remove(customAddon);
                foreach (var addon in dto.Addons)
                    product.Addons.Add(new ProductAddon { NameAr = addon.NameAr.Trim(), NameEn = addon.NameEn.Trim(), Price = addon.Price, IsAvailable = true });
            }

            await ReplaceCatalogAddons(product, dto.CatalogAddonIds);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(product);
        }

        [Authorize(Policy = "Permission:products.update")]
        [HttpPatch("{id}/availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            product.IsAvailable = !product.IsAvailable;
            await _context.SaveChangesAsync();

            return Ok(new { productId = product.ProductId, isAvailable = product.IsAvailable });
        }

        [Authorize(Policy = "Permission:products.update")]
        [HttpPatch("{id}/featured")]
        public async Task<IActionResult> ToggleFeatured(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            product.IsFeatured = !product.IsFeatured;
            await _context.SaveChangesAsync();

            return Ok(new { productId = product.ProductId, isFeatured = product.IsFeatured });
        }

        [Authorize(Policy = "Permission:products.update")]
        [HttpPatch("{id}/best-selling")]
        public async Task<IActionResult> ToggleBestSelling(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            product.IsManuallyBestSelling = !product.IsManuallyBestSelling;
            await _context.SaveChangesAsync();
            return Ok(new { productId = product.ProductId, isManuallyBestSelling = product.IsManuallyBestSelling });
        }


        public class SetDiscountDto
        {
            public decimal? DiscountPrice { get; set; }
        }

        [Authorize(Policy = "Permission:products.update")]
        [HttpPatch("{id}/discount")]
        public async Task<IActionResult> SetDiscount(int id, [FromBody] SetDiscountDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            if (dto.DiscountPrice.HasValue && dto.DiscountPrice.Value > 0)
            {
                if (dto.DiscountPrice.Value >= product.BasePrice)
                    return BadRequest(new { message = "سعر الخصم يجب أن يكون أقل من السعر الأساسي وأكبر من صفر." });
                product.DiscountPrice = dto.DiscountPrice.Value;
            }
            else
            {
                product.DiscountPrice = null;
            }

            await _context.SaveChangesAsync();
            return Ok(new { productId = product.ProductId, discountPrice = product.DiscountPrice });
        }

        [Authorize(Policy = "Permission:products.delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private Task<List<int>> GetDefaultCatalogAddonIds(int categoryId) =>
            _context.AddonTemplates
                .Where(template => template.IsAvailable && (template.ScopeType == "All" || (template.ScopeType == "Category" && template.CategoryId == categoryId)))
                .Select(template => template.AddonTemplateId)
                .ToListAsync();

        private async Task<IActionResult?> ValidateCatalogAddonSelection(int categoryId, List<int>? templateIds, int? productId = null)
        {
            if (templateIds == null) return null;
            if (templateIds.Count > 100 || templateIds.Count != templateIds.Distinct().Count())
                return BadRequest(new { message = "قائمة الإضافات غير صالحة أو تحتوي على تكرار." });
            if (templateIds.Count == 0) return null;
            var templates = await _context.AddonTemplates
                .Where(template => template.IsAvailable && templateIds.Contains(template.AddonTemplateId))
                .ToListAsync();
            if (templates.Count != templateIds.Count)
                return BadRequest(new { message = "إحدى الإضافات المختارة غير متاحة." });
            if (templates.Any(template => template.ScopeType == "Category" && template.CategoryId != categoryId))
                return BadRequest(new { message = "إحدى الإضافات لا تخص قسم هذا الصنف." });
            if (templates.Any(template => template.ScopeType == "Product" && template.ProductId != productId))
                return BadRequest(new { message = "إحدى الإضافات مخصصة لصنف آخر." });
            if (templates.Any(template => template.ScopeType is not ("All" or "Category" or "Product")))
                return BadRequest(new { message = "نطاق إحدى الإضافات غير صالح." });
            return null;
        }

        private async Task ReplaceCatalogAddons(Product product, List<int>? templateIds)
        {
            if (templateIds == null) return;
            var linkedAddons = await _context.ProductAddons
                .Where(addon => addon.ProductId == product.ProductId && addon.CatalogTemplateId != null)
                .ToListAsync();
            _context.ProductAddons.RemoveRange(linkedAddons);
            if (templateIds.Count == 0) return;
            var templates = await _context.AddonTemplates
                .Where(template => template.IsAvailable && templateIds.Contains(template.AddonTemplateId))
                .ToListAsync();
            foreach (var template in templates)
                _context.ProductAddons.Add(new ProductAddon
                {
                    ProductId = product.ProductId,
                    NameAr = template.NameAr,
                    NameEn = template.NameEn,
                    Price = template.Price,
                    IsAvailable = true,
                    CatalogTemplateId = template.AddonTemplateId
                });
        }

        private IActionResult? ValidateAddons(List<ProductAddonCreateDto>? addons)
        {
            if (addons == null) return null;
            if (addons.Count > 50)
                return BadRequest(new { message = "لا يمكن إضافة أكثر من 50 إضافة للمنتج." });
            const decimal maxSqlPrice = 9999999999999999.99m;
            if (addons.Any(addon => string.IsNullOrWhiteSpace(addon.NameAr) || string.IsNullOrWhiteSpace(addon.NameEn)
                || addon.NameAr.Trim().Length > 100 || addon.NameEn.Trim().Length > 100
                || addon.Price < 0 || addon.Price > maxSqlPrice || decimal.Round(addon.Price, 2) != addon.Price))
                return BadRequest(new { message = "تحقق من أسماء الإضافات بالعربية والإنجليزية وأسعارها غير السالبة." });
            return null;
        }
    }
}
