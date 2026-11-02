using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SouqSofra.Application.Common;
using SouqSofra.Application.DTOs;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "البريد الإلكتروني وكلمة المرور مطلوبان." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower() && u.IsActive);
            if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "بيانات تسجيل الدخول غير صحيحة." });
            }

            var role = RoleName(user.RoleId);
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SouqSofra_SuperSecret_Jwt_SecurityKey_2026_AbuDhabi_Dubai_UAE_123456789!");
            var expiryDays = int.TryParse(_configuration["Jwt:ExpiryInDays"], out int days) ? days : 7;
            var expires = DateTime.UtcNow.AddDays(expiryDays);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, role)
                }),
                Expires = expires,
                Issuer = _configuration["Jwt:Issuer"] ?? "SouqSofraAPI",
                Audience = _configuration["Jwt:Audience"] ?? "SouqSofraApp",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new LoginResponseDto(tokenString, user.FullName, user.Email, role, expires));
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            return Ok(new
            {
                user.UserId,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                Role = RoleName(user.RoleId)
            });
        }

        [Authorize(Roles = "Admin,User,SuperAdmin")]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!PasswordHasher.VerifyPassword(dto.OldPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "كلمة المرور الحالية غير صحيحة." });
            }

            user.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "تم تحديث كلمة المرور بنجاح." });
        }
        private static string RoleName(int roleId) => roleId switch
        {
            1 => "Admin",
            2 => "User",
            3 => "SuperAdmin",
            _ => "User"
        };
    }
}
