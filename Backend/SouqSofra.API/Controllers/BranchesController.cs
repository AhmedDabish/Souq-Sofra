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
    public class BranchesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BranchesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var branches = await _context.Branches
                .Where(b => b.IsActive)
                .Select(b => new BranchDto(
                    b.BranchId, b.NameAr, b.NameEn, b.AddressAr, b.AddressEn,
                    b.Phone, b.WhatsApp, b.Latitude, b.Longitude, b.IsActive
                ))
                .ToListAsync();

            return Ok(branches);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Branch branch)
        {
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = branch.BranchId }, branch);
        }
    }
}
