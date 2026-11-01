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
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrdersController(AppDbContext context) => _context = context;

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDto(
                    o.OrderId,
                    o.OrderNumber,
                    o.CustomerName,
                    o.CustomerPhone,
                    o.CustomerEmail,
                    o.DeliveryAddress,
                    o.BranchId,
                    o.SubTotal,
                    o.DeliveryFee,
                    o.TotalAmount,
                    o.PaymentMethod,
                    o.OrderStatus,
                    o.Notes,
                    o.CreatedAt,
                    o.Items.Select(i => new OrderItemDto(
                        i.OrderItemId,
                        i.ProductId,
                        i.VariantId,
                        i.ProductNameAr,
                        i.ProductNameEn,
                        i.VariantNameAr,
                        i.UnitPrice,
                        i.Quantity,
                        i.TotalPrice
                    )).ToList()
                ))
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var o = await _context.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.OrderId == id);
            if (o == null) return NotFound(new { message = "الطلب غير موجود." });

            var dto = new OrderDto(
                o.OrderId, o.OrderNumber, o.CustomerName, o.CustomerPhone, o.CustomerEmail,
                o.DeliveryAddress, o.BranchId, o.SubTotal, o.DeliveryFee, o.TotalAmount,
                o.PaymentMethod, o.OrderStatus, o.Notes, o.CreatedAt,
                o.Items.Select(i => new OrderItemDto(
                    i.OrderItemId, i.ProductId, i.VariantId, i.ProductNameAr, i.ProductNameEn,
                    i.VariantNameAr, i.UnitPrice, i.Quantity, i.TotalPrice
                )).ToList()
            );

            return Ok(dto);
        }

        // Public order submission from Angular storefront
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "لا يمكن إتمام الطلب بدون إضافة أصناف." });
            }

            var order = new Order
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                DeliveryAddress = string.IsNullOrWhiteSpace(dto.DeliveryAddress) ? "استلام من الفرع" : dto.DeliveryAddress,
                BranchId = dto.BranchId > 0 ? dto.BranchId : 1,
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "CashOnDelivery" : dto.PaymentMethod,
                Notes = dto.Notes,
                DeliveryFee = 10.00m,
                OrderStatus = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            decimal subTotal = 0;
            foreach (var item in dto.Items)
            {
                if (item.Quantity <= 0)
                    return BadRequest(new { message = "كمية المنتج يجب أن تكون أكبر من صفر." });

                var prod = await _context.Products.Include(product => product.Variants)
                    .FirstOrDefaultAsync(product => product.ProductId == item.ProductId && product.IsAvailable);
                if (prod == null)
                    return BadRequest(new { message = "أحد المنتجات غير متاح حالياً. حدّث السلة وحاول مرة أخرى." });

                decimal unitPrice;
                string? variantNameAr = null;
                if (item.VariantId.HasValue)
                {
                    var variant = prod.Variants.FirstOrDefault(candidate => candidate.VariantId == item.VariantId.Value);
                    if (variant == null)
                        return BadRequest(new { message = "اختيار الحجم غير صالح لهذا المنتج." });

                    unitPrice = variant.Price;
                    variantNameAr = variant.NameAr;
                    if (variant.IsDefault && prod.DiscountPrice.HasValue && prod.DiscountPrice.Value > 0 && prod.DiscountPrice.Value < prod.BasePrice)
                        unitPrice = decimal.Round(variant.Price * (prod.DiscountPrice.Value / prod.BasePrice), 2, MidpointRounding.AwayFromZero);
                }
                else
                {
                    unitPrice = prod.DiscountPrice.HasValue && prod.DiscountPrice.Value > 0 && prod.DiscountPrice.Value < prod.BasePrice
                        ? prod.DiscountPrice.Value
                        : prod.BasePrice;
                }

                var total = unitPrice * item.Quantity;
                subTotal += total;

                order.Items.Add(new OrderItem
                {
                    ProductId = prod.ProductId,
                    VariantId = item.VariantId,
                    ProductNameAr = prod.NameAr,
                    ProductNameEn = prod.NameEn,
                    VariantNameAr = variantNameAr,
                    UnitPrice = unitPrice,
                    Quantity = item.Quantity,
                    TotalPrice = total
                });
            }

            order.SubTotal = subTotal;
            order.TotalAmount = subTotal + order.DeliveryFee;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                orderId = order.OrderId,
                orderNumber = order.OrderNumber,
                total = order.TotalAmount,
                message = "تم استلام طلبك بنجاح وسيتواصل معك فريق سوق وسفرة."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "الطلب غير موجود." });

            order.OrderStatus = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderId = order.OrderId, status = order.OrderStatus });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "الطلب غير موجود." });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
