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
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SettingsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.SiteSettings
                .ToDictionaryAsync(s => s.SettingKey, s => s.SettingValue);

            return Ok(settings);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPut]
        public async Task<IActionResult> UpdateSetting([FromBody] UpdateSiteSettingDto dto)
        {
            var setting = await _context.SiteSettings.FindAsync(dto.SettingKey);
            if (setting == null)
            {
                setting = new SiteSetting
                {
                    SettingKey = dto.SettingKey,
                    SettingValue = dto.SettingValue,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.SiteSettings.Add(setting);
            }
            else
            {
                setting.SettingValue = dto.SettingValue;
                setting.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(setting);
        }
    }
}
