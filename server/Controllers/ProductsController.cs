using LOCL.API.Data;
using LOCL.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace LOCL.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<ProductSearchResult>>>> Search(
        [FromQuery] string? query,
        [FromQuery] double lat = 12.9352,
        [FromQuery] double lng = 77.6244,
        [FromQuery] double radiusKm = 5)
    {
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        var userLocation = geometryFactory.CreatePoint(new Coordinate(lng, lat));

        var products = await db.Products
            .Include(p => p.Shop)
            .Where(p => p.Shop.IsActive &&
                        p.Shop.Location != null &&
                        p.Shop.Location.Distance(userLocation) <= radiusKm * 1000 &&
                        (string.IsNullOrEmpty(query) ||
                         EF.Functions.ILike(p.Name, $"%{query}%") ||
                         EF.Functions.ILike(p.Category, $"%{query}%") ||
                         EF.Functions.ILike(p.Description, $"%{query}%")))
            .ToListAsync();

        var results = products
            .Select(p => new ProductSearchResult(
                p.Id, p.ShopId, p.Shop.Name, p.Name, p.Description, p.Price,
                p.StockQuantity, p.IsAvailable, p.Category,
                Math.Round(Haversine(lat, lng, p.Shop.Latitude, p.Shop.Longitude), 2),
                p.Shop.Address))
            .OrderBy(r => r.DistanceKm)
            .ToList();

        return Ok(new ApiResponse<List<ProductSearchResult>>(true, results, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> GetById(Guid id)
    {
        var p = await db.Products.Include(p => p.Shop).FirstOrDefaultAsync(p => p.Id == id);
        if (p is null) return NotFound(new ApiResponse<ProductResponse>(false, null, "Product not found."));
        return Ok(new ApiResponse<ProductResponse>(true,
            new ProductResponse(p.Id, p.ShopId, p.Shop.Name, p.Name, p.Description,
                p.Price, p.StockQuantity, p.IsAvailable, p.Category, null), null));
    }

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}
