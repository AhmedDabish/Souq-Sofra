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


        [Authorize(Policy = "Permission:branches.view")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var branches = await _context.Branches.AsNoTracking().OrderBy(branch => branch.NameAr)
                .Select(branch => new BranchDto(branch.BranchId, branch.NameAr, branch.NameEn, branch.AddressAr, branch.AddressEn,
                    branch.Phone, branch.WhatsApp, branch.Latitude, branch.Longitude, branch.IsActive))
                .ToListAsync();
            return Ok(branches);
        }

        [Authorize(Policy = "Permission:branches.create")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Branch branch)
        {
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = branch.BranchId }, branch);
        }

        [Authorize(Policy = "Permission:branches.update")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Branch dto)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return NotFound(new { message = "الفرع غير موجود." });
            branch.NameAr = dto.NameAr; branch.NameEn = dto.NameEn;
            branch.AddressAr = dto.AddressAr; branch.AddressEn = dto.AddressEn;
            branch.Phone = dto.Phone; branch.WhatsApp = dto.WhatsApp;
            branch.Latitude = dto.Latitude; branch.Longitude = dto.Longitude; branch.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return Ok(branch);
        }

        [Authorize(Policy = "Permission:branches.delete")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return NotFound(new { message = "الفرع غير موجود." });
            if (await _context.Orders.AnyAsync(order => order.BranchId == id))
                return Conflict(new { message = "لا يمكن حذف فرع مرتبط بطلبات سابقة؛ عطّل الفرع بدلًا من ذلك." });
            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
