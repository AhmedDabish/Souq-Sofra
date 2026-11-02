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
                    p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price)).ToList()
                ))
                .ToListAsync();

            return Ok(products);
        }

        // Public best-sellers ranked by quantity in completed orders.
        [HttpGet("best-selling")]
        public async Task<IActionResult> GetBestSelling()
        {
            var rankedIds = await _context.OrderItems
                .Where(item => item.Order != null && item.Order.OrderStatus == "Completed")
                .GroupBy(item => item.ProductId)
                .Select(group => new { ProductId = group.Key, Quantity = group.Sum(item => item.Quantity) })
                .OrderByDescending(item => item.Quantity)
                .ThenBy(item => item.ProductId)
                .Take(10)
                .Select(item => item.ProductId)
                .ToListAsync();

            if (rankedIds.Count == 0) return Ok(Array.Empty<ProductDto>());

            var products = await _context.Products
                .Include(product => product.Variants).Include(product => product.Addons)
                .Where(product => product.IsAvailable && rankedIds.Contains(product.ProductId))
                .Select(product => new ProductDto(
                    product.ProductId,
                    product.CategoryId,
                    product.NameAr,
                    product.NameEn,
                    product.DescriptionAr,
                    product.DescriptionEn,
                    product.BasePrice,
                    product.DiscountPrice,
                    product.ImageUrl,
                    product.IsAvailable,
                    product.IsFeatured,
                    product.Variants.Select(variant => new ProductVariantDto(variant.VariantId, variant.NameAr, variant.NameEn, variant.Price, variant.IsDefault)).ToList(),
                    product.Addons.Where(addon => addon.IsAvailable).Select(addon => new ProductAddonDto(addon.AddonId, addon.NameAr, addon.NameEn, addon.Price)).ToList()
                ))
                .ToListAsync();

            var productsById = products.ToDictionary(product => product.ProductId);
            return Ok(rankedIds.Where(productsById.ContainsKey).Select(productId => productsById[productId]));
        }

        // Admin endpoint (returns all products including hidden/unavailable)
        [Authorize(Roles = "Admin")]
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
                    p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price)).ToList()
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
                p.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.AddonId, a.NameAr, a.NameEn, a.Price)).ToList()
            );

            return Ok(dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            if (dto.DiscountPrice.HasValue && (dto.DiscountPrice.Value <= 0 || dto.DiscountPrice.Value >= dto.BasePrice))
                return BadRequest(new { message = "سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي." });

            var addonValidation = ValidateAddons(dto.Addons);
            if (addonValidation != null) return addonValidation;

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

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductCreateDto dto)
        {
            if (dto.DiscountPrice.HasValue && (dto.DiscountPrice.Value <= 0 || dto.DiscountPrice.Value >= dto.BasePrice))
                return BadRequest(new { message = "سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي." });

            var addonValidation = ValidateAddons(dto.Addons);
            if (addonValidation != null) return addonValidation;

            var product = await _context.Products.Include(p => p.Variants).Include(p => p.Addons).FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

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
                _context.ProductAddons.RemoveRange(product.Addons);
                product.Addons.Clear();
                foreach (var addon in dto.Addons)
                    product.Addons.Add(new ProductAddon { NameAr = addon.NameAr.Trim(), NameEn = addon.NameEn.Trim(), Price = addon.Price, IsAvailable = true });
            }

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            product.IsAvailable = !product.IsAvailable;
            await _context.SaveChangesAsync();

            return Ok(new { productId = product.ProductId, isAvailable = product.IsAvailable });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/featured")]
        public async Task<IActionResult> ToggleFeatured(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            product.IsFeatured = !product.IsFeatured;
            await _context.SaveChangesAsync();

            return Ok(new { productId = product.ProductId, isFeatured = product.IsFeatured });
        }


        public class SetDiscountDto
        {
            public decimal? DiscountPrice { get; set; }
        }

        [Authorize(Roles = "Admin")]
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

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
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
