namespace LOCL.API.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid ShopId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending|Confirmed|Reserved|OutForDelivery|Delivered|Cancelled
    public string OrderType { get; set; } = "Reservation"; // Reservation|Delivery
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Customer { get; set; } = null!;
    public Shop Shop { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = [];
    public DeliveryAddress? DeliveryAddress { get; set; }
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

public class DeliveryAddress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public Order Order { get; set; } = null!;
}
