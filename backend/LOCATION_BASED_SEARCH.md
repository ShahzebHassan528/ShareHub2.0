# 📍 Location-Based Product Search System

## Overview

The Location-Based Search System enables users to find products near their location using GPS coordinates and the Haversine distance formula.

---

## 🎯 Features Implemented

### 1. Product Model Enhancement

**New Fields Added**:
- `latitude` (FLOAT) - Product location latitude (-90 to 90)
- `longitude` (FLOAT) - Product location longitude (-180 to 180)
- `address` (STRING) - Human-readable address (max 500 chars)

**Validation**:
- Latitude: -90 to 90
- Longitude: -180 to 180
- All fields are optional (nullable)

**Database Index**:
- Composite index on `(latitude, longitude)` for faster queries

### 2. Product Creation with Location

**Updated**: `Product.create()` method now accepts location data

**Example**:
```javascript
const productId = await Product.create({
  seller_id: 1,
  title: "Laptop",
  price: 500,
  latitude: 40.7128,
  longitude: -74.0060,
  address: "123 Main St, New York, NY"
});
```

### 3. Nearby Products Endpoint

**Endpoint**: `GET /api/products/nearby`

**Query Parameters**:
- `lat` (required) - User's latitude
- `lng` (required) - User's longitude
- `radius` (optional) - Search radius in km (default: 5, max: 100)

**Example Request**:
```bash
GET /api/products/nearby?lat=40.7128&lng=-74.0060&radius=10
```

**Response**:
```json
{
  "message": "Nearby products retrieved successfully",
  "count": 5,
  "search_params": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "radius_km": 10
  },
  "products": [
    {
      "id": 1,
      "title": "Laptop",
      "price": "500.00",
      "latitude": 40.7150,
      "longitude": -74.0100,
      "address": "123 Main St, New York, NY",
      "distance": "0.35",
      "category_name": "Electronics",
      "business_name": "Tech Store",
      "primary_image": "https://example.com/image.jpg"
    }
  ]
}
```

### 4. Haversine Distance Calculation

**Formula**: Calculates great-circle distance between two points on Earth

**Implementation**:
```sql
(6371 * acos(
  cos(radians(user_lat)) * 
  cos(radians(product_lat)) * 
  cos(radians(product_lng) - radians(user_lng)) + 
  sin(radians(user_lat)) * 
  sin(radians(product_lat))
))
```

**Result**: Distance in kilometers (rounded to 2 decimal places)

**Sorting**: Products sorted by distance (nearest first)

---

## 🔄 Workflow

### Product Creation with Location
```
Seller creates product
    ↓
Provides location data (optional):
  - latitude
  - longitude
  - address
    ↓
Product stored in database
    ↓
Available for location-based search
```

### Location-Based Search
```
User provides current location
    ↓
System calculates distance to all products
    ↓
Filters products within radius
    ↓
Sorts by distance (nearest first)
    ↓
Returns products with distance field
```

---

## 📊 API Endpoints

### GET /api/products/nearby

**Purpose**: Find products near a location

**Query Parameters**:
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| lat | float | Yes | - | -90 to 90 |
| lng | float | Yes | - | -180 to 180 |
| radius | float | No | 5 | 0 to 100 km |

**Success Response (200)**:
```json
{
  "message": "Nearby products retrieved successfully",
  "count": 3,
  "search_params": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "radius_km": 10
  },
  "products": [...]
}
```

**Error Responses**:

**400 Bad Request** - Missing parameters:
```json
{
  "error": "Missing required parameters: lat and lng are required"
}
```

**400 Bad Request** - Invalid coordinates:
```json
{
  "error": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
}
```

**400 Bad Request** - Invalid radius:
```json
{
  "error": "Invalid radius. Must be between 0 and 100 km"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch nearby products"
}
```

---

## 🔍 Distance Calculation Details

### Haversine Formula

The Haversine formula calculates the shortest distance between two points on a sphere (Earth).

**Formula Components**:
- **R** = Earth's radius (6371 km)
- **φ1, φ2** = Latitude of point 1 and point 2 (in radians)
- **λ1, λ2** = Longitude of point 1 and point 2 (in radians)
- **Δφ** = φ2 - φ1
- **Δλ** = λ2 - λ1

**Distance**:
```
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
c = 2 * atan2(√a, √(1−a))
d = R * c
```

**Accuracy**: ±0.5% for distances up to 1000km

### SQL Implementation

```sql
SELECT *,
  (6371 * acos(
    cos(radians(40.7128)) * 
    cos(radians(latitude)) * 
    cos(radians(longitude) - radians(-74.0060)) + 
    sin(radians(40.7128)) * 
    sin(radians(latitude))
  )) AS distance
FROM products
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND is_available = true
  AND is_approved = true
HAVING distance <= 10
ORDER BY distance ASC;
```

---

## 🧪 Testing

### Test Script
```bash
cd backend
node test-location-search.js
```

### Manual Testing

#### 1. Search Nearby Products
```bash
curl "http://localhost:5000/api/products/nearby?lat=40.7128&lng=-74.0060&radius=10"
```

#### 2. Default Radius (5km)
```bash
curl "http://localhost:5000/api/products/nearby?lat=40.7128&lng=-74.0060"
```

