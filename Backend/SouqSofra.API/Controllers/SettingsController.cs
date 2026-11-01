using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SettingsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.SiteSettings.ToDictionaryAsync(s => s.SettingKey, s => s.SettingValue);
            return Ok(settings);
        }
    }
}
