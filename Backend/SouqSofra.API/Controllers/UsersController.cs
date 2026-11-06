using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Data;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Application.Common;
using SouqSofra.Application.DTOs;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;
using SouqSofra.Domain.Authorization;
using System.Text.Json;
using SouqSofra.API.Authorization;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public UsersController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("bootstrap-super-admin")]
        public async Task<IActionResult> BootstrapSuperAdmin([FromBody] BootstrapSuperAdminDto dto)
        {
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : 0;
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null || user.RoleId != 1 || !user.IsActive ||
                !string.Equals(user.Email, "admin@souqsofra.com", StringComparison.OrdinalIgnoreCase))
                return Forbid();
            if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
                return Unauthorized(new { message = "كلمة المرور الحالية غير صحيحة." });
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 10)
                return BadRequest(new { message = "كلمة المرور الجديدة يجب ألا تقل عن 10 أحرف." });
            if (PasswordHasher.VerifyPassword("Admin@123456", user.PasswordHash) &&
                string.Equals(dto.NewPassword, "Admin@123456", StringComparison.Ordinal))
                return BadRequest(new { message = "اختر كلمة مرور جديدة مختلفة عن كلمة المرور الافتراضية." });
            if (await _context.Users.AnyAsync(other => other.IsActive && other.RoleId == 3))
                return Conflict(new { message = "يوجد Super Admin نشط بالفعل." });

            user.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
            user.RoleId = 3;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(new { success = true, message = "تم تفعيل Super Admin. سجّل الخروج ثم ادخل مرة أخرى لتحديث صلاحيات الجلسة." });
        }


        [Authorize(Policy = "Permission:users.view")]
        [HttpGet("permissions/catalog")]
        public IActionResult GetPermissionCatalog()
        {
            var permissions = PermissionDefinitions.All.Select(permission => new
            {
                permission.Key,
                permission.Group,
                permission.GroupEn,
                permission.Label,
                permission.LabelEn
            });
            return Ok(permissions);
        }

        [Authorize(Policy = "Permission:users.view")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _context.Users.OrderBy(user => user.FullName).AsNoTracking().ToListAsync();
            var users = records.Select(user => new StaffUserDto(user.UserId, user.FullName, user.Email, user.PhoneNumber,
                RoleName(user.RoleId), user.IsActive, user.CreatedAt, EffectivePermissions(user))).ToList();
            return Ok(users);
        }

        [Authorize(Policy = "Permission:users.create")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStaffUserDto dto)
        {
            var roleId = RoleId(dto.Role);
            if (roleId == null) return BadRequest(new { message = "الدور يجب أن يكون User أو Admin أو SuperAdmin." });
            if (roleId.Value == 3 && User.FindFirst(ClaimTypes.Role)?.Value != "SuperAdmin")
                return Forbid();
            if (string.IsNullOrWhiteSpace(dto.FullName) || dto.FullName.Trim().Length > 150)
                return BadRequest(new { message = "اكتب اسمًا صحيحًا لا يتجاوز 150 حرفًا." });
            if (string.IsNullOrWhiteSpace(dto.Email) || dto.Email.Trim().Length > 150 || !dto.Email.Contains('@'))
                return BadRequest(new { message = "اكتب بريدًا إلكترونيًا صحيحًا." });
            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 10)
                return BadRequest(new { message = "كلمة المرور يجب ألا تقل عن 10 أحرف." });
            if (await _context.Users.AnyAsync(user => user.Email.ToLower() == dto.Email.Trim().ToLower()))
                return Conflict(new { message = "هذا البريد مسجل بالفعل." });

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim(),
                PasswordHash = PasswordHasher.HashPassword(dto.Password),
                RoleId = roleId.Value,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = user.UserId }, new StaffUserDto(
                user.UserId, user.FullName, user.Email, user.PhoneNumber, RoleName(user.RoleId), user.IsActive, user.CreatedAt, EffectivePermissions(user)));
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateStaffRoleDto dto)
        {
            var roleId = RoleId(dto.Role);
            if (roleId == null) return BadRequest(new { message = "الدور يجب أن يكون User أو Admin أو SuperAdmin." });
            if (roleId.Value == 3 && User.FindFirst(ClaimTypes.Role)?.Value != "SuperAdmin")
                return Forbid();
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : 0;
            if (user.UserId == currentUserId && user.RoleId == 3 && roleId.Value != 3)
                return Conflict(new { message = "لا يمكنك إزالة صلاحية Super Admin من حسابك الحالي." });
            if (user.IsActive && user.RoleId == 3 && roleId.Value != 3 &&
                !await _context.Users.AnyAsync(other => other.UserId != id && other.IsActive && other.RoleId == 3))
                return Conflict(new { message = "يجب إبقاء حساب Super Admin نشط واحد على الأقل." });
            user.RoleId = roleId.Value;
            user.PermissionsJson = null; // A role change restores that role's safe defaults.
            await _context.SaveChangesAsync();
            return Ok(new { userId = user.UserId, role = RoleName(user.RoleId) });
        }


        [Authorize(Policy = "Permission:users.update")]
        [HttpPut("{id:int}/permissions")]
        public async Task<IActionResult> UpdatePermissions(int id, [FromBody] UpdateStaffPermissionsDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });
            if (user.RoleId == 3) return Conflict(new { message = "لا يمكن تخصيص صلاحيات Super Admin؛ لديه جميع الصلاحيات دائمًا." });
            var permissions = dto.Permissions ?? [];
            if (permissions.Any(permission => !PermissionCatalog.IsKnown(permission)))
                return BadRequest(new { message = "تتضمن القائمة صلاحية غير معروفة." });
            var actorId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedActorId) ? parsedActorId : 0;
            var actor = await _context.Users.AsNoTracking().FirstOrDefaultAsync(candidate => candidate.UserId == actorId && candidate.IsActive);
            if (actor == null) return Forbid();
            if (actor.RoleId != 3 && permissions.Except(EffectivePermissions(actor), StringComparer.Ordinal).Any())
                return Forbid();
            if (user.UserId == actorId &&
                !permissions.Contains("users.update", StringComparer.Ordinal))
                return Conflict(new { message = "لا يمكنك إزالة صلاحية إدارة المستخدمين من حسابك الحالي." });
            user.PermissionsJson = JsonSerializer.Serialize(permissions.Distinct(StringComparer.Ordinal).ToArray());
            await _context.SaveChangesAsync();
            return Ok(new { userId = user.UserId, permissions = permissions.Distinct(StringComparer.Ordinal).ToArray() });
        }

        [Authorize(Policy = "Permission:users.delete")]
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });
            if (user.RoleId == 3 && User.FindFirst(ClaimTypes.Role)?.Value != "SuperAdmin") return Forbid();
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : 0;
            if (user.UserId == currentUserId && user.IsActive)
                return Conflict(new { message = "لا يمكنك إيقاف حسابك الحالي." });
            if (user.IsActive && user.RoleId == 3 &&
                !await _context.Users.AnyAsync(other => other.UserId != id && other.IsActive && other.RoleId == 3))
                return Conflict(new { message = "يجب إبقاء حساب Super Admin نشط واحد على الأقل." });
            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { userId = user.UserId, isActive = user.IsActive });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var user = await _context.Users.FirstOrDefaultAsync(candidate => candidate.UserId == id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : 0;
            if (user.UserId == currentUserId)
                return Conflict(new { message = "لا يمكنك حذف حسابك الحالي." });

            if (user.IsActive && user.RoleId == 3 &&
                !await _context.Users.AnyAsync(other => other.UserId != id && other.IsActive && other.RoleId == 3))
                return Conflict(new { message = "لا يمكن حذف آخر حساب Super Admin نشط." });

            await RememberDeletedBootstrapUserAsync(user.Email);
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return NoContent();
        }

        private async Task RememberDeletedBootstrapUserAsync(string email)
        {
            var bootstrapEmails = new[]
            {
                _configuration["BootstrapUsers:Admin:Email"] ?? "admin@souqsofra.com",
                _configuration["BootstrapUsers:SuperAdmin:Email"] ?? "superadmin@souqsofra.com",
                _configuration["BootstrapUsers:User:Email"] ?? "user@souqsofra.com",
                _configuration["BootstrapUsers:Developer:Email"] ?? "developer@souqsofra.com"
            };
            if (!bootstrapEmails.Contains(email, StringComparer.OrdinalIgnoreCase)) return;

            const string settingKey = "DeletedBootstrapUsers";
            var setting = await _context.SiteSettings.FirstOrDefaultAsync(item => item.SettingKey == settingKey);
            var deletedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (setting != null)
            {
                try
                {
                    foreach (var storedEmail in JsonSerializer.Deserialize<string[]>(setting.SettingValue) ?? [])
                        deletedEmails.Add(storedEmail);
                }
                catch (JsonException) { /* Recover by starting a fresh tombstone list. */ }
            }
            deletedEmails.Add(email);
            var value = JsonSerializer.Serialize(deletedEmails);
            if (setting == null)
                _context.SiteSettings.Add(new SiteSetting { SettingKey = settingKey, SettingValue = value, Description = "Prevents deleted bootstrap accounts from being recreated." });
            else
                setting.SettingValue = value;
        }

        private static IReadOnlyList<string> EffectivePermissions(User user)
        {
            if (string.IsNullOrWhiteSpace(user.PermissionsJson)) return PermissionCatalog.ForRole(user.RoleId);
            try { return JsonSerializer.Deserialize<string[]>(user.PermissionsJson) ?? []; }
            catch (JsonException) { return []; }
        }

        private static int? RoleId(string? role) => role?.Trim().ToLowerInvariant() switch
        {
            "user" => 2,
            "admin" => 1,
            "superadmin" => 3,
            _ => null
        };

        private static string RoleName(int roleId) => roleId switch
        {
            1 => "Admin",
            2 => "User",
            3 => "SuperAdmin",
            _ => "User"
        };
    }
}
