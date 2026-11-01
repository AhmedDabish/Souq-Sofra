namespace SouqSofra.Domain.Entities
{
    public class Branch
    {
        public int BranchId { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string AddressAr { get; set; } = string.Empty;
        public string AddressEn { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
