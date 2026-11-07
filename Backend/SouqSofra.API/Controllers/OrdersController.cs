using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Data;
using System.Globalization;
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

        [Authorize(Policy = "Permission:orders.view")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .AsSplitQuery()
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
                        i.VariantNameEn,
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

        [Authorize(Policy = "Permission:orders.view")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var o = await _context.Orders.AsSplitQuery().Include(x => x.Items).ThenInclude(item => item.Addons).FirstOrDefaultAsync(x => x.OrderId == id);
            if (o == null) return NotFound(new { message = "الطلب غير موجود." });

            var dto = new OrderDto(
                o.OrderId, o.OrderNumber, o.CustomerName, o.CustomerPhone, o.CustomerEmail,
                o.DeliveryAddress, o.BranchId, o.SubTotal, o.DeliveryFee, o.TotalAmount,
                o.PaymentMethod, o.OrderStatus, o.Notes, o.CreatedAt,
                o.Items.Select(i => new OrderItemDto(
                    i.OrderItemId, i.ProductId, i.VariantId, i.ProductNameAr, i.ProductNameEn,
                    i.VariantNameAr, i.VariantNameEn, i.UnitPrice, i.Quantity, i.TotalPrice,
                    i.Addons.Select(addon => new OrderItemAddonDto(addon.AddonId, addon.NameAr, addon.NameEn, addon.Price)).ToList()
                )).ToList(),
                o.OrderChannel
            );

            return Ok(dto);
        }

        // Public order submission from Angular storefront
        [HttpPost]
        [HttpPost("whatsapp")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "لا يمكن إتمام الطلب بدون إضافة أصناف." });
            }

            var isPickup = string.Equals(dto.DeliveryType, "pickup", StringComparison.OrdinalIgnoreCase);
            decimal deliveryFee = 0m;
            string deliveryAddress;
            if (isPickup)
            {
                deliveryAddress = "استلام من الفرع";
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.DeliveryZoneId))
                    return BadRequest(new { message = "اختر منطقة توصيل متاحة أولاً." });

                var zoneSettings = await _context.SiteSettings
                    .Where(setting => setting.SettingKey == "DeliveryZones" || setting.SettingKey == "DeliveryZonesChunkCount" || setting.SettingKey.StartsWith("DeliveryZonesChunk_"))
                    .ToDictionaryAsync(setting => setting.SettingKey, setting => setting.SettingValue);
                var zonesJson = zoneSettings.TryGetValue("DeliveryZonesChunkCount", out var countValue) &&
                    int.TryParse(countValue, out var chunkCount) && chunkCount > 0
                    ? string.Concat(Enumerable.Range(0, chunkCount).Select(index => zoneSettings.GetValueOrDefault($"DeliveryZonesChunk_{index}", string.Empty)))
                    : zoneSettings.GetValueOrDefault("DeliveryZones", null);
                var zones = ParseDeliveryZones(zonesJson);
                var zone = zones.FirstOrDefault(candidate => candidate.Id == dto.DeliveryZoneId && candidate.Enabled);
                if (zone == null)
                    return BadRequest(new { message = "منطقة التوصيل المختارة غير متاحة. اختر منطقة أخرى." });
                if (!dto.DeliveryLatitude.HasValue || !dto.DeliveryLongitude.HasValue ||
                    dto.DeliveryLatitude.Value < 22.5 || dto.DeliveryLatitude.Value > 26.5 ||
                    dto.DeliveryLongitude.Value < 51.4 || dto.DeliveryLongitude.Value > 56.5)
                    return BadRequest(new { message = "حدد موقع التوصيل على الخريطة داخل دولة الإمارات." });
                deliveryFee = zone.Fee;
                var coordinates = dto.DeliveryLatitude.HasValue && dto.DeliveryLongitude.HasValue
                    ? $" (الموقع: {dto.DeliveryLatitude.Value:F6}, {dto.DeliveryLongitude.Value:F6})" : string.Empty;
                deliveryAddress = $"توصيل - {zone.Emirate}، {zone.Name} - {dto.DeliveryAddress?.Trim()}{coordinates}";
            }

            var order = new Order
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                DeliveryAddress = deliveryAddress,
                BranchId = dto.BranchId > 0 ? dto.BranchId : 1,
                PaymentMethod = "CashOnDelivery",
                Notes = dto.Notes,
                DeliveryFee = deliveryFee,
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
                string? variantNameEn = null;
                if (item.VariantId.HasValue)
                {
                    var variant = prod.Variants.FirstOrDefault(candidate => candidate.VariantId == item.VariantId.Value);
                    if (variant == null)
                        return BadRequest(new { message = "اختيار الحجم غير صالح لهذا المنتج." });

                    unitPrice = variant.Price;
                    variantNameAr = variant.NameAr;
                    variantNameEn = variant.NameEn;
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
                    VariantNameEn = variantNameEn,
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

            // Persist a sequential order number that restarts every fixed 48-hour UTC window.
            // Serializable isolation ensures concurrent checkouts receive distinct numbers.
            var windowId = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / (48 * 60 * 60);
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var lockResource = $"SouqSofra.OrderNumber.{windowId}";
            await _context.Database.ExecuteSqlInterpolatedAsync($"DECLARE @lockResult int; EXEC @lockResult = sp_getapplock @Resource = {lockResource}, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 15000; IF @lockResult < 0 THROW 51000, 'Could not reserve an order number.', 1;");
            var sequence = await _context.OrderNumberSequences.SingleOrDefaultAsync(item => item.WindowId == windowId);
            if (sequence == null)
            {
                sequence = new OrderNumberSequence { WindowId = windowId, LastNumber = 1 };
                _context.OrderNumberSequences.Add(sequence);
            }
            else
            {
                sequence.LastNumber++;
            }

            order.OrderNumber = sequence.LastNumber.ToString(CultureInfo.InvariantCulture);
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                orderId = order.OrderId,
                orderNumber = order.OrderNumber,
                total = order.TotalAmount,
                message = "تم استلام طلبك بنجاح وسيتواصل معك فريق سوق وسفرة."
            });
        }

        private static List<DeliveryZoneSetting> ParseDeliveryZones(string? json)
        {
            if (!string.IsNullOrWhiteSpace(json))
            {
                try
                {
                    var configured = JsonSerializer.Deserialize<List<DeliveryZoneSetting>>(json,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (configured != null)
                    {
                        if (!configured.Any(zone => zone.Enabled))
                        {
                            var defaultEmirates = new[] { "أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة" };
                            var defaults = defaultEmirates.Select((name, index) => new DeliveryZoneSetting($"uae-{index + 1}", name, name, 10m, true));
                            return configured.Where(zone => !zone.Id.StartsWith("uae-", StringComparison.OrdinalIgnoreCase))
                                .Concat(defaults).ToList();
                        }
                        return configured;
                    }
                }
                catch (JsonException) { }
            }

            var emirates = new[] { "أبوظبي", "دبي", "الشارقة", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة" };
            return emirates.Select((name, index) => new DeliveryZoneSetting($"uae-{index + 1}", name, name, 10m, true)).ToList();
        }

        private sealed record DeliveryZoneSetting(string Id, string Emirate, string Name, decimal Fee, bool Enabled);

        [Authorize(Policy = "Permission:orders.update")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "الطلب غير موجود." });

            order.OrderStatus = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderId = order.OrderId, status = order.OrderStatus });
        }

        [Authorize(Policy = "Permission:orders.delete")]
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
