namespace LOCL.API.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────
public record RegisterRequest(string Name, string Email, string Password, string Role);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string Role, string Name, Guid UserId);

// ── Shop ──────────────────────────────────────────────────────────────────────
public record ShopResponse(
    Guid Id, string Name, string Address, double Latitude, double Longitude,
    string Category, bool IsActive, double? DistanceKm);

public record UpdateShopRequest(
    string Name, string Address, double Latitude, double Longitude, string Category);

// ── Product ───────────────────────────────────────────────────────────────────
public record ProductResponse(
    Guid Id, Guid ShopId, string ShopName, string Name, string Description,
    decimal Price, int StockQuantity, bool IsAvailable, string Category,
    double? DistanceKm);

public record ProductSearchResult(
    Guid Id, Guid ShopId, string ShopName, string Name, string Description,
    decimal Price, int StockQuantity, bool IsAvailable, string Category,
    double DistanceKm, string ShopAddress);

public record CreateProductRequest(
    string Name, string Description, decimal Price, int StockQuantity,
    bool IsAvailable, string Category);

public record UpdateProductRequest(
    string Name, string Description, decimal Price, int StockQuantity,
    bool IsAvailable, string Category);

public record UpdateStockRequest(int StockQuantity, bool IsAvailable);

// ── Order ─────────────────────────────────────────────────────────────────────
public record CreateOrderRequest(
    Guid ShopId,
    string OrderType,
    List<OrderItemRequest> Items,
    DeliveryAddressRequest? DeliveryAddress);

public record OrderItemRequest(Guid ProductId, int Quantity);

public record DeliveryAddressRequest(
    string Street, string City, string PinCode, double Latitude, double Longitude);

public record OrderResponse(
    Guid Id, Guid ShopId, string ShopName, string Status, string OrderType,
    decimal TotalAmount, DateTime CreatedAt, DateTime UpdatedAt,
    List<OrderItemResponse> Items, DeliveryAddressResponse? DeliveryAddress);

public record OrderItemResponse(
    Guid Id, Guid ProductId, string ProductName, int Quantity, decimal UnitPrice);

public record DeliveryAddressResponse(
    string Street, string City, string PinCode, double Latitude, double Longitude);

public record UpdateOrderStatusRequest(string Status);

// ── Common ────────────────────────────────────────────────────────────────────
public record ApiResponse<T>(bool Success, T? Data, string? Message, List<string>? Errors = null);
