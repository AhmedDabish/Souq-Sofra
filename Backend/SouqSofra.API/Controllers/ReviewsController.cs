using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Application.DTOs;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        private static readonly HashSet<string> AllowedVideoExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv" };

        public ReviewsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ==========================================
        // 1. Restaurant Reviews (Homepage)
        // ==========================================

        [HttpGet("restaurant")]
        public async Task<IActionResult> GetRestaurantReviews()
        {
            var reviews = await _context.RestaurantReviews
                .Where(r => r.IsApproved)
                .OrderByDescending(r => r.CreatedAt)
                .Take(30)
                .Select(r => new RestaurantReviewDto(
                    r.ReviewId,
                    r.CustomerName,
                    r.Rating,
                    r.Comment,
                    r.AvatarUrl,
                    r.VideoUrl,
                    r.CreatedAt
                ))
                .ToListAsync();

            return Ok(reviews);
        }

        public class RestaurantReviewForm
        {
            public string CustomerName { get; set; } = string.Empty;
            public string? PhoneNumber { get; set; }
            public string Comment { get; set; } = string.Empty;
            public int Rating { get; set; } = 5;
            public IFormFile? Avatar { get; set; }
            public IFormFile? Video { get; set; }
        }

        [HttpPost("restaurant")]
        [RequestSizeLimit(100 * 1024 * 1024)] // Up to 100MB for video
        public async Task<IActionResult> CreateRestaurantReview([FromForm] RestaurantReviewForm form)
        {
            if (string.IsNullOrWhiteSpace(form.CustomerName))
                return BadRequest(new { message = "الاسم مطلوب لإضافة التقييم." });

            if (string.IsNullOrWhiteSpace(form.Comment))
                return BadRequest(new { message = "نص التقييم مطلوب." });

            var rating = Math.Clamp(form.Rating, 1, 5);

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            string? avatarUrl = null;
            string? videoUrl = null;

            // Handle Avatar Upload or Random Avatar
            if (form.Avatar != null && form.Avatar.Length > 0)
            {
                var ext = Path.GetExtension(form.Avatar.FileName);
                if (!AllowedImageExtensions.Contains(ext))
                    return BadRequest(new { message = "صيغة الصورة غير مدعومة. الصيغ المسموحة: JPG, PNG, WEBP, GIF." });

                var avatarsFolder = Path.Combine(webRoot, "uploads", "reviews", "avatars");
                Directory.CreateDirectory(avatarsFolder);

                var fileName = $"avatar_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8]}{ext.ToLowerInvariant()}";
                var fullPath = Path.Combine(avatarsFolder, fileName);
                await using (var stream = System.IO.File.Create(fullPath))
                {
                    await form.Avatar.CopyToAsync(stream);
                }
                avatarUrl = $"/uploads/reviews/avatars/{fileName}";
            }
            else
            {
                // If user did not upload a personal photo, generate a random avatar
                var randomSeed = Guid.NewGuid().ToString("N")[..8];
                var colors = new[] { "b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "fde68a", "a7f3d0" };
                var bg = colors[Random.Shared.Next(colors.Length)];
                avatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={randomSeed}&backgroundColor={bg}";
            }

            // Handle Video Upload
            if (form.Video != null && form.Video.Length > 0)
            {
                var ext = Path.GetExtension(form.Video.FileName);
                if (!AllowedVideoExtensions.Contains(ext))
                    return BadRequest(new { message = "صيغة الفيديو غير مدعومة. الصيغ المسموحة: MP4, WEBM, MOV, M4V." });

                var videosFolder = Path.Combine(webRoot, "uploads", "reviews", "videos");
                Directory.CreateDirectory(videosFolder);

                var fileName = $"video_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8]}{ext.ToLowerInvariant()}";
                var fullPath = Path.Combine(videosFolder, fileName);
                await using (var stream = System.IO.File.Create(fullPath))
                {
                    await form.Video.CopyToAsync(stream);
                }
                videoUrl = $"/uploads/reviews/videos/{fileName}";
            }

            var review = new RestaurantReview
            {
                CustomerName = form.CustomerName.Trim(),
                PhoneNumber = NormalizePhone(form.PhoneNumber),
                Rating = rating,
                Comment = form.Comment.Trim(),
                AvatarUrl = avatarUrl,
                VideoUrl = videoUrl,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.RestaurantReviews.Add(review);
            await _context.SaveChangesAsync();

            var dto = new RestaurantReviewDto(
                review.ReviewId,
                review.CustomerName,
                review.Rating,
                review.Comment,
                review.AvatarUrl,
                review.VideoUrl,
                review.CreatedAt
            );

            return CreatedAtAction(nameof(GetRestaurantReviews), new { id = review.ReviewId }, dto);
        }

        // ==========================================
        // 2. Product Reviews (Sandwiches & Items)
        // ==========================================

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
            if (!productExists)
                return NotFound(new { message = "المنتج غير موجود." });

            var reviews = await _context.ProductReviews
                .Where(r => r.ProductId == productId && r.IsApproved)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ProductReviewDto(
                    r.ProductReviewId,
                    r.ProductId,
                    r.CustomerName,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt
                ))
                .ToListAsync();

            var avgRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 5.0;

            var summary = new ProductReviewsSummaryDto(
                productId,
                avgRating,
                reviews.Count,
                reviews
            );

            return Ok(summary);
        }

        [HttpPost("product")]
        public async Task<IActionResult> CreateProductReview([FromBody] ProductReviewCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName))
                return BadRequest(new { message = "الاسم مطلوب لإضافة التقييم." });

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "التقييم يجب أن يكون بين 1 و 5 نجوم." });

            var productExists = await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId);
            if (!productExists)
                return NotFound(new { message = "المنتج غير موجود." });

            var review = new ProductReview
            {
                ProductId = dto.ProductId,
                CustomerName = dto.CustomerName.Trim(),
                PhoneNumber = NormalizePhone(dto.PhoneNumber),
                Rating = dto.Rating,
                Comment = dto.Comment?.Trim(),
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ProductReviews.Add(review);
            await _context.SaveChangesAsync();

            var resultDto = new ProductReviewDto(
                review.ProductReviewId,
                review.ProductId,
                review.CustomerName,
                review.Rating,
                review.Comment,
                review.CreatedAt
            );

            return CreatedAtAction(nameof(GetProductReviews), new { productId = review.ProductId }, resultDto);
        }

        // Admin management endpoints
        [Authorize(Policy = "Permission:reviews.view")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var restaurant = await _context.RestaurantReviews.AsNoTracking().Select(r => new AdminReviewDto(
                "restaurant", r.ReviewId, null, null, r.CustomerName, r.PhoneNumber, r.Rating, r.Comment, r.AvatarUrl, r.VideoUrl, r.IsApproved, r.CreatedAt)).ToListAsync();
            var products = await _context.ProductReviews.AsNoTracking().Select(r => new AdminReviewDto(
                "product", r.ProductReviewId, r.ProductId, r.Product == null ? null : r.Product.NameAr, r.CustomerName, r.PhoneNumber, r.Rating, r.Comment ?? string.Empty, null, null, r.IsApproved, r.CreatedAt)).ToListAsync();
            return Ok(restaurant.Concat(products).OrderByDescending(r => r.CreatedAt));
        }

        [Authorize(Policy = "Permission:reviews.create")]
        [HttpPost("admin")]
        public async Task<IActionResult> CreateForAdmin([FromBody] AdminReviewCreateDto dto)
        {
            var validation = ValidateAdminReview(dto);
            if (validation != null) return validation;
            if (dto.Type == "restaurant")
            {
                var row = new RestaurantReview { CustomerName = dto.CustomerName.Trim(), PhoneNumber = NormalizePhone(dto.PhoneNumber), Rating = dto.Rating, Comment = dto.Comment.Trim(), AvatarUrl = dto.AvatarUrl, VideoUrl = dto.VideoUrl, IsApproved = dto.IsApproved, CreatedAt = DateTime.UtcNow };
                _context.RestaurantReviews.Add(row); await _context.SaveChangesAsync(); return Ok(new { id = row.ReviewId });
            }
            if (!await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId)) return BadRequest(new { message = "اختر منتجاً موجوداً." });
            var productRow = new ProductReview { ProductId = dto.ProductId!.Value, CustomerName = dto.CustomerName.Trim(), PhoneNumber = NormalizePhone(dto.PhoneNumber), Rating = dto.Rating, Comment = dto.Comment.Trim(), IsApproved = dto.IsApproved, CreatedAt = DateTime.UtcNow };
            _context.ProductReviews.Add(productRow); await _context.SaveChangesAsync(); return Ok(new { id = productRow.ProductReviewId });
        }

        [Authorize(Policy = "Permission:reviews.update")]
        [HttpPut("admin/{type}/{id:int}")]
        public async Task<IActionResult> UpdateForAdmin(string type, int id, [FromBody] AdminReviewCreateDto dto)
        {
            var validation = ValidateAdminReview(dto); if (validation != null) return validation;
            if (!string.Equals(type, dto.Type, StringComparison.OrdinalIgnoreCase)) return BadRequest(new { message = "نوع التقييم غير متطابق." });
            if (type == "restaurant")
            {
                var row = await _context.RestaurantReviews.FindAsync(id); if (row == null) return NotFound();
                row.CustomerName = dto.CustomerName.Trim(); row.PhoneNumber = NormalizePhone(dto.PhoneNumber); row.Rating = dto.Rating; row.Comment = dto.Comment.Trim(); row.AvatarUrl = dto.AvatarUrl; row.VideoUrl = dto.VideoUrl; row.IsApproved = dto.IsApproved;
            }
            else if (type == "product")
            {
                var row = await _context.ProductReviews.FindAsync(id); if (row == null) return NotFound();
                if (!await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId)) return BadRequest(new { message = "اختر منتجاً موجوداً." });
                row.ProductId = dto.ProductId!.Value; row.CustomerName = dto.CustomerName.Trim(); row.PhoneNumber = NormalizePhone(dto.PhoneNumber); row.Rating = dto.Rating; row.Comment = dto.Comment.Trim(); row.IsApproved = dto.IsApproved;
            }
            else return BadRequest(new { message = "نوع التقييم غير صالح." });
            await _context.SaveChangesAsync(); return NoContent();
        }

        [Authorize(Policy = "Permission:reviews.delete")]
        [HttpDelete("admin/{type}/{id:int}")]
        public async Task<IActionResult> DeleteForAdmin(string type, int id)
        {
            if (type == "restaurant") { var row = await _context.RestaurantReviews.FindAsync(id); if (row == null) return NotFound(); _context.RestaurantReviews.Remove(row); }
            else if (type == "product") { var row = await _context.ProductReviews.FindAsync(id); if (row == null) return NotFound(); _context.ProductReviews.Remove(row); }
            else return BadRequest(new { message = "نوع التقييم غير صالح." });
            await _context.SaveChangesAsync(); return NoContent();
        }

        private IActionResult? ValidateAdminReview(AdminReviewCreateDto dto)
        {
            if (dto.Type is not ("restaurant" or "product") || string.IsNullOrWhiteSpace(dto.CustomerName) || dto.CustomerName.Trim().Length > 150 || dto.Rating < 1 || dto.Rating > 5 || string.IsNullOrWhiteSpace(dto.Comment) || dto.Comment.Trim().Length > 1000 || (dto.PhoneNumber != null && dto.PhoneNumber.Trim().Length > 30))
                return BadRequest(new { message = "تحقق من نوع التقييم والاسم والتقييم والنص ورقم الهاتف." });
            return null;
        }

        private static string? NormalizePhone(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}