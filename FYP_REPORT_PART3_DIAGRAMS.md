# ShareHub 2.0 - FYP Report Part 3: Diagrams Guide

## Chapter 4: METHODOLOGY

### 4.1 Development Methodology

**Agile Scrum** methodology was adopted with 2-week sprints:

**Sprint 1-2**: Requirements gathering, database design
**Sprint 3-4**: User authentication, role management
**Sprint 5-6**: Product management, search functionality
**Sprint 7-8**: Shopping cart, checkout process
**Sprint 9-10**: Swap system implementation
**Sprint 11-12**: Donation system, NGO verification
**Sprint 13-14**: Messaging system, notifications
**Sprint 15-16**: Admin panel, testing, deployment

### 4.2 Tools and Technologies

#### 4.2.1 Frontend
- **React 18.2.0**: Component-based UI development
- **React Bootstrap 2.10.10**: Responsive UI components
- **React Router DOM 6.20.0**: Client-side routing
- **Axios 1.13.5**: HTTP client for API calls
- **Leaflet + React-Leaflet**: Map integration
- **CASL**: Authorization and permissions
- **Vite 5.0.8**: Build tool and dev server

#### 4.2.2 Backend
- **Node.js 18+**: JavaScript runtime
- **Express 4.18.2**: Web application framework
- **MySQL 8.0**: Relational database
- **Sequelize 6.37.7**: ORM for database operations
- **Redis 5.11.0**: Caching and session management
- **BullMQ 5.70.1**: Job queue for background tasks
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing
- **Multer**: File upload handling

#### 4.2.3 Security
- **Helmet**: HTTP headers security
- **Express Rate Limit**: API rate limiting
- **XSS Clean**: XSS attack prevention
- **HPP**: HTTP Parameter Pollution prevention

#### 4.2.4 Development Tools
- **Git**: Version control
- **VS Code**: Code editor
- **Postman**: API testing
- **MySQL Workbench**: Database management

### 4.3 Development Process

1. **Requirements Analysis**: Stakeholder interviews, user surveys
2. **Design Phase**: Database schema, API design, UI mockups
3. **Implementation**: Iterative development with code reviews
4. **Testing**: Unit tests, integration tests, user acceptance testing
5. **Deployment**: Production server setup, CI/CD pipeline

---

## Chapter 5: SYSTEM ARCHITECTURE

### 5.1 System Architecture

#### 5.1.1 Architecture Design Approach

ShareHub 2.0 follows a **Three-Tier Architecture**:

1. **Presentation Layer** (Frontend): React-based SPA
2. **Application Layer** (Backend): Node.js/Express REST API
3. **Data Layer**: MySQL database with Redis caching

**Design Patterns Used:**
- **MVC Pattern**: Separation of concerns
- **Repository Pattern**: Data access abstraction
- **Factory Pattern**: Object creation
- **Observer Pattern**: Event-driven notifications
- **Singleton Pattern**: Database connections

#### 5.1.2 Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Browser │  │  Mobile  │  │  Tablet  │  │  Desktop │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                  │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  │
│  │  │ Pages  │ │Components│ │Contexts│ │ Hooks │        │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │  │
│  │  ┌────────────────────────────────────────┐          │  │
│  │  │     React Router (Client Routing)      │          │  │
│  │  └────────────────────────────────────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js REST API Server                  │  │
│  │  ┌────────────────────────────────────────┐          │  │
│  │  │  Middleware Layer                       │          │  │
│  │  │  • Authentication (JWT)                 │          │  │
│  │  │  • Authorization (CASL)                 │          │  │
│  │  │  • Rate Limiting                        │          │  │
│  │  │  • Security (Helmet, XSS, HPP)          │          │  │
│  │  └────────────────────────────────────────┘          │  │
│  │  ┌────────────────────────────────────────┐          │  │
│  │  │  Controllers                            │          │  │
│  │  │  • Auth • Product • Order • Swap        │          │  │
│  │  │  • Donation • Message • Admin           │          │  │
│  │  └────────────────────────────────────────┘          │  │
│  │  ┌────────────────────────────────────────┐          │  │
│  │  │  Services/Business Logic                │          │  │
│  │  └────────────────────────────────────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    MySQL     │  │    Redis     │  │  File System │     │
│  │   Database   │  │    Cache     │  │   (Images)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.3 Subsystem Architecture

