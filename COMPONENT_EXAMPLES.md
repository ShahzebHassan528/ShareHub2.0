# ShareHub 2.0 - Component Code Examples

## 📋 Key Component Implementations

This document provides actual code examples from the ShareHub 2.0 frontend to help understand the current implementation patterns.

---

## 🎨 Styling Examples

### Global Custom Styles (src/styles/custom.css)
```css
/* Color Variables */
:root {
  --emerald-green: #10b981;
  --emerald-dark: #059669;
  --emerald-light: #34d399;
}

/* Primary Button Override */
.btn-primary {
  background-color: var(--emerald-green);
  border-color: var(--emerald-green);
}

.btn-primary:hover {
  background-color: var(--emerald-dark);
  border-color: var(--emerald-dark);
}

/* Hover Card Effect */
.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Product Card */
.product-card {
  border: none;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}
```

---

## 🧩 Component Examples

### 1. ProductCard Component Pattern
```jsx
// Typical structure used across the app
<Card className="product-card hover-card h-100 border-0 shadow-sm">
  <Card.Img 
    variant="top" 
    src={product.image_url} 
    className="product-image"
    alt={product.title}
  />
  <Card.Body>
    <Card.Title className="text-truncate">{product.title}</Card.Title>
    <Card.Text className="text-muted text-truncate-2">
      {product.description}
    </Card.Text>
    <div className="d-flex justify-content-between align-items-center">
      <span className="price-tag text-primary">
        Rs. {product.price}
      </span>
      <Badge bg="success">{product.condition}</Badge>
    </div>
    <Button variant="primary" className="w-100 mt-3">
      <i className="bi bi-cart-plus me-2"></i>
      Add to Cart
    </Button>
  </Card.Body>
</Card>
```

### 2. Dashboard Card Pattern
```jsx
// Used in all dashboard pages
<Card className="border-0 shadow-sm mb-4">
  <Card.Body>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">
        <i className="bi bi-box-seam me-2 text-primary"></i>
        Total Products
      </h5>
      <Badge bg="primary" pill>24</Badge>
    </div>
    <h2 className="mb-0">1,234</h2>
    <small className="text-muted">
      <i className="bi bi-arrow-up text-success"></i> 12% from last month
    </small>
  </Card.Body>
</Card>
```

### 3. Form Pattern
```jsx
// Standard form structure
<Form onSubmit={handleSubmit}>
  <Form.Group className="mb-3">
    <Form.Label>
      Product Title <span className="text-danger">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="e.g., iPhone 13 Pro Max"
      required
    />
    {errors.title && (
      <Form.Text className="text-danger">{errors.title}</Form.Text>
    )}
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Describe your product..."
    />
  </Form.Group>

  <Button type="submit" variant="primary" disabled={loading}>
    {loading ? 'Saving...' : 'Submit'}
  </Button>
</Form>
```

### 4. Table Pattern (Admin/Seller Pages)
```jsx
<Table responsive hover className="align-middle">
  <thead className="bg-light">
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {products.map(product => (
      <tr key={product.id}>
        <td>
          <div className="d-flex align-items-center">
            <img 
              src={product.image_url} 
              alt={product.title}
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              className="rounded me-3"
            />
            <div>
              <div className="fw-bold">{product.title}</div>
              <small className="text-muted">{product.category}</small>
            </div>
          </div>
        </td>
        <td>Rs. {product.price}</td>
        <td>
          <Badge bg={product.is_available ? 'success' : 'secondary'}>
            {product.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </td>
        <td>
          <Button size="sm" variant="outline-primary" className="me-2">
            <i className="bi bi-pencil"></i>
          </Button>
          <Button size="sm" variant="outline-danger">
            <i className="bi bi-trash"></i>
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

### 5. Hero Section Pattern
```jsx
<section className="hero-section text-center py-5">
  <Container>
    <h1 className="display-4 fw-bold mb-3">
      Welcome to ShareHub
    </h1>
    <p className="lead mb-4">
      Buy, Sell, Swap, and Donate - All in One Place
    </p>
    <div className="d-flex gap-3 justify-content-center">
      <Button variant="light" size="lg">
        Browse Products
      </Button>
      <Button variant="outline-light" size="lg">
        Start Selling
      </Button>
    </div>
  </Container>
</section>
```

### 6. Loading Skeleton Pattern
```jsx
// Used while data is loading
<Card className="border-0 shadow-sm">
  <div className="skeleton-image" style={{ height: '200px', background: '#e0e0e0' }}></div>
  <Card.Body>
    <div className="skeleton-title mb-2" style={{ height: '20px', background: '#e0e0e0', width: '80%' }}></div>
    <div className="skeleton-text mb-2" style={{ height: '15px', background: '#e0e0e0', width: '100%' }}></div>
    <div className="skeleton-text" style={{ height: '15px', background: '#e0e0e0', width: '60%' }}></div>
  </Card.Body>
