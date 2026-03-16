using System.Security.Claims;
using LOCL.API.Data;
using LOCL.API.DTOs;
using LOCL.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LOCL.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> CreateOrder([FromBody] CreateOrderRequest req)
    {
        var shop = await db.Shops.FindAsync(req.ShopId);
        if (shop is null || !shop.IsActive)
            return BadRequest(new ApiResponse<OrderResponse>(false, null, "Shop not found or inactive."));

        var order = new Order
        {
            CustomerId = UserId,
            ShopId = req.ShopId,
            OrderType = req.OrderType,
            Status = "Pending"
        };

        decimal total = 0;
        var items = new List<OrderItem>();
        foreach (var item in req.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);
            if (product is null || product.ShopId != req.ShopId)
                return BadRequest(new ApiResponse<OrderResponse>(false, null, $"Product {item.ProductId} not found."));
            if (!product.IsAvailable || product.StockQuantity < item.Quantity)
                return BadRequest(new ApiResponse<OrderResponse>(false, null, $"Insufficient stock for {product.Name}."));

            product.StockQuantity -= item.Quantity;
            if (product.StockQuantity == 0) product.IsAvailable = false;

            var orderItem = new OrderItem
            { OrderId = order.Id, ProductId = product.Id, Quantity = item.Quantity, UnitPrice = product.Price };
            items.Add(orderItem);
            total += product.Price * item.Quantity;
        }

        order.TotalAmount = total;
        order.Items = items;

        if (req.OrderType == "Delivery" && req.DeliveryAddress is not null)
        {
            order.DeliveryAddress = new DeliveryAddress
            {
                OrderId = order.Id,
                Street = req.DeliveryAddress.Street,
                City = req.DeliveryAddress.City,
                PinCode = req.DeliveryAddress.PinCode,
                Latitude = req.DeliveryAddress.Latitude,
                Longitude = req.DeliveryAddress.Longitude
            };
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<OrderResponse>(true, MapOrder(order, shop.Name), "Order placed successfully."));
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<OrderResponse>>>> GetMyOrders()
    {
        var orders = await db.Orders
            .Include(o => o.Shop).Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.DeliveryAddress)
            .Where(o => o.CustomerId == UserId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(new ApiResponse<List<OrderResponse>>(true,
            orders.Select(o => MapOrder(o, o.Shop.Name)).ToList(), null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> GetById(Guid id)
    {
        var order = await db.Orders
            .Include(o => o.Shop).Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.DeliveryAddress)
            .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == UserId);

        if (order is null) return NotFound(new ApiResponse<OrderResponse>(false, null, "Order not found."));
        return Ok(new ApiResponse<OrderResponse>(true, MapOrder(order, order.Shop.Name), null));
    }

    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<string>>> Cancel(Guid id)
    {
        var order = await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == UserId);

        if (order is null) return NotFound(new ApiResponse<string>(false, null, "Order not found."));
        if (order.Status is "Delivered" or "Cancelled")
            return BadRequest(new ApiResponse<string>(false, null, "Cannot cancel this order."));

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;
        // Restore stock
        foreach (var item in order.Items)
        {
            item.Product.StockQuantity += item.Quantity;
            item.Product.IsAvailable = true;
        }
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<string>(true, "Cancelled", "Order cancelled."));
    }

    private static OrderResponse MapOrder(Order o, string shopName) => new(
        o.Id, o.ShopId, shopName, o.Status, o.OrderType, o.TotalAmount, o.CreatedAt, o.UpdatedAt,
        o.Items.Select(i => new OrderItemResponse(i.Id, i.ProductId, i.Product?.Name ?? "", i.Quantity, i.UnitPrice)).ToList(),
        o.DeliveryAddress is null ? null : new DeliveryAddressResponse(
            o.DeliveryAddress.Street, o.DeliveryAddress.City,
            o.DeliveryAddress.PinCode, o.DeliveryAddress.Latitude, o.DeliveryAddress.Longitude));
}
