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
        public async Task<IActionResult> GetAnalytics(
            [FromQuery] DateOnly? from,
            [FromQuery] DateOnly? to,
            CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var fromDate = from ?? today.AddDays(-29);
            var toDate = to ?? today;
            if (fromDate > toDate)
                return BadRequest(new { message = "تاريخ البداية يجب أن يكون قبل تاريخ النهاية." });

            var start = fromDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var endExclusive = toDate.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var visitsQuery = db.SiteVisits.AsNoTracking()
                .Where(visit => visit.VisitedAtUtc >= start && visit.VisitedAtUtc < endExclusive);

            var visitTotals = await visitsQuery
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    Visits = group.Count(),
                    UniqueVisitors = group.Select(visit => visit.SessionKeyHash).Distinct().Count()
                })
                .FirstOrDefaultAsync(cancellationToken);

            var pageStats = await visitsQuery
                .GroupBy(visit => visit.PagePath)
                .Select(group => new
                {
                    Path = group.Key,
                    Visits = group.Count(),
                    UniqueVisitors = group.Select(visit => visit.SessionKeyHash).Distinct().Count()
                })
                .ToListAsync(cancellationToken);

            var dailyStats = await visitsQuery
                .GroupBy(visit => visit.VisitedAtUtc.Date)
                .Select(group => new
                {
                    Date = group.Key,
                    Visits = group.Count(),
                    UniqueVisitors = group.Select(visit => visit.SessionKeyHash).Distinct().Count()
                })
                .ToDictionaryAsync(group => group.Date, cancellationToken);

            var completedOrdersQuery = db.Orders.AsNoTracking()
                .Where(order => order.OrderStatus == "Completed" && order.CreatedAt >= start && order.CreatedAt < endExclusive);
            // Compute all completed-order summary metrics in one SQL round trip rather than
            // issuing separate count, sum, average, and channel queries for every report.
            var orderChannelSummaries = await completedOrdersQuery
                .GroupBy(order => order.OrderChannel)
                .Select(group => new
                {
                    Channel = group.Key,
                    Count = group.Count(),
                    Revenue = group.Sum(order => order.TotalAmount),
                    Average = group.Average(order => order.TotalAmount)
                })
                .ToListAsync(cancellationToken);
            var orderCount = orderChannelSummaries.Sum(group => group.Count);
            var completedRevenue = orderChannelSummaries.Sum(group => group.Revenue);
            var averageCompletedOrder = orderCount == 0
                ? 0m
                : Math.Round(orderChannelSummaries.Sum(group => group.Average * group.Count) / orderCount, 2);
            var orderChannels = orderChannelSummaries.ToDictionary(group => group.Channel, group => group.Count);

            // Aggregate product sales and distinct completed orders in SQL rather than
            // loading every matching order-item row into API memory for every report.
            var productSales = await db.OrderItems.AsNoTracking()
                .Where(item => item.Order != null && item.Order.OrderStatus == "Completed" &&
                    item.Order.CreatedAt >= start && item.Order.CreatedAt < endExclusive)
                .GroupBy(item => item.ProductId)
                .Select(group => new
                {
                    ProductId = group.Key,
                    UnitsSold = group.Sum(item => item.Quantity),
                    CompletedOrders = group.Select(item => item.OrderId).Distinct().Count()
                })
                .ToDictionaryAsync(summary => summary.ProductId, cancellationToken);

            var products = await db.Products.AsNoTracking()
                .Select(product => new { product.ProductId, product.NameAr, product.NameEn })
                .ToListAsync(cancellationToken);
            var productsById = products.ToDictionary(product => product.ProductId.ToString(), product => product);

            var productPageViews = pageStats
                .Where(page => page.Path.StartsWith("/product/", StringComparison.OrdinalIgnoreCase))
                .GroupBy(page => page.Path[9..].Split('/', '?', '#')[0])
                .ToDictionary(group => group.Key, group => new
                {
                    Views = group.Sum(page => page.Visits),
                    UniqueVisitors = group.Sum(page => page.UniqueVisitors)
                });

            var productStats = products.Select(product =>
                {
                    productSales.TryGetValue(product.ProductId, out var sales);
                    var uniqueOrderCount = sales?.CompletedOrders ?? 0;
                    var productVisits = productPageViews.GetValueOrDefault(product.ProductId.ToString());
                    return new
                    {
                        productId = product.ProductId,
                        nameAr = product.NameAr,
                        nameEn = product.NameEn,
                        unitsSold = sales?.UnitsSold ?? 0,
                        completedOrders = uniqueOrderCount,
                        orderSharePercent = orderCount == 0 ? 0 : Math.Round(uniqueOrderCount * 100d / orderCount, 1),
                        productPageViews = productVisits?.Views ?? 0
                    };
                })
                .OrderByDescending(product => product.unitsSold)
                .ThenBy(product => product.nameAr)
                .ToList();

            var dayCount = (int)(toDate.ToDateTime(TimeOnly.MinValue) - fromDate.ToDateTime(TimeOnly.MinValue)).TotalDays + 1;
            var dailyVisits = Enumerable.Range(0, dayCount).Select(offset =>
            {
                var day = start.AddDays(offset);
                dailyStats.TryGetValue(day.Date, out var dayStats);
                return new
                {
                    date = day.ToString("yyyy-MM-dd"),
                    visits = dayStats?.Visits ?? 0,
                    uniqueVisitors = dayStats?.UniqueVisitors ?? 0
                };
            }).ToList();

            var topPages = pageStats
                .Select(page =>
                {
                    var isProductPage = page.Path.StartsWith("/product/", StringComparison.OrdinalIgnoreCase);
                    var productId = isProductPage ? page.Path[9..].Split('/', '?', '#')[0] : string.Empty;
                    productsById.TryGetValue(productId, out var product);
                    return new
                    {
                        path = page.Path,
                        displayNameAr = product?.NameAr,
                        displayNameEn = product?.NameEn,
                        visits = page.Visits,
                        uniqueVisitors = page.UniqueVisitors
                    };
                })
                .OrderByDescending(page => page.visits)
                .Take(10)
                .ToList();

            return Ok(new
            {
                periodStart = fromDate.ToString("yyyy-MM-dd"),
                periodEnd = toDate.ToString("yyyy-MM-dd"),
                visits = visitTotals?.Visits ?? 0,
                uniqueVisitors = visitTotals?.UniqueVisitors ?? 0,
                completedOrders = orderCount,
                completedRevenue,
                averageCompletedOrder,
                ordersFromWebsite = orderChannels.Where(channel => string.Equals(channel.Key, "Website", StringComparison.OrdinalIgnoreCase)).Sum(channel => channel.Value),
                ordersFromWhatsApp = orderChannels.Where(channel => string.Equals(channel.Key, "WhatsApp", StringComparison.OrdinalIgnoreCase)).Sum(channel => channel.Value),
                productSales = productStats,
                dailyVisits,
                topPages
            });
        }
    }

    public sealed record RecordVisitRequest(string SessionKey, string PagePath);
}
