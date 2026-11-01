using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Infrastructure.Data;
using SouqSofra.Application.DTOs;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context) => _context = context;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
            if (user == null || request.Password != "Admin@123456") // In production verify password hash
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Return JWT token (mock token for demonstration, easily replaceable with JwtSecurityTokenHandler)
            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.souq_sofra_admin_token_" + Guid.NewGuid();
            return Ok(new LoginResponseDto(token, user.FullName, user.Email, "Admin"));
        }
    }
}