</Card>
```

### 7. Toast Notification Pattern
```jsx
// Toast Context Implementation
<div className="toast-container">
  {toasts.map(toast => (
    <div key={toast.id} className={`toast toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' && <i className="bi bi-check-circle"></i>}
        {toast.type === 'error' && <i className="bi bi-x-circle"></i>}
        {toast.type === 'warning' && <i className="bi bi-exclamation-triangle"></i>}
        {toast.type === 'info' && <i className="bi bi-info-circle"></i>}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={() => removeToast(toast.id)}>
        <i className="bi bi-x"></i>
      </button>
    </div>
  ))}
</div>
```

### 8. Status Badge Component
```jsx
// components/common/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const variants = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'active': 'success',
    'blocked': 'danger',
    'verified': 'success',
  };

  return (
    <Badge bg={variants[status] || 'secondary'}>
      {status}
    </Badge>
  );
}
```

---

## 🎯 Layout Patterns

### 1. Dashboard Layout
```jsx
<Container fluid className="py-4">
  <Row className="mb-4">
    <Col>
      <h2>Dashboard</h2>
      <p className="text-muted">Welcome back, {user.name}</p>
    </Col>
  </Row>

  {/* Stats Cards */}
  <Row className="g-4 mb-4">
    <Col md={3}>
      <Card className="border-0 shadow-sm">
        {/* Stat content */}
      </Card>
    </Col>
    {/* More stat cards */}
  </Row>

  {/* Main Content */}
  <Row className="g-4">
    <Col lg={8}>
      <Card className="border-0 shadow-sm">
        {/* Main content */}
      </Card>
    </Col>
    <Col lg={4}>
      <Card className="border-0 shadow-sm">
        {/* Sidebar content */}
      </Card>
    </Col>
  </Row>
</Container>
```

### 2. Product Grid Layout
```jsx
<Container className="py-4">
  <Row className="mb-4">
    <Col md={3}>
      {/* Filters Sidebar */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5>Filters</h5>
          {/* Filter controls */}
        </Card.Body>
      </Card>
    </Col>
    <Col md={9}>
      {/* Products Grid */}
      <Row className="g-4">
        {products.map(product => (
          <Col key={product.id} md={4}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Col>
  </Row>
</Container>
```

### 3. Detail Page Layout
```jsx
<Container className="py-4">
  {/* Breadcrumb */}
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="breadcrumb">
      <li className="breadcrumb-item"><Link to="/">Home</Link></li>
      <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
      <li className="breadcrumb-item active">{product.title}</li>
    </ol>
  </nav>

  <Row className="g-4">
    {/* Image Gallery */}
    <Col lg={7}>
      <Card className="border-0 shadow-sm">
        {/* Gallery */}
      </Card>
    </Col>

    {/* Product Info */}
    <Col lg={5}>
      <Card className="border-0 shadow-sm">
        {/* Product details */}
      </Card>
    </Col>
  </Row>

  {/* Related Products */}
  <Row className="mt-5">
    <Col>
      <h3>Similar Products</h3>
      <Row className="g-4">
        {/* Related products grid */}
      </Row>
    </Col>
  </Row>
</Container>
```

---

## 🎨 Icon Usage Patterns

### Bootstrap Icons
```jsx
// Navigation
<i className="bi bi-house"></i>          // Home
<i className="bi bi-box-seam"></i>       // Products
<i className="bi bi-cart"></i>           // Cart
<i className="bi bi-person"></i>         // Profile
<i className="bi bi-bell"></i>           // Notifications

// Actions
<i className="bi bi-plus-circle"></i>    // Add
<i className="bi bi-pencil"></i>         // Edit
<i className="bi bi-trash"></i>          // Delete
<i className="bi bi-eye"></i>            // View
<i className="bi bi-download"></i>       // Download

// Status
<i className="bi bi-check-circle"></i>   // Success
<i className="bi bi-x-circle"></i>       // Error
<i className="bi bi-exclamation-triangle"></i> // Warning
<i className="bi bi-info-circle"></i>    // Info

// Features
<i className="bi bi-geo-alt"></i>        // Location
<i className="bi bi-clock"></i>          // Time
<i className="bi bi-star"></i>           // Rating
<i className="bi bi-heart"></i>          // Favorite
<i className="bi bi-share"></i>          // Share
```

---

## 📱 Responsive Patterns

### Mobile Navigation
```jsx
<Navbar expand="lg" className="shadow-sm">
  <Container>
    <Navbar.Brand>ShareHub</Navbar.Brand>
    <Navbar.Toggle aria-controls="navbar-nav" />
    <Navbar.Collapse id="navbar-nav">
      <Nav className="ms-auto">
        <Nav.Link href="/">Home</Nav.Link>
        <Nav.Link href="/products">Products</Nav.Link>
        <Nav.Link href="/cart">Cart</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
```

### Responsive Grid
```jsx
<Row className="g-4">
  <Col xs={12} sm={6} md={4} lg={3}>
    {/* Card */}
  </Col>
</Row>
```

---

## 🔄 State Management Patterns

### Loading State
```jsx
{loading ? (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-3">Loading...</p>
  </div>
) : (
  <div>{/* Content */}</div>
)}
```

### Error State
```jsx
{error && (
  <Alert variant="danger" dismissible onClose={() => setError('')}>
    <i className="bi bi-exclamation-circle me-2"></i>
    {error}
  </Alert>
)}
```

### Empty State
```jsx
{items.length === 0 ? (
  <div className="text-center py-5">
    <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#ccc' }}></i>
    <h4 className="mt-3">No items found</h4>
    <p className="text-muted">Try adjusting your filters</p>
  </div>
) : (
  <div>{/* Items */}</div>
)}
```

---

## 🎯 Button Patterns

### Primary Actions
```jsx
<Button variant="primary" size="lg" className="w-100">
  <i className="bi bi-cart-plus me-2"></i>
  Add to Cart
</Button>
```

### Secondary Actions
```jsx
<Button variant="outline-primary">
  <i className="bi bi-heart me-2"></i>
  Save
</Button>
```

### Danger Actions
```jsx
<Button variant="danger" size="sm">
  <i className="bi bi-trash me-2"></i>
  Delete
</Button>
```

### Button Groups
```jsx
<ButtonGroup>
  <Button variant="outline-primary">
    <i className="bi bi-pencil"></i>
  </Button>
  <Button variant="outline-danger">
    <i className="bi bi-trash"></i>
  </Button>
</ButtonGroup>
```

---

**This document provides real code patterns used in ShareHub 2.0 to help with design enhancements.**