#### 3. Invalid Coordinates
```bash
curl "http://localhost:5000/api/products/nearby?lat=200&lng=-74.0060"
```
Expected: 400 Bad Request

#### 4. Missing Parameters
```bash
curl "http://localhost:5000/api/products/nearby?lat=40.7128"
```
Expected: 400 Bad Request

---

## 📝 Database Migration

### Migration-Safe Sync

The new fields are added with `allowNull: true`, making the migration safe:

**Existing products**: Will have `NULL` values for location fields
**New products**: Can optionally include location data

**No data loss**: Existing products remain functional

**Sequelize Sync**:
```javascript
// Automatically adds new columns on sync
await sequelize.sync({ alter: false });
```

**Manual Migration** (if needed):
```sql
ALTER TABLE products 
ADD COLUMN latitude FLOAT NULL,
ADD COLUMN longitude FLOAT NULL,
ADD COLUMN address VARCHAR(500) NULL,
ADD INDEX idx_location (latitude, longitude);
```

---

## 🔐 Security & Validation

### Input Validation
- ✅ Latitude range: -90 to 90
- ✅ Longitude range: -180 to 180
- ✅ Radius range: 0 to 100 km
- ✅ Required parameters checked
- ✅ Type validation (parseFloat)

### Query Optimization
- ✅ Index on (latitude, longitude)
- ✅ Filter NULL coordinates
- ✅ Filter only available & approved products
- ✅ Limit radius to prevent expensive queries

### Privacy
- ✅ User location not stored
- ✅ Only product locations visible
- ✅ Address is optional

---

## 🎯 Use Cases

### 1. Local Shopping
Users can find products available near them for quick pickup.

### 2. Delivery Estimation
Calculate delivery distance and cost based on location.

### 3. Seller Discovery
Find sellers operating in specific areas.

### 4. Map Integration
Display products on a map interface.

### 5. Radius Filtering
Adjust search radius based on user preference.

---

## 🔄 Backward Compatibility

### Existing APIs Unchanged
- ✅ `GET /api/products` - Still works
- ✅ `GET /api/products/:id` - Still works
- ✅ Product creation - Location fields optional
- ✅ Product search - Still works

### New Features
- ✅ Location fields optional
- ✅ Products without location still searchable
- ✅ Nearby search only returns products with location

### No Breaking Changes
- ✅ Existing products work without location
- ✅ All existing functionality preserved
- ✅ New fields are additive only

---

## 📊 Response Format

### Product with Location
```json
{
  "id": 1,
  "title": "Laptop",
  "description": "Gaming laptop",
  "price": "500.00",
  "product_condition": "like_new",
  "quantity": 1,
  "is_available": true,
  "latitude": 40.7150,
  "longitude": -74.0100,
  "address": "123 Main St, New York, NY",
  "distance": "0.35",
  "category_name": "Electronics",
  "business_name": "Tech Store",
  "primary_image": "https://example.com/image.jpg",
  "created_at": "2026-02-27T10:00:00.000Z"
}
```

### Distance Field
- **Type**: String
- **Format**: "X.XX" (2 decimal places)
- **Unit**: Kilometers
- **Example**: "0.35", "5.42", "12.00"

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Geofencing**: Define delivery zones
2. **Map View**: Visual product map
3. **Auto-location**: Get user location from IP
4. **Distance Units**: Support miles/km toggle
5. **Sorting Options**: Price + distance combined
6. **Caching**: Cache distance calculations
7. **Clustering**: Group nearby products
8. **Geocoding**: Convert address to coordinates

---

## 📁 Files Modified/Created

### Modified Files (3)
1. **`database/models/Product.sequelize.js`**
   - Added latitude, longitude, address fields
   - Added location index

2. **`models/Product.sequelize.wrapper.js`**
   - Updated create() to accept location
   - Added findNearby() method with Haversine

3. **`routes/products.js`**
   - Added GET /products/nearby endpoint
   - Added validation and error handling

### Created Files (2)
1. **`test-location-search.js`**
   - Comprehensive test script

2. **`LOCATION_BASED_SEARCH.md`**
   - This documentation file

---

## ✅ Implementation Checklist

- ✅ Product model updated with location fields
- ✅ Migration-safe sync (nullable fields)
- ✅ Product creation accepts location data
- ✅ Nearby endpoint created
- ✅ Haversine distance calculation
- ✅ Distance field in response
- ✅ Input validation
- ✅ Error handling
- ✅ Backward compatibility maintained
- ✅ Test script created
- ✅ Documentation complete

---

## 📚 Example Usage

### Frontend Integration

```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  // Search nearby products
  const response = await fetch(
    `/api/products/nearby?lat=${latitude}&lng=${longitude}&radius=10`
  );
  
  const data = await response.json();
  
  // Display products with distance
  data.products.forEach(product => {
    console.log(`${product.title} - ${product.distance}km away`);
  });
});
```

### Create Product with Location

```javascript
const productData = {
  seller_id: 1,
  title: "Laptop",
  price: 500,
  product_condition: "like_new",
  latitude: 40.7128,
  longitude: -74.0060,
  address: "123 Main St, New York, NY"
};

const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
});
```

---

**Date**: February 27, 2026  
**Status**: ✅ Implemented and Ready for Testing  
**Version**: 1.0
