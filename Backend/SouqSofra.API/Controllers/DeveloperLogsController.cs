using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.API.Middleware;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers;

[ApiController]
[Route("api/developer-logs")]
[Authorize(Roles = "SuperAdmin")]
public sealed class DeveloperLogsController(
    RequestDiagnosticsLogWriter logWriter,
    AppDbContext db) : ControllerBase
{
    private const string DeveloperEmail = "developer@souqsofra.com";

    [HttpGet("files")]
    public async Task<IActionResult> GetFiles([FromQuery] string? fromDate, [FromQuery] string? toDate)
    {
        if (!await IsDeveloperAccountAsync()) return Forbid();
        if (!TryParseDate(fromDate, out var from) || !TryParseDate(toDate, out var to))
            return BadRequest(new { message = "استخدم التاريخ بصيغة YYYY-MM-DD." });
        if (from.HasValue && to.HasValue && from.Value > to.Value)
            return BadRequest(new { message = "تاريخ البداية يجب ألا يتجاوز تاريخ النهاية." });
        if (from.HasValue && to.HasValue && to.Value.DayNumber - from.Value.DayNumber > 30)
            return BadRequest(new { message = "يمكن تنزيل سجلات لمدة تصل إلى 31 يومًا في كل مرة." });

        return Ok(logWriter.GetAvailableFiles(from, to));
    }

    [HttpGet("{date}")]
    public async Task<IActionResult> DownloadDay(string date)
    {
        if (!await IsDeveloperAccountAsync()) return Forbid();
        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
            return BadRequest(new { message = "التاريخ غير صحيح. استخدم YYYY-MM-DD." });
        if (!logWriter.TryGetLogFile(parsedDate, out var path))
            return NotFound(new { message = "لا يوجد ملف سجلات لهذا التاريخ." });

        var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete, 64 * 1024, useAsync: true);
        return File(stream, "application/x-ndjson; charset=utf-8", $"api-{parsedDate:yyyy-MM-dd}.jsonl");
    }

    private async Task<bool> IsDeveloperAccountAsync()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return false;
        return await db.Users.AsNoTracking().AnyAsync(user =>
            user.UserId == userId && user.IsActive && user.RoleId == 3 && user.Email == DeveloperEmail);
    }

    private static bool TryParseDate(string? value, out DateOnly? date)
    {
        date = null;
        if (string.IsNullOrWhiteSpace(value)) return true;
        if (!DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)) return false;
        date = parsed;
        return true;
    }
}