**Frontend Subsystems:**
1. **Authentication Module**: Login, registration, password reset
2. **Product Module**: Listing, search, detail view
3. **Cart Module**: Add to cart, checkout
4. **Swap Module**: Request, manage swaps
5. **Donation Module**: Donate to NGOs
6. **Messaging Module**: Real-time chat
7. **Admin Module**: Platform management

**Backend Subsystems:**
1. **API Gateway**: Request routing, validation
2. **Auth Service**: JWT generation, verification
3. **User Service**: User management, roles
4. **Product Service**: CRUD operations
5. **Order Service**: Order processing
6. **Swap Service**: Swap logic
7. **Donation Service**: Donation tracking
8. **Message Service**: Message handling
9. **Notification Service**: Event notifications
10. **Admin Service**: Platform administration

---

## DIAGRAM IDEAS FOR YOUR REPORT

### 1. USE CASE DIAGRAM

**Actors:**
- Buyer
- Seller
- NGO
- Admin
- Guest

**Use Cases:**
- Register/Login
- Browse Products
- Search Products
- Add to Cart
- Checkout
- Request Swap
- Donate Item
- Send Message
- Manage Products (Seller)
- Approve Sellers/NGOs (Admin)
- View Reports (Admin)

**Tool**: Draw.io, Lucidchart, or Visual Paradigm

### 2. ER DIAGRAM

**Main Entities:**
- Users (id, email, password, role, full_name, phone)
- Sellers (user_id, business_name, business_address, approval_status)
- NGOs (user_id, ngo_name, registration_number, verification_status)
- Products (id, seller_id, title, description, price, condition, latitude, longitude)
- ProductImages (id, product_id, image_url)
- Categories (id, name, parent_id)
- Orders (id, buyer_id, total_amount, status)
- OrderItems (id, order_id, product_id, quantity, price)
- ProductSwaps (id, requester_id, owner_id, requester_product_id, owner_product_id, status)
- Donations (id, donor_id, ngo_id, product_id, status)
- Messages (id, sender_id, receiver_id, content, read_status)
- Notifications (id, user_id, type, content, read_status)

**Relationships:**
- User 1:1 Seller/NGO
- Seller 1:N Products
- Product N:M Categories
- Product 1:N ProductImages
- Buyer 1:N Orders
- Order 1:N OrderItems
- User N:M Messages
- Product N:M Swaps

### 3. ARCHITECTURAL DIAGRAM

Show three-tier architecture with:
- Client devices
- Load balancer
- Web servers
- Application servers
- Database cluster
- Redis cache
- File storage

### 4. ACTIVITY DIAGRAM

Create separate diagrams for:
- **User Registration Flow**
- **Product Purchase Flow**
- **Swap Request Flow**
- **Donation Flow**

### 5. SEQUENCE DIAGRAM

Show interactions for:
- **Login Process**: User → Frontend → Backend → Database
- **Add to Cart**: User → Frontend → Backend → Redis → Response
- **Checkout**: User → Frontend → Backend → Database → Notification Service

### 6. COMPONENT DIAGRAM

Show:
- Frontend Components (React)
- Backend Components (Express)
- Database Components
- External Services (OpenStreetMap)

### 7. STATE MACHINE DIAGRAM

For:
- **Order States**: Pending → Processing → Shipped → Delivered → Completed
- **Swap States**: Pending → Accepted/Rejected → Completed
- **Product States**: Draft → Pending Approval → Approved → Active/Blocked

### 8. CLASS DIAGRAM

Show main classes:
- User, Seller, NGO, Admin
- Product, Category, ProductImage
- Order, OrderItem
- Swap, Donation
- Message, Notification

With methods and relationships

### 9. DATA FLOW DIAGRAM (DFD)

**Level 0 (Context Diagram):**
- External entities: Users, Admin
- System: ShareHub 2.0
- Data flows: User data, Product data, Orders

**Level 1:**
- Processes: Authentication, Product Management, Order Processing, Swap Management

**Level 2:**
- Detailed processes for each subsystem

### 10. DATABASE DIAGRAM

Show:
- All tables with columns and data types
- Primary keys, foreign keys
- Indexes
- Relationships with cardinality

---

*Continue to Part 4 for Implementation and Testing*
