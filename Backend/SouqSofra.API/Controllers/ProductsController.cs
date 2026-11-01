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
            var query = _context.Products.Include(p => p.Variants).AsQueryable();

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
                    p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList()
                ))
                .ToListAsync();

            return Ok(products);
        }

        // Admin endpoint (returns all products including hidden/unavailable)
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var products = await _context.Products
                .Include(p => p.Variants)
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
                    p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList()
                ))
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var p = await _context.Products.Include(x => x.Variants).FirstOrDefaultAsync(x => x.ProductId == id);
            if (p == null) return NotFound(new { message = "المنتج غير موجود." });

            var dto = new ProductDto(
                p.ProductId, p.CategoryId, p.NameAr, p.NameEn, p.DescriptionAr, p.DescriptionEn,
                p.BasePrice, p.DiscountPrice, p.ImageUrl, p.IsAvailable, p.IsFeatured,
                p.Variants.Select(v => new ProductVariantDto(v.VariantId, v.NameAr, v.NameEn, v.Price, v.IsDefault)).ToList()
            );

            return Ok(dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
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

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductCreateDto dto)
        {
            var product = await _context.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.ProductId == id);
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "المنتج غير موجود." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
