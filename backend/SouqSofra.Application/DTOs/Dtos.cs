namespace SouqSofra.Application.DTOs
{
    public record CategoryDto(int CategoryId, string NameAr, string NameEn, string Slug, string? IconUrl, int DisplayOrder);
    
    public record ProductVariantDto(int VariantId, string NameAr, string NameEn, decimal Price, bool IsDefault);

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
        List<ProductVariantDto> Variants
    );

    public record OrderItemCreateDto(int ProductId, int? VariantId, int Quantity, decimal UnitPrice);

    public record OrderCreateDto(
        string CustomerName, 
        string CustomerPhone, 
        string? CustomerEmail, 
        string DeliveryAddress, 
        int BranchId, 
        string PaymentMethod, 
        string? Notes, 
        List<OrderItemCreateDto> Items
    );

    public record LoginRequestDto(string Email, string Password);
    public record LoginResponseDto(string Token, string FullName, string Email, string Role);
}
