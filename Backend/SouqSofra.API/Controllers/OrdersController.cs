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

        [Authorize(Roles = "Admin,User,SuperAdmin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Items).ThenInclude(item => item.Addons)
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
                        i.TotalPrice,
                        i.Addons.Select(addon => new OrderItemAddonDto(addon.AddonId, addon.NameAr, addon.NameEn, addon.Price)).ToList()
                    )).ToList(),
                    o.OrderChannel
                ))
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Admin,User,SuperAdmin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var o = await _context.Orders.Include(x => x.Items).ThenInclude(item => item.Addons).FirstOrDefaultAsync(x => x.OrderId == id);
            if (o == null) return NotFound(new { message = "الطلب غير موجود." });

            var dto = new OrderDto(
                o.OrderId, o.OrderNumber, o.CustomerName, o.CustomerPhone, o.CustomerEmail,
                o.DeliveryAddress, o.BranchId, o.SubTotal, o.DeliveryFee, o.TotalAmount,
                o.PaymentMethod, o.OrderStatus, o.Notes, o.CreatedAt,
                o.Items.Select(i => new OrderItemDto(
                    i.OrderItemId, i.ProductId, i.VariantId, i.ProductNameAr, i.ProductNameEn,
                    i.VariantNameAr, i.UnitPrice, i.Quantity, i.TotalPrice,
                    i.Addons.Select(addon => new OrderItemAddonDto(addon.AddonId, addon.NameAr, addon.NameEn, addon.Price)).ToList()
                )).ToList(),
                o.OrderChannel
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
                OrderChannel = HttpContext.Request.Path.Value?.EndsWith("/whatsapp", StringComparison.OrdinalIgnoreCase) == true ? "WhatsApp" : "Website",
                CreatedAt = DateTime.UtcNow
            };

            decimal subTotal = 0;
            foreach (var item in dto.Items)
            {
                if (item.Quantity <= 0)
                    return BadRequest(new { message = "كمية المنتج يجب أن تكون أكبر من صفر." });

                var prod = await _context.Products.Include(product => product.Variants).Include(product => product.Addons)
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

                var selectedAddonIds = item.AddonIds ?? new List<int>();
                if (selectedAddonIds.Count != selectedAddonIds.Distinct().Count())
                    return BadRequest(new { message = "لا يمكن اختيار الإضافة أكثر من مرة." });

                var selectedAddons = prod.Addons
                    .Where(addon => addon.IsAvailable && selectedAddonIds.Contains(addon.AddonId))
                    .ToList();
                if (selectedAddons.Count != selectedAddonIds.Count)
                    return BadRequest(new { message = "إحدى الإضافات غير صالحة أو غير متاحة لهذا المنتج." });

                var addonUnitTotal = selectedAddons.Sum(addon => addon.Price);
                var lineUnitPrice = unitPrice + addonUnitTotal;
                var total = lineUnitPrice * item.Quantity;
                subTotal += total;

                var orderItem = new OrderItem
                {
                    ProductId = prod.ProductId,
                    VariantId = item.VariantId,
                    ProductNameAr = prod.NameAr,
                    ProductNameEn = prod.NameEn,
                    VariantNameAr = variantNameAr,
                    UnitPrice = unitPrice,
                    Quantity = item.Quantity,
                    TotalPrice = total
                };
                foreach (var addon in selectedAddons)
                    orderItem.Addons.Add(new OrderItemAddon
                    {
                        AddonId = addon.AddonId,
                        NameAr = addon.NameAr,
                        NameEn = addon.NameEn,
                        Price = addon.Price
                    });
                order.Items.Add(orderItem);
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

        [Authorize(Roles = "Admin,User,SuperAdmin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "الطلب غير موجود." });

            order.OrderStatus = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderId = order.OrderId, status = order.OrderStatus });
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
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
