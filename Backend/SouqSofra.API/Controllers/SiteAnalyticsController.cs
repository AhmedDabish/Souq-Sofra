using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using SouqSofra.Domain.Entities;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public sealed class SiteAnalyticsController(AppDbContext db) : ControllerBase
    {
        [AllowAnonymous]
        [EnableRateLimiting("pageviews")]
        [HttpPost("visit")]
        public async Task<IActionResult> RecordVisit([FromBody] RecordVisitRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.SessionKey) || request.SessionKey.Length > 100 ||
                string.IsNullOrWhiteSpace(request.PagePath) || request.PagePath.Length > 200 || !request.PagePath.StartsWith('/'))
                return BadRequest();

            var path = request.PagePath.Split('?', '#')[0].Trim();
            if (path.Length == 0 || path.StartsWith("/admin", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase))
                return NoContent();

            var sessionHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.SessionKey)));
            var cutoff = DateTime.UtcNow.AddMinutes(-30);
            var duplicate = await db.SiteVisits.AnyAsync(visit => visit.SessionKeyHash == sessionHash &&
                visit.PagePath == path && visit.VisitedAtUtc >= cutoff, cancellationToken);
            if (!duplicate)
            {
                db.SiteVisits.Add(new SiteVisit
                {
                    SessionKeyHash = sessionHash,
                    PagePath = path,
                    VisitedAtUtc = DateTime.UtcNow
                });
                await db.SaveChangesAsync(cancellationToken);
            }

            return NoContent();
        }

        [Authorize(Policy = "Permission:analytics.view")]
        [HttpGet]
        public async Task<IActionResult> GetAnalytics(CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var start = now.Date.AddDays(-29);
            var visits = await db.SiteVisits.AsNoTracking()
                .Where(visit => visit.VisitedAtUtc >= start)
                .Select(visit => new { visit.SessionKeyHash, visit.PagePath, visit.VisitedAtUtc })
                .ToListAsync(cancellationToken);

            var completedOrders = await db.Orders.AsNoTracking()
                .Where(order => order.OrderStatus == "Completed" && order.CreatedAt >= start)
                .Select(order => new { order.OrderId, order.TotalAmount, order.CreatedAt, order.OrderChannel })
                .ToListAsync(cancellationToken);

            var completedItems = await db.OrderItems.AsNoTracking()
                .Where(item => item.Order != null && item.Order.OrderStatus == "Completed" && item.Order.CreatedAt >= start)
                .Select(item => new { item.ProductId, item.ProductNameAr, item.ProductNameEn, item.Quantity, item.OrderId })
                .ToListAsync(cancellationToken);

            var orderCount = completedOrders.Count;
            var productPageViews = visits.Where(visit => visit.PagePath.StartsWith("/product/", StringComparison.OrdinalIgnoreCase))
                .GroupBy(visit => visit.PagePath[9..].Split('/', '?', '#')[0])
                .ToDictionary(group => group.Key, group => new { views = group.Count(), uniqueVisitors = group.Select(visit => visit.SessionKeyHash).Distinct().Count() });
            var products = await db.Products.AsNoTracking()
                .Select(product => new { product.ProductId, product.NameAr, product.NameEn })
                .ToListAsync(cancellationToken);
            var productStats = products.Select(product =>
                {
                    var productItems = completedItems.Where(item => item.ProductId == product.ProductId).ToList();
                    var uniqueOrderCount = productItems.Select(item => item.OrderId).Distinct().Count();
                    var productVisits = productPageViews.GetValueOrDefault(product.ProductId.ToString());
                    return new
                    {
                        productId = product.ProductId,
                        nameAr = product.NameAr,
                        nameEn = product.NameEn,
                        unitsSold = productItems.Sum(item => item.Quantity),
                        completedOrders = uniqueOrderCount,
                        orderSharePercent = orderCount == 0 ? 0 : Math.Round(uniqueOrderCount * 100d / orderCount, 1),
                        productPageViews = productVisits?.views ?? 0
                    };
                })
                .OrderByDescending(product => product.unitsSold)
                .ThenBy(product => product.nameAr)
                .ToList();

            var dailyVisits = Enumerable.Range(0, 14).Select(offset =>
            {
                var day = now.Date.AddDays(-13 + offset);
                var dayVisits = visits.Where(visit => visit.VisitedAtUtc.Date == day).ToList();
                return new { date = day.ToString("yyyy-MM-dd"), visits = dayVisits.Count, uniqueVisitors = dayVisits.Select(visit => visit.SessionKeyHash).Distinct().Count() };
            }).ToList();

            var topPages = visits.GroupBy(visit => visit.PagePath)
                .Select(group => new { path = group.Key, visits = group.Count(), uniqueVisitors = group.Select(visit => visit.SessionKeyHash).Distinct().Count() })
                .OrderByDescending(page => page.visits).Take(10).ToList();

            return Ok(new
            {
                periodStart = start,
                periodEnd = now,
                visits = visits.Count,
                uniqueVisitors = visits.Select(visit => visit.SessionKeyHash).Distinct().Count(),
                completedOrders = orderCount,
                completedRevenue = completedOrders.Sum(order => order.TotalAmount),
                averageCompletedOrder = orderCount == 0 ? 0 : Math.Round(completedOrders.Average(order => order.TotalAmount), 2),
                ordersFromWebsite = completedOrders.Count(order => string.Equals(order.OrderChannel, "Website", StringComparison.OrdinalIgnoreCase)),
                ordersFromWhatsApp = completedOrders.Count(order => string.Equals(order.OrderChannel, "WhatsApp", StringComparison.OrdinalIgnoreCase)),
                productSales = productStats,
                dailyVisits,
                topPages
            });
        }
    }

    public sealed record RecordVisitRequest(string SessionKey, string PagePath);
}
