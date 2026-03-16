using LOCL.API.Data;
using LOCL.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace LOCL.API.Controllers;

[ApiController]
[Route("api/shops")]
public class ShopsController(AppDbContext db) : ControllerBase
{
    [HttpGet("nearby")]
    public async Task<ActionResult<ApiResponse<List<ShopResponse>>>> GetNearby(
        [FromQuery] double lat = 12.9352,
        [FromQuery] double lng = 77.6244,
        [FromQuery] double radiusKm = 5)
    {
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        var userLocation = geometryFactory.CreatePoint(new Coordinate(lng, lat));

        var shops = await db.Shops
            .Where(s => s.IsActive && s.Location != null &&
                        s.Location.Distance(userLocation) <= radiusKm * 1000)
            .ToListAsync();

        var results = shops
            .Select(s => new ShopResponse(
                s.Id, s.Name, s.Address, s.Latitude, s.Longitude, s.Category, s.IsActive,
                Math.Round(Haversine(lat, lng, s.Latitude, s.Longitude), 2)))
            .OrderBy(s => s.DistanceKm)
            .ToList();

        return Ok(new ApiResponse<List<ShopResponse>>(true, results, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetById(Guid id)
    {
        var shop = await db.Shops
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shop is null) return NotFound(new ApiResponse<object>(false, null, "Shop not found."));

        var result = new
        {
            shop.Id, shop.Name, shop.Address, shop.Latitude, shop.Longitude,
            shop.Category, shop.IsActive,
            Products = shop.Products.Select(p => new
            {
                p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.IsAvailable, p.Category
            })
        };
        return Ok(new ApiResponse<object>(true, result, null));
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
