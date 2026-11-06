namespace SouqSofra.Application.DTOs
{
    // Categories
    public record CategoryDto(
        int CategoryId, 
        string NameAr, 
        string NameEn, 
        string Slug, 
        string? IconUrl, 
        string? ImageUrl,
        int DisplayOrder, 
        bool IsActive
    );

    public record CategoryCreateDto(
        string NameAr, 
        string NameEn, 
        string Slug, 
        string? IconUrl, 
        string? ImageUrl,
        int DisplayOrder, 
        bool IsActive
    );

    // Products & Variants
    public record ProductVariantDto(
        int VariantId, 
        string NameAr, 
        string NameEn, 
        decimal Price, 
        bool IsDefault
    );

    public record ProductVariantCreateDto(
        string NameAr, 
        string NameEn, 
        decimal Price, 
        bool IsDefault
    );

    public record ProductAddonDto(int AddonId, string NameAr, string NameEn, decimal Price, int? CatalogTemplateId = null);
    public record ProductAddonCreateDto(string NameAr, string NameEn, decimal Price);
    public record AddonTemplateDto(int AddonTemplateId, string NameAr, string NameEn, decimal Price, bool IsAvailable, string ScopeType, int? CategoryId, int? ProductId);
    public record AddonTemplateCreateDto(string NameAr, string NameEn, decimal Price, bool IsAvailable, string ScopeType, int? CategoryId, int? ProductId);

    public record ProductDto(
        int ProductId, 
        int CategoryId, 
        string NameAr, 
        string NameEn, 
        string? DescriptionAr, 
        string? DescriptionEn, 
        decimal BasePrice, 
        decimal? DiscountPrice, 
        string? ImageUrl, 
        bool IsAvailable, 
        bool IsFeatured,
        List<ProductVariantDto> Variants,
        List<ProductAddonDto> Addons,
        bool IsManuallyBestSelling = false,
        int CompletedSalesQuantity = 0,
        double AverageRating = 5.0,
        int ReviewCount = 0
    );

    public record ProductCreateDto(
        int CategoryId, 
        string NameAr, 
        string NameEn, 
        string? DescriptionAr, 
        string? DescriptionEn, 
        decimal BasePrice, 
        decimal? DiscountPrice, 
        string? ImageUrl, 
        bool IsAvailable, 
        bool IsFeatured,
        List<ProductVariantCreateDto>? Variants,
        List<ProductAddonCreateDto>? Addons = null,
        bool IsManuallyBestSelling = false,
        List<int>? CatalogAddonIds = null
    );

    // Orders
    public record OrderItemAddonDto(int AddonId, string NameAr, string NameEn, decimal Price);

    public record OrderItemDto(
        int OrderItemId, 
        int ProductId, 
        int? VariantId, 
        string ProductNameAr, 
        string ProductNameEn, 
        string? VariantNameAr,
        string? VariantNameEn,
        decimal UnitPrice, 
        int Quantity, 
        decimal TotalPrice,
        List<OrderItemAddonDto> Addons
    );

    public record OrderDto(
        int OrderId, 
        string OrderNumber, 
        string CustomerName, 
        string CustomerPhone, 
        string? CustomerEmail, 
        string DeliveryAddress, 
        int BranchId, 
        decimal SubTotal, 
        decimal DeliveryFee, 
        decimal TotalAmount, 
        string PaymentMethod, 
        string OrderStatus, 
        string? Notes, 
        DateTime CreatedAt, 
        List<OrderItemDto> Items,
        string OrderChannel = "Website"
    );

    public record OrderItemCreateDto(
        int ProductId, 
        int? VariantId, 
        int Quantity, 
        decimal UnitPrice,
        List<int>? AddonIds = null
    );

    public record OrderCreateDto(
        string CustomerName, 
        string CustomerPhone, 
        string? CustomerEmail, 
        string DeliveryAddress, 
        int BranchId, 
        string PaymentMethod, 
        string? Notes, 
        List<OrderItemCreateDto> Items,
        string OrderChannel = "Website",
        string DeliveryType = "delivery",
        string? DeliveryZoneId = null,
        double? DeliveryLatitude = null,
        double? DeliveryLongitude = null
    );

    public record UpdateOrderStatusDto(string Status);

    // Auth
    public record LoginRequestDto(string Email, string Password);
    
    public record LoginResponseDto(
        string Token, 
        string FullName, 
        string Email, 
        string Role, 
        DateTime ExpiresAt,
        IReadOnlyList<string>? Permissions = null
    );

    public record ChangePasswordDto(string OldPassword, string NewPassword);
    public record StaffUserDto(int UserId, string FullName, string Email, string? PhoneNumber, string Role, bool IsActive, DateTime CreatedAt, IReadOnlyList<string> Permissions);
    public record CreateStaffUserDto(string FullName, string Email, string Password, string? PhoneNumber, string Role);
    public record UpdateStaffRoleDto(string Role);
    public record UpdateStaffPermissionsDto(IReadOnlyList<string>? Permissions);
    public record BootstrapSuperAdminDto(string CurrentPassword, string NewPassword);

    // Branches
    public record BranchDto(
        int BranchId, 
        string NameAr, 
        string NameEn, 
        string AddressAr, 
        string AddressEn, 
        string Phone, 
        string WhatsApp, 
        decimal? Latitude, 
        decimal? Longitude, 
        bool IsActive
    );

    // Settings
    public record SiteSettingDto(string SettingKey, string SettingValue, string? Description);
    public record UpdateSiteSettingDto(string SettingKey, string SettingValue);

    // Reviews
    public record RestaurantReviewDto(
        int ReviewId,
        string CustomerName,
        int Rating,
        string Comment,
        string? AvatarUrl,
        string? VideoUrl,
        DateTime CreatedAt
    );

    public record ProductReviewDto(
        int ProductReviewId,
        int ProductId,
        string CustomerName,
        int Rating,
        string? Comment,
        DateTime CreatedAt
    );

    public record ProductReviewCreateDto(
        int ProductId,
        string CustomerName,
        int Rating,
        string? Comment,
        string? PhoneNumber = null
    );

    public record AdminReviewCreateDto(
        string Type, int? ProductId, string CustomerName, string? PhoneNumber, int Rating,
        string Comment, string? AvatarUrl, string? VideoUrl, bool IsApproved = true
    );

    public record AdminReviewDto(
        string Type, int Id, int? ProductId, string? ProductName, string CustomerName,
        string? PhoneNumber, int Rating, string Comment, string? AvatarUrl, string? VideoUrl,
        bool IsApproved, DateTime CreatedAt
    );

    public record ProductReviewsSummaryDto(
        int ProductId,
        double AverageRating,
        int TotalReviews,
        List<ProductReviewDto> Reviews
    );
}
