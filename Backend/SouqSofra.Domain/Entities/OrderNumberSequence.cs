namespace SouqSofra.Domain.Entities
{
    // One counter per fixed 48-hour UTC window so order numbers can restart at 1.
    public class OrderNumberSequence
    {
        public long WindowId { get; set; }
        public int LastNumber { get; set; }
    }
}
