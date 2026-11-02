using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Data;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Application.Common;
using SouqSofra.Application.DTOs;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UsersController(AppDbContext context) => _context = context;

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

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users.OrderBy(user => user.FullName)
                .Select(user => new StaffUserDto(user.UserId, user.FullName, user.Email, user.PhoneNumber,
                    RoleName(user.RoleId), user.IsActive, user.CreatedAt))
                .ToListAsync();
            return Ok(users);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStaffUserDto dto)
        {
            var roleId = RoleId(dto.Role);
            if (roleId == null) return BadRequest(new { message = "الدور يجب أن يكون User أو Admin أو SuperAdmin." });
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
                user.UserId, user.FullName, user.Email, user.PhoneNumber, RoleName(user.RoleId), user.IsActive, user.CreatedAt));
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateStaffRoleDto dto)
        {
            var roleId = RoleId(dto.Role);
            if (roleId == null) return BadRequest(new { message = "الدور يجب أن يكون User أو Admin أو SuperAdmin." });
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var parsedId) ? parsedId : 0;
            if (user.UserId == currentUserId && user.RoleId == 3 && roleId.Value != 3)
                return Conflict(new { message = "لا يمكنك إزالة صلاحية Super Admin من حسابك الحالي." });
            if (user.IsActive && user.RoleId == 3 && roleId.Value != 3 &&
                !await _context.Users.AnyAsync(other => other.UserId != id && other.IsActive && other.RoleId == 3))
                return Conflict(new { message = "يجب إبقاء حساب Super Admin نشط واحد على الأقل." });
            user.RoleId = roleId.Value;
            await _context.SaveChangesAsync();
            return Ok(new { userId = user.UserId, role = RoleName(user.RoleId) });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });
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
