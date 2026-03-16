using LOCL.API.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace LOCL.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<DeliveryAddress> DeliveryAddresses => Set<DeliveryAddress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Shop>()
            .Property(s => s.Location)
            .HasColumnType("geometry(Point,4326)");

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Customer)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Shop)
            .WithMany(s => s.Orders)
            .HasForeignKey(o => o.ShopId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DeliveryAddress>()
            .HasOne(da => da.Order)
            .WithOne(o => o.DeliveryAddress)
            .HasForeignKey<DeliveryAddress>(da => da.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Shop>()
            .HasOne(s => s.Owner)
            .WithOne(u => u.Shop)
            .HasForeignKey<Shop>(s => s.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)");
    }

    public async Task SeedAsync()
    {
        if (await Users.AnyAsync()) return;

        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

        // Seed users
        var customer = new User
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000001"),
            Name = "Arjun Kumar",
            Email = "customer@locl.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            Role = "Customer"
        };
        var retailer = new User
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000001"),
            Name = "Priya Retail",
            Email = "retailer@locl.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            Role = "Retailer"
        };
        var retailer2 = new User
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000002"),
            Name = "Ravi Electronics",
            Email = "retailer2@locl.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            Role = "Retailer"
        };
        var retailer3 = new User
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000003"),
            Name = "Meena Pharma",
            Email = "retailer3@locl.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            Role = "Retailer"
        };
        Users.AddRange(customer, retailer, retailer2, retailer3);

        // Seed shops
        var shop1 = new Shop
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000001"),
            OwnerId = retailer.Id,
            Name = "TechZone Electronics",
            Address = "12, MG Road, Koramangala, Bengaluru",
            Latitude = 12.9352, Longitude = 77.6244,
            Location = geometryFactory.CreatePoint(new Coordinate(77.6244, 12.9352)),
            Category = "Electronics", IsActive = true
        };
        var shop2 = new Shop
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000002"),
            OwnerId = retailer2.Id,
            Name = "Mobile Hub Store",
            Address = "45, Indiranagar, Bengaluru",
            Latitude = 12.9784, Longitude = 77.6408,
            Location = geometryFactory.CreatePoint(new Coordinate(77.6408, 12.9784)),
            Category = "Mobile", IsActive = true
        };
        var shop3 = new Shop
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000003"),
            OwnerId = retailer3.Id,
            Name = "HealthFirst Pharmacy",
            Address = "8, BTM Layout, Bengaluru",
            Latitude = 12.9166, Longitude = 77.6101,
            Location = geometryFactory.CreatePoint(new Coordinate(77.6101, 12.9166)),
            Category = "Pharmacy", IsActive = true
        };
        Shops.AddRange(shop1, shop2, shop3);

        // Seed products
        var products = new List<Product>
        {
            new() { Id = Guid.NewGuid(), ShopId = shop1.Id, Name = "USB-C Charger 65W", Description = "Fast charging USB-C adapter", Price = 899, StockQuantity = 15, IsAvailable = true, Category = "Electronics" },
            new() { Id = Guid.NewGuid(), ShopId = shop1.Id, Name = "HDMI Cable 2m", Description = "4K HDMI 2.0 cable", Price = 349, StockQuantity = 30, IsAvailable = true, Category = "Electronics" },
            new() { Id = Guid.NewGuid(), ShopId = shop1.Id, Name = "Arduino Uno R3", Description = "Microcontroller development board", Price = 650, StockQuantity = 8, IsAvailable = true, Category = "Electronics" },
            new() { Id = Guid.NewGuid(), ShopId = shop1.Id, Name = "Bluetooth Speaker Mini", Description = "Portable wireless speaker", Price = 1499, StockQuantity = 0, IsAvailable = false, Category = "Electronics" },
            new() { Id = Guid.NewGuid(), ShopId = shop2.Id, Name = "Screen Protector – Samsung S23", Description = "Tempered glass screen guard", Price = 199, StockQuantity = 50, IsAvailable = true, Category = "Mobile" },
            new() { Id = Guid.NewGuid(), ShopId = shop2.Id, Name = "Phone Case – iPhone 15", Description = "Clear silicone case", Price = 299, StockQuantity = 40, IsAvailable = true, Category = "Mobile" },
            new() { Id = Guid.NewGuid(), ShopId = shop2.Id, Name = "OTG Adapter Type-C", Description = "USB 3.0 OTG adapter", Price = 149, StockQuantity = 25, IsAvailable = true, Category = "Mobile" },
            new() { Id = Guid.NewGuid(), ShopId = shop3.Id, Name = "Paracetamol 500mg (10 tabs)", Description = "Fever and pain relief", Price = 18, StockQuantity = 200, IsAvailable = true, Category = "Pharmacy" },
            new() { Id = Guid.NewGuid(), ShopId = shop3.Id, Name = "Vitamin C 1000mg (30 tabs)", Description = "Immunity booster supplement", Price = 220, StockQuantity = 60, IsAvailable = true, Category = "Pharmacy" },
            new() { Id = Guid.NewGuid(), ShopId = shop3.Id, Name = "Hand Sanitizer 200ml", Description = "70% alcohol gel", Price = 85, StockQuantity = 100, IsAvailable = true, Category = "Pharmacy" }
        };
        Products.AddRange(products);

        await SaveChangesAsync();
    }
}
