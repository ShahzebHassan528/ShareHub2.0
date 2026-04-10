# ShareHub 2.0 - Complete Design System Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Component Structure](#component-structure)
5. [Page Structure](#page-structure)
6. [Styling Patterns](#styling-patterns)
7. [Key Features](#key-features)

---

## 🎯 Project Overview

**ShareHub 2.0** is a multi-role marketplace platform with the following user types:
- **Admin**: Manage users, products, sellers, NGOs
- **Buyer**: Browse, purchase, swap products
- **Seller**: List and manage products, handle orders
- **NGO**: Receive donations, manage donation campaigns

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.2.0 with Vite
- **Routing**: React Router DOM v6
- **UI Library**: React Bootstrap 2.10.10 + Bootstrap 5.3.8
- **Icons**: Bootstrap Icons 1.13.1 + React Icons 5.5.0
- **HTTP Client**: Axios 1.13.5
- **Authentication**: JWT with jwt-decode 4.0.0
- **Authorization**: CASL (ability-based)
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap)
- **Date Handling**: date-fns 4.1.0

### Backend
- **Runtime**: Node.js with Express
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Queue**: BullMQ with Redis
- **Security**: Helmet, CORS, Rate Limiting, XSS Clean

---

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--emerald-green: #10b981;
--emerald-dark: #059669;
--emerald-light: #34d399;

/* Secondary Colors */
--purple-gradient-start: #667eea;
--purple-gradient-end: #764ba2;

/* Status Colors */
--success: #28a745;
--error: #dc3545;
--warning: #ffc107;
--info: #17a2b8;

/* Neutral Colors */
--white: #ffffff;
--gray-light: #f8f9fa;
--gray-medium: #6c757d;
--gray-dark: #343a40;
```

### Typography
- **Font Family**: System fonts (default Bootstrap)
- **Headings**: Bold (700 weight)
- **Body**: Regular (400 weight)
- **Hero Title**: 3rem (desktop), 2rem (mobile)
- **Section Title**: 1.5rem
- **Body Text**: 0.95rem - 1rem

### Spacing
- **Container Padding**: py-4 (1.5rem)
- **Card Padding**: p-3 to p-4
- **Section Margin**: mb-4 to mb-5
- **Grid Gap**: g-3 to g-4

### Border Radius
- **Cards**: 12px
- **Buttons**: 8px
- **Badges**: 4px
- **Images**: 8px

### Shadows
- **Card Default**: 0 2px 8px rgba(0,0,0,0.1)
- **Card Hover**: 0 12px 24px rgba(0,0,0,0.15)
- **Button Hover**: 0 4px 12px rgba(0,0,0,0.2)

---

## 🧩 Component Structure

### Layout Components
```
components/
├── layout/
│   ├── Navbar.jsx          # Main navigation with role-based menu
│   ├── Navbar.css
│   ├── Footer.jsx          # Site footer with links
│   ├── Footer.css
│   ├── Sidebar.jsx         # Dashboard sidebar
│   └── Sidebar.css
├── Navbar.jsx              # Legacy navbar (consider consolidating)
└── Footer.jsx              # Legacy footer
```

### Common Components
```
components/common/
├── StatusBadge.jsx         # Status indicator badges
├── StatusBadge.css
├── MapView.jsx             # Display location on map
└── LocationPicker.jsx      # Interactive map for location selection
```

### Feature Components
```
components/
├── products/
│   ├── ProductCard.jsx     # Product display card
│   ├── ProductGrid.jsx     # Grid layout for products
│   ├── ProductForm.jsx     # Add/Edit product form
│   └── ProductSkeleton.jsx # Loading placeholder
├── swap/
│   ├── SwapRequestButton.jsx
│   ├── SwapModal.jsx
│   └── SwapRequestButton.css
├── donation/
│   ├── DonateButton.jsx
│   ├── DonationModal.jsx
│   └── DonateButton.css
└── notifications/
    ├── NotificationItem.jsx
    └── NotificationItem.css
```

---

## 📄 Page Structure

### Public Pages
```
pages/
├── Home.jsx                # Landing page with hero section
├── Home.css
├── Products.jsx            # Product listing/browse
├── Products.css
├── ProductDetail.jsx       # Single product view
├── ProductDetail.css
├── SignIn.jsx              # Login page
├── SignUp.jsx              # Registration (multi-role)
├── About.jsx               # About page
├── Contact.jsx             # Contact page
└── Help.jsx                # Help/FAQ page
```

### User Dashboards
```
pages/
├── user/
│   ├── UserDashboard.jsx   # General user dashboard
│   └── UserDashboard.css
├── buyer/
│   ├── BuyerDashboard.jsx  # Buyer-specific dashboard
│   └── BuyerDashboard.css
├── seller/
│   ├── SellerDashboard.jsx
│   ├── SellerProducts.jsx  # Manage products
│   ├── SellerOrders.jsx    # Manage orders
│   ├── AddProduct.jsx      # Create new product
│   └── EditProduct.jsx     # Edit existing product
├── ngo/
│   ├── NgoDashboard.jsx
│   └── NgoPendingPage.jsx  # Pending verification
└── admin/
    ├── AdminDashboard.jsx
    ├── AdminUsers.jsx      # User management
    ├── AdminProducts.jsx   # Product moderation
    ├── AdminSellers.jsx    # Seller approval
    ├── AdminNGOs.jsx       # NGO verification
    └── AdminActivity.jsx   # Activity logs
```

### Feature Pages
```
pages/
├── swaps/
│   ├── SwapExplore.jsx     # Browse swap items
│   ├── MySwaps.jsx         # User's swap requests
│   └── SwapOffers.jsx      # Incoming swap offers
├── donations/
│   ├── UserDonations.jsx   # User donation history
│   └── NgoDonations.jsx    # NGO received donations
├── CartPage.jsx            # Shopping cart
├── CheckoutPage.jsx        # Checkout process
├── MyOrdersPage.jsx        # Order history
├── FavoritesPage.jsx       # Saved products
├── MessagesPage.jsx        # Messaging system
├── Notifications.jsx       # Notification center
├── Profile.jsx             # User profile
└── Settings.jsx            # User settings
```

---

## 🎭 Styling Patterns

### Card Pattern
```css
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```

### Button Pattern
```css
.btn-primary {
  background-color: #10b981;
  border-color: #10b981;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #059669;
  transform: translateY(-2px);
}
```

### Product Card Pattern
```css
.product-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
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

### Hero Section Pattern
```css
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
}

.hero-section h1 {
  font-size: 3rem;
  font-weight: 700;
}
```

### Toast Notification Pattern
```css
.toast {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 1rem;
}

.toast-success {
  border-left: 4px solid #28a745;
}
```

---

## ✨ Key Features

### 1. Multi-Role Authentication
- JWT-based authentication
- Role-based routing and access control
- CASL ability-based authorization

### 2. Product Management
- CRUD operations for products
- Image upload with Multer
- Category-based filtering
- Condition-based filtering
- Location-based display with maps

### 3. Swap System
- Product-to-product swapping
- Swap request management
- Status tracking (pending, accepted, rejected)

### 4. Donation System
- NGO donation campaigns
- Donation tracking
- NGO verification system

### 5. Shopping Features
- Shopping cart
- Checkout process
- Order management
- Order status tracking

### 6. Messaging System
- User-to-user messaging
- Seller-buyer communication
- Real-time notifications

### 7. Admin Panel
- User management
- Product moderation
- Seller approval workflow
- NGO verification workflow
- Activity logging

### 8. Map Integration
- OpenStreetMap (Leaflet)
- Location picker for products
- Map view on product details
- Reverse geocoding for addresses

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 992px
- **Desktop**: > 992px

### Mobile Optimizations
- Collapsible navigation
- Stacked layouts
- Touch-friendly buttons (min 44px)
- Reduced font sizes
- Simplified cards

---

## 🎯 Design Principles

1. **Consistency**: Uniform spacing, colors, and typography
2. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
3. **Performance**: Lazy loading, code splitting, optimized images
4. **User Experience**: Clear CTAs, loading states, error handling
5. **Responsiveness**: Mobile-first approach
6. **Visual Hierarchy**: Clear information architecture

---

## 🔄 Animation & Transitions

### Standard Transitions
```css
transition: all 0.3s ease;
```

### Hover Effects
- Cards: translateY(-8px)
- Buttons: translateY(-2px)
- Images: scale(1.05)

### Loading States
- Skeleton screens for content
- Spinner for actions
- Progress bars for uploads

---

## 📦 Component Props Patterns

### ProductCard
```jsx
<ProductCard
  product={object}      // Product data
  onAddToCart={func}    // Cart handler
  onSwap={func}         // Swap handler
  showActions={bool}    // Show action buttons
/>
```

### MapView
```jsx
<MapView
  latitude={number}
  longitude={number}
  title={string}
  height={string}       // CSS height value
/>
```

### LocationPicker
```jsx
<LocationPicker
  onLocationSelect={func}  // Callback with {lat, lng, address}
  initialPosition={object} // {lat, lng}
/>
```

---

## 🎨 CSS Architecture

### File Organization
- Component-specific CSS files alongside JSX
- Global styles in `src/styles/custom.css`
- Bootstrap overrides in custom.css
- Context-specific styles (ToastContext.css)

### Naming Convention
- BEM-inspired: `.component-element--modifier`
- Descriptive class names
- Avoid deep nesting

---

## 🚀 Performance Optimizations

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: Proper sizing, lazy loading
3. **Caching**: API response caching
4. **Debouncing**: Search inputs
5. **Pagination**: Large data sets
6. **Skeleton Screens**: Better perceived performance

---

## 📝 Notes for Enhancement

### Current Strengths
- Clean, modern design
- Consistent color scheme
- Good component organization
- Responsive layouts
- Smooth animations

### Areas for Improvement
- Consider design system library (Chakra UI, Material-UI)
- Add dark mode support
- Enhance accessibility (WCAG compliance)
- Add micro-interactions
- Improve loading states
- Add empty states illustrations
- Consider adding animations library (Framer Motion)

---

## 📞 Contact & Support

For design questions or enhancements, refer to:
- Component files in `src/components/`
- Page files in `src/pages/`
- Style files (*.css) alongside components
- Global styles in `src/styles/custom.css`

---

**Last Updated**: April 2026
**Version**: 2.0
**Framework**: React + Bootstrap 5
