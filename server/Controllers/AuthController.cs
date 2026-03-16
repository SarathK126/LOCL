using LOCL.API.Data;
using LOCL.API.DTOs;
using LOCL.API.Models;
using LOCL.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LOCL.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new ApiResponse<AuthResponse>(false, null, "Email already in use."));

        if (req.Role != "Customer" && req.Role != "Retailer")
            return BadRequest(new ApiResponse<AuthResponse>(false, null, "Role must be Customer or Retailer."));

        var user = new User
        {
            Name = req.Name,
            Email = req.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwt.GenerateToken(user);
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(token, user.Role, user.Name, user.Id), "Registered successfully."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower().Trim());
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new ApiResponse<AuthResponse>(false, null, "Invalid email or password."));

        var token = jwt.GenerateToken(user);
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(token, user.Role, user.Name, user.Id), "Login successful."));
    }
}
