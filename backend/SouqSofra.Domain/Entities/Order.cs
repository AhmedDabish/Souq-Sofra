namespace SouqSofra.Domain.Entities
{
    public class Order
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string? CustomerEmail { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public int BranchId { get; set; } = 1;
        public decimal SubTotal { get; set; }
        public decimal DeliveryFee { get; set; } = 10;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "CashOnDelivery";
        public string OrderStatus { get; set; } = "Pending";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public string ProductNameAr { get; set; } = string.Empty;
        public string ProductNameEn { get; set; } = string.Empty;
        public string? VariantNameAr { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal TotalPrice { get; set; }

        public Order? Order { get; set; }
        public Product? Product { get; set; }
    }
}
