using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Infrastructure.Data;
using SouqSofra.Domain.Entities;
using SouqSofra.Application.DTOs;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrdersController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var order = new Order
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                DeliveryAddress = dto.DeliveryAddress,
                BranchId = dto.BranchId,
                PaymentMethod = dto.PaymentMethod,
                Notes = dto.Notes,
                DeliveryFee = 10.00m,
                OrderStatus = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            decimal subTotal = 0;
            foreach (var item in dto.Items)
            {
                var prod = await _context.Products.FindAsync(item.ProductId);
                if (prod == null) continue;

                var total = item.UnitPrice * item.Quantity;
                subTotal += total;

                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    VariantId = item.VariantId,
                    ProductNameAr = prod.NameAr,
                    ProductNameEn = prod.NameEn,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    TotalPrice = total
                });
            }

            order.SubTotal = subTotal;
            order.TotalAmount = subTotal + order.DeliveryFee;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderId = order.OrderId, orderNumber = order.OrderNumber, total = order.TotalAmount });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            order.OrderStatus = status;
            await _context.SaveChangesAsync();
            return Ok(order);
        }
    }
}
