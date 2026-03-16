using System.Security.Claims;
using LOCL.API.Data;
using LOCL.API.DTOs;
using LOCL.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace LOCL.API.Controllers;

[ApiController]
[Route("api/retailer")]
[Authorize(Roles = "Retailer")]
public class RetailerController(AppDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Shop ─────────────────────────────────────────────────────────────────
    [HttpGet("shop")]
    public async Task<ActionResult<ApiResponse<ShopResponse>>> GetShop()
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (shop is null) return NotFound(new ApiResponse<ShopResponse>(false, null, "No shop found. Please create one."));
        return Ok(new ApiResponse<ShopResponse>(true,
            new ShopResponse(shop.Id, shop.Name, shop.Address, shop.Latitude, shop.Longitude, shop.Category, shop.IsActive, null), null));
    }

    [HttpPut("shop")]
    public async Task<ActionResult<ApiResponse<ShopResponse>>> UpsertShop([FromBody] UpdateShopRequest req)
    {
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (shop is null)
        {
            shop = new Shop { OwnerId = UserId };
            db.Shops.Add(shop);
        }
        shop.Name = req.Name;
        shop.Address = req.Address;
        shop.Latitude = req.Latitude;
        shop.Longitude = req.Longitude;
        shop.Location = geometryFactory.CreatePoint(new Coordinate(req.Longitude, req.Latitude));
        shop.Category = req.Category;
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<ShopResponse>(true,
            new ShopResponse(shop.Id, shop.Name, shop.Address, shop.Latitude, shop.Longitude, shop.Category, shop.IsActive, null),
            "Shop updated successfully."));
    }

    // ── Products ─────────────────────────────────────────────────────────────
    [HttpGet("products")]
    public async Task<ActionResult<ApiResponse<List<ProductResponse>>>> GetProducts()
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (shop is null) return Ok(new ApiResponse<List<ProductResponse>>(true, [], "No shop yet."));

        var products = await db.Products.Where(p => p.ShopId == shop.Id).ToListAsync();
        var result = products.Select(p => new ProductResponse(
            p.Id, p.ShopId, shop.Name, p.Name, p.Description, p.Price, p.StockQuantity, p.IsAvailable, p.Category, null)).ToList();
        return Ok(new ApiResponse<List<ProductResponse>>(true, result, null));
    }

    [HttpPost("products")]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> AddProduct([FromBody] CreateProductRequest req)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (shop is null) return BadRequest(new ApiResponse<ProductResponse>(false, null, "Create a shop first."));

        var product = new Product
        {
            ShopId = shop.Id, Name = req.Name, Description = req.Description,
            Price = req.Price, StockQuantity = req.StockQuantity, IsAvailable = req.IsAvailable, Category = req.Category
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<ProductResponse>(true,
            new ProductResponse(product.Id, shop.Id, shop.Name, product.Name, product.Description,
                product.Price, product.StockQuantity, product.IsAvailable, product.Category, null),
            "Product added."));
    }

    [HttpPut("products/{id}")]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest req)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var product = shop is null ? null : await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.ShopId == shop.Id);
        if (product is null) return NotFound(new ApiResponse<ProductResponse>(false, null, "Product not found."));

        product.Name = req.Name; product.Description = req.Description;
        product.Price = req.Price; product.StockQuantity = req.StockQuantity;
        product.IsAvailable = req.IsAvailable; product.Category = req.Category;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<ProductResponse>(true,
            new ProductResponse(product.Id, shop!.Id, shop.Name, product.Name, product.Description,
                product.Price, product.StockQuantity, product.IsAvailable, product.Category, null), "Updated."));
    }

    [HttpPatch("products/{id}/stock")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateStock(Guid id, [FromBody] UpdateStockRequest req)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var product = shop is null ? null : await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.ShopId == shop.Id);
        if (product is null) return NotFound(new ApiResponse<string>(false, null, "Product not found."));

        product.StockQuantity = req.StockQuantity;
        product.IsAvailable = req.IsAvailable;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<string>(true, "Updated", "Stock updated."));
    }

    [HttpDelete("products/{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteProduct(Guid id)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var product = shop is null ? null : await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.ShopId == shop.Id);
        if (product is null) return NotFound(new ApiResponse<string>(false, null, "Product not found."));

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<string>(true, "Deleted", "Product removed."));
    }

    // ── Orders ────────────────────────────────────────────────────────────────
    [HttpGet("orders")]
    public async Task<ActionResult<ApiResponse<List<OrderResponse>>>> GetOrders()
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (shop is null) return Ok(new ApiResponse<List<OrderResponse>>(true, [], null));

        var orders = await db.Orders
            .Include(o => o.Shop).Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.DeliveryAddress)
            .Where(o => o.ShopId == shop.Id)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(new ApiResponse<List<OrderResponse>>(true,
            orders.Select(o => MapOrder(o, shop.Name)).ToList(), null));
    }

    [HttpPatch("orders/{id}/status")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest req)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var order = shop is null ? null : await db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.ShopId == shop.Id);
        if (order is null) return NotFound(new ApiResponse<string>(false, null, "Order not found."));

        var valid = new[] { "Confirmed", "Reserved", "OutForDelivery", "Delivered", "Cancelled" };
        if (!valid.Contains(req.Status))
            return BadRequest(new ApiResponse<string>(false, null, "Invalid status."));

        order.Status = req.Status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<string>(true, req.Status, "Status updated."));
    }

    private static OrderResponse MapOrder(Order o, string shopName) => new(
        o.Id, o.ShopId, shopName, o.Status, o.OrderType, o.TotalAmount, o.CreatedAt, o.UpdatedAt,
        o.Items.Select(i => new OrderItemResponse(i.Id, i.ProductId, i.Product?.Name ?? "", i.Quantity, i.UnitPrice)).ToList(),
        o.DeliveryAddress is null ? null : new DeliveryAddressResponse(
            o.DeliveryAddress.Street, o.DeliveryAddress.City,
            o.DeliveryAddress.PinCode, o.DeliveryAddress.Latitude, o.DeliveryAddress.Longitude));
}
