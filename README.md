# LOCL — Hyperlocal Retail Discovery & Instant Commerce

> **Stack**: .NET 8 Web API · PostgreSQL + PostGIS · JWT · React + Vite · Tailwind CSS

---

## Project Structure

```
LOCL/
├── index.html         ← Investor pitch page (standalone)
├── server/            ← ASP.NET Core Web API
│   ├── Controllers/   ← Auth, Products, Shops, Orders, Retailer
│   ├── Models/        ← User, Shop, Product, Order, OrderItem, DeliveryAddress
│   ├── DTOs/          ← Request/Response records
│   ├── Data/          ← AppDbContext + seed data
│   ├── Services/      ← JwtService
│   ├── Middleware/    ← ExceptionMiddleware
│   └── Migrations/
└── client/            ← React + Vite frontend
    └── src/
        ├── api/       ← Axios service layer
        ├── context/   ← AuthContext
        ├── components/← Navbar, BottomNav, Spinner, StatusBadge, EmptyState
        └── pages/
            ├── auth/       ← Login, Register
            ├── customer/   ← Home, Search, StoreDetail, ProductDetail,
            │                  ReservationFlow, Orders, OrderDetail
            └── retailer/   ← Dashboard, Inventory, AddEditProduct,
                               IncomingOrders, ShopProfile
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| .NET SDK | 8.0 |
| PostgreSQL | 15+ with PostGIS extension |

---

## Backend Setup

### 1. Install PostgreSQL + PostGIS

```sql
CREATE DATABASE locl;
\c locl
CREATE EXTENSION postgis;
```

### 2. Configure appsettings

Edit `server/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=locl;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Secret": "your-very-secret-key-min-32-chars!!",
    "Issuer": "LOCL.API",
    "Audience": "LOCL.Client"
  }
}
```

### 3. Run the API

```bash
cd server
dotnet run
```

The API will:
- Apply EF Core migrations automatically on startup
- Seed demo data (1 Customer, 1 Retailer, 1 Shop, 6 Products)
- Start at `http://localhost:5157`
- Serve Swagger UI at `http://localhost:5157/swagger`

---

## Frontend Setup

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port
```

### 3. Start dev server

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Docker Setup (Recommended)

Run the entire stack (API, Frontend, and Database) with a single command:

```bash
docker-compose up --build
```

- **Backend API**: `http://localhost:5157`
- **Frontend UI**: `http://localhost:5173`
- **Database**: `localhost:5432` (PostGIS)

The Docker setup automatically:
1.  Creates the `locl_db` database.
2.  Enables the `postgis` extension.
3.  Applies EF Core migrations.
4.  Seeds demo data.

---

## Demo Credentials (seeded automatically)

| Role | Email | Password |
|---|---|---|
| Customer | customer@locl.in | password123 |
| Retailer | retailer@locl.in | password123 |

---

## API Routes

### Auth
| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Customer
| Method | Route | Auth |
|---|---|---|
| GET | `/api/products/search?query=&lat=&lng=&radiusKm=` | Public |
| GET | `/api/products/{id}` | Public |
| GET | `/api/shops/nearby?lat=&lng=&radiusKm=` | Public |
| GET | `/api/shops/{id}` | Public |
| POST | `/api/orders` | Customer |
| GET | `/api/orders/my` | Customer |
| GET | `/api/orders/{id}` | Customer |
| PATCH | `/api/orders/{id}/cancel` | Customer |

### Retailer
| Method | Route | Auth |
|---|---|---|
| GET/PUT | `/api/retailer/shop` | Retailer |
| GET/POST | `/api/retailer/products` | Retailer |
| PUT/DELETE | `/api/retailer/products/{id}` | Retailer |
| PATCH | `/api/retailer/products/{id}/stock` | Retailer |
| GET | `/api/retailer/orders` | Retailer |
| PATCH | `/api/retailer/orders/{id}/status` | Retailer |

---

## Features

### Customer
- 🔍 Geospatial product search within radius
- 🏪 Browse nearby shops by category
- 🛒 Add to cart → place Pickup or Delivery order
- 📦 Track order status in real-time
- ❌ Cancel orders

### Retailer
- 📊 Dashboard with revenue/order/stock stats
- 📦 Inventory management (add, edit, delete, toggle)
- 🚀 Incoming order queue with one-click status updates
- 🗺️ Shop profile with GPS location picker

---

## Development Notes

- The Vite dev server proxies all `/api/*` requests to `http://localhost:5157` — no CORS issues in development
- JWT tokens stored in `localStorage`, auto-attached via Axios interceptor
- Cart state stored in `localStorage`, cleared after successful checkout
- Orders page auto-refreshes every 15s on the retailer side
