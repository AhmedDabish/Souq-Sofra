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


        [Authorize(Policy = "Permission:settings.update")]
        [HttpPut("bulk")]
        public async Task<IActionResult> UpdateSettings([FromBody] Dictionary<string, string> updates)
        {
            if (updates == null || updates.Count == 0)
                return BadRequest(new { message = "At least one setting is required." });

            if (updates.Any(item => string.IsNullOrWhiteSpace(item.Key) || item.Key.Length > 100 || item.Value == null || item.Value.Length > 1000))
                return BadRequest(new { message = "Setting keys must be 1-100 characters and values must not exceed 1000 characters." });

            var keys = updates.Keys.ToList();
            var existing = await _context.SiteSettings.Where(setting => keys.Contains(setting.SettingKey)).ToListAsync();
            var existingByKey = existing.ToDictionary(setting => setting.SettingKey);
            var now = DateTime.UtcNow;

            foreach (var (key, value) in updates)
            {
                if (existingByKey.TryGetValue(key, out var setting))
                {
                    setting.SettingValue = value;
                    setting.UpdatedAt = now;
                }
                else
                {
                    _context.SiteSettings.Add(new SiteSetting
                    {
                        SettingKey = key,
                        SettingValue = value,
                        UpdatedAt = now
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { updated = updates.Count });
        }

        [Authorize(Policy = "Permission:settings.update")]
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
