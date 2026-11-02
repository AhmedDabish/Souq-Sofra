using System.Reflection;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Domain.Entities;

namespace SouqSofra.Infrastructure.Data;

/// <summary>
/// Applies the replacement menu once. Existing products are made unavailable rather than
/// deleted because order history has restrictive foreign keys to products and categories.
/// </summary>
public static class MenuCatalogV2Initializer
{
    private const string ResourceName = "SouqSofra.Infrastructure.Data.menu-catalog-v2.json";
    private const string AppliedSettingKey = "MenuCatalogVersion";
    private const string CatalogVersion = "menu-v2";

    public static async Task ApplyAsync(AppDbContext context)
    {
        if (await context.SiteSettings.AnyAsync(setting => setting.SettingKey == AppliedSettingKey && setting.SettingValue == CatalogVersion))
            return;

        await using var transaction = context.Database.IsRelational()
            ? await context.Database.BeginTransactionAsync()
            : null;

        var assembly = Assembly.GetExecutingAssembly();
        await using var stream = assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Embedded menu catalog resource '{ResourceName}' was not found.");
        var catalog = await JsonSerializer.DeserializeAsync<MenuCatalogSeed>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new InvalidOperationException("The replacement menu catalog could not be read.");

        var desiredSlugs = catalog.Categories.Select(category => category.Slug).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var categories = await context.Categories.ToListAsync();
        foreach (var existing in categories)
            existing.IsActive = false;

        foreach (var seed in catalog.Categories)
        {
            var category = categories.FirstOrDefault(existing =>
                string.Equals(existing.Slug, seed.Slug, StringComparison.OrdinalIgnoreCase));
            if (category is null)
            {
                category = new Category { Slug = seed.Slug };
                context.Categories.Add(category);
                categories.Add(category);
            }

            category.NameAr = seed.NameAr;
            category.NameEn = seed.NameEn;
            category.Slug = seed.Slug;
            category.IconUrl = seed.IconUrl;
            category.ImageUrl = seed.ImageUrl;
            category.DisplayOrder = seed.DisplayOrder;
            category.IsActive = true;
        }

        // Preserve products referenced by historical orders; remove obsolete catalog rows
        // that have no order history. Referenced rows remain hidden and unavailable.
        var oldProducts = await context.Products.ToListAsync();
        foreach (var oldProduct in oldProducts)
        {
            oldProduct.IsAvailable = false;
            oldProduct.IsFeatured = false;
        }
        await context.SaveChangesAsync();

        var orderedProductIds = await context.OrderItems.Select(item => item.ProductId).Distinct().ToListAsync();
        var historicalProductIds = orderedProductIds.ToHashSet();
        context.Products.RemoveRange(oldProducts.Where(product => !historicalProductIds.Contains(product.ProductId)));
        await context.SaveChangesAsync();

        var categoryIds = categories
            .Where(category => desiredSlugs.Contains(category.Slug))
            .ToDictionary(category => category.Slug, category => category.CategoryId, StringComparer.OrdinalIgnoreCase);

        foreach (var seed in catalog.Products)
        {
            if (!categoryIds.TryGetValue(seed.CategorySlug, out var categoryId))
                throw new InvalidOperationException($"Menu product '{seed.NameEn}' refers to unknown category '{seed.CategorySlug}'.");

            var product = new Product
            {
                CategoryId = categoryId,
                NameAr = seed.NameAr,
                NameEn = seed.NameEn,
                BasePrice = seed.Price ?? 0m,
                ImageUrl = seed.ImageUrl,
                IsAvailable = seed.Available && seed.Price.HasValue,
                IsFeatured = false,
                Variants = seed.Variants.Select(variant => new ProductVariant
                {
                    NameAr = variant.NameAr,
                    NameEn = variant.NameEn,
                    Price = variant.Price,
                    IsDefault = variant.IsDefault
                }).ToList()
            };
            context.Products.Add(product);
        }

        var marker = await context.SiteSettings.FirstOrDefaultAsync(setting => setting.SettingKey == AppliedSettingKey);
        if (marker is null)
        {
            context.SiteSettings.Add(new SiteSetting
            {
                SettingKey = AppliedSettingKey,
                SettingValue = CatalogVersion,
                Description = "Applied menu catalog version"
            });
        }
        else
        {
            marker.SettingValue = CatalogVersion;
            marker.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        var emptyInactiveCategories = await context.Categories
            .Where(category => !category.IsActive && !category.Products.Any())
            .ToListAsync();
        context.Categories.RemoveRange(emptyInactiveCategories);
        await context.SaveChangesAsync();

        if (transaction is not null)
            await transaction.CommitAsync();
    }

    private sealed class MenuCatalogSeed
    {
        public List<CategorySeed> Categories { get; set; } = [];
        public List<ProductSeed> Products { get; set; } = [];
    }

    private sealed class CategorySeed
    {
        public string Slug { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string? IconUrl { get; set; }
        public string? ImageUrl { get; set; }
    }

    private sealed class ProductSeed
    {
        public string CategorySlug { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public bool Available { get; set; }
        public string? ImageUrl { get; set; }
        public List<VariantSeed> Variants { get; set; } = [];
    }

    private sealed class VariantSeed
    {
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsDefault { get; set; }
    }
}
