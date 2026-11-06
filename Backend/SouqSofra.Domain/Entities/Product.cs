namespace SouqSofra.Domain.Entities
{
    public class Product
    {
        public int ProductId { get; set; }
        public int CategoryId { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string? DescriptionAr { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal BasePrice { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public bool IsManuallyBestSelling { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Category? Category { get; set; }
        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public ICollection<ProductAddon> Addons { get; set; } = new List<ProductAddon>();
        public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    }

    public class ProductAddon
    {
        public int AddonId { get; set; }
        public int ProductId { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public int? CatalogTemplateId { get; set; }

        public Product? Product { get; set; }
        public AddonTemplate? CatalogTemplate { get; set; }
    }

    public class AddonTemplate
    {
        public int AddonTemplateId { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string ScopeType { get; set; } = "All";
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
    }

    public class ProductVariant
    {
        public int VariantId { get; set; }
        public int ProductId { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsDefault { get; set; } = false;

        public Product? Product { get; set; }
    }
}
