namespace SouqSofra.Domain.Entities
{
    // Anonymous first-party page-view record. Session IDs are hashed before persistence.
    public sealed class SiteVisit
    {
        public long SiteVisitId { get; set; }
        public string SessionKeyHash { get; set; } = string.Empty;
        public string PagePath { get; set; } = string.Empty;
        public DateTime VisitedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
