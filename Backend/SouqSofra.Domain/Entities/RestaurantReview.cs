namespace SouqSofra.Domain.Entities
{
    public class RestaurantReview
    {
        public int ReviewId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; } = 5;
        public string Comment { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? VideoUrl { get; set; }
        public bool IsApproved { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
