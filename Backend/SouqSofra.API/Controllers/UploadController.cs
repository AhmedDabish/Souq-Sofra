using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        public UploadController(IWebHostEnvironment env) => _env = env;

        [HttpPost]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile? file, [FromQuery] string folder = "products")
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "يرجى اختيار صورة أولاً." });
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "حجم الصورة يجب ألا يتجاوز 10 ميجابايت." });

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { message = "الصيغ المدعومة: JPG, JPEG, PNG, WEBP, GIF." });
            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "الملف المحدد ليس صورة صالحة." });

            var safeFolder = folder.ToLowerInvariant() switch
            {
                "categories" => "categories",
                "banners" => "banners",
                "logo" => "logo",
                _ => "products"
            };
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var directory = Path.Combine(webRoot, "uploads", safeFolder);
            Directory.CreateDirectory(directory);

            var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8]}{extension.ToLowerInvariant()}";
            var fullPath = Path.Combine(directory, fileName);
            await using (var stream = System.IO.File.Create(fullPath))
                await file.CopyToAsync(stream);

            var relativeUrl = $"/uploads/{safeFolder}/{fileName}";
            return Ok(new { url = relativeUrl, fullUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}", fileName, folder = safeFolder });
        }
    }
}
