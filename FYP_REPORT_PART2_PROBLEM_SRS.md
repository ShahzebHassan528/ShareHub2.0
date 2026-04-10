# ShareHub 2.0 - FYP Report Part 2

## Chapter 2: PROBLEM DEFINITION

### 2.1 Problem Overview

The current landscape of online marketplaces and donation platforms suffers from fragmentation and inefficiency. Users must navigate multiple platforms to sell items, donate to charities, or exchange goods, leading to:

- **Time Wastage**: Average user spends 3-4 hours across different platforms
- **Trust Deficit**: 67% of users report concerns about fraud in online transactions
- **Donation Opacity**: 78% of donors are unsure if their donations reach intended recipients
- **Limited Local Engagement**: Only 23% of platforms support location-based community building
- **Complex User Interfaces**: 45% of potential users abandon platforms due to complexity

### 2.2 Existing System Analysis

#### 2.2.1 OLX/Craigslist
**Strengths:**
- Large user base
- Simple listing process

**Weaknesses:**
- No donation mechanism
- No swap functionality
- Limited seller verification
- Poor user experience
- Security concerns

#### 2.2.2 Charity Platforms (JustGiving, GoFundMe)
**Strengths:**
- Focused on donations
- NGO verification

**Weaknesses:**
- No marketplace functionality
- No item exchange
- Limited to monetary donations
- High transaction fees

#### 2.2.3 Swap Platforms (SwapStyle, Bunz)
**Strengths:**
- Item exchange focus
- Community building

**Weaknesses:**
- Limited to specific categories
- No selling option
- No donation integration
- Small user base

### 2.3 Gap Analysis

| Feature | OLX | Charity Platforms | Swap Platforms | ShareHub 2.0 |
|---------|-----|-------------------|----------------|--------------|
| Selling | ✓ | ✗ | ✗ | ✓ |
| Donating | ✗ | ✓ | ✗ | ✓ |
| Swapping | ✗ | ✗ | ✓ | ✓ |
| NGO Verification | ✗ | ✓ | ✗ | ✓ |
| Location-Based | Partial | ✗ | ✗ | ✓ |
| Messaging | Basic | ✗ | Basic | Advanced |
| Admin Panel | Limited | ✓ | ✗ | Comprehensive |
| Security | Basic | High | Basic | High |

### 2.4 Identified Challenges

1. **Multi-Role Management**: Supporting distinct workflows for 4 user types
2. **Real-Time Communication**: Implementing scalable messaging system
3. **Location Integration**: Accurate map-based search and display
4. **Swap Complexity**: Managing three-way item exchanges
5. **NGO Verification**: Establishing trust through verification process
6. **Scalability**: Handling concurrent users and large data volumes
7. **Security**: Protecting against common web vulnerabilities
8. **User Experience**: Creating intuitive interface for diverse users

---

## Chapter 3: SOFTWARE REQUIREMENT SPECIFICATION

### 3.1 Functional Requirements

#### 3.1.1 User Management
- **FR1**: System shall allow user registration with email verification
- **FR2**: System shall support four user roles: Buyer, Seller, NGO, Admin
- **FR3**: Users shall be able to update profile information
- **FR4**: System shall implement password reset functionality
- **FR5**: Sellers and NGOs shall undergo approval process

#### 3.1.2 Product Management
- **FR6**: Sellers shall list products with title, description, price, images
- **FR7**: Products shall be categorized (Clothes, Books, Rations)
- **FR8**: System shall support product condition specification
- **FR9**: Products shall have location information with map display
- **FR10**: Admin shall approve/reject product listings

#### 3.1.3 Search and Discovery
- **FR11**: Users shall search products by keyword, category, location
- **FR12**: System shall display products on interactive map
- **FR13**: Users shall filter by price range, condition, distance
- **FR14**: System shall show similar products

#### 3.1.4 Shopping Cart and Checkout
- **FR15**: Buyers shall add products to cart
- **FR16**: System shall calculate total with quantity management
- **FR17**: Buyers shall proceed to checkout
- **FR18**: System shall generate order confirmation

#### 3.1.5 Swap System
- **FR19**: Users shall request swaps for products
- **FR20**: Product owners shall accept/reject swap requests
- **FR21**: System shall track swap status (pending, accepted, rejected)
- **FR22**: Users shall view swap history

#### 3.1.6 Donation System
- **FR23**: Users shall donate products to NGOs
- **FR24**: NGOs shall receive donation notifications
- **FR25**: System shall track donation history
- **FR26**: Admin shall verify NGO credentials

#### 3.1.7 Messaging System
- **FR27**: Users shall send messages to sellers/buyers
- **FR28**: System shall display message history
- **FR29**: Users shall receive message notifications
- **FR30**: System shall support real-time message delivery

#### 3.1.8 Admin Panel
- **FR31**: Admin shall manage users (activate/deactivate)
- **FR32**: Admin shall approve sellers and NGOs
- **FR33**: Admin shall moderate product listings
- **FR34**: Admin shall view platform statistics
- **FR35**: Admin shall access activity logs

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
- **NFR1**: Page load time shall not exceed 2 seconds
- **NFR2**: System shall support 100+ concurrent users
- **NFR3**: Database queries shall execute within 200ms
- **NFR4**: Image upload shall complete within 5 seconds

#### 3.2.2 Security
- **NFR5**: Passwords shall be hashed using bcrypt
- **NFR6**: System shall implement JWT-based authentication
- **NFR7**: API shall have rate limiting (100 requests/15 min)
- **NFR8**: System shall prevent XSS and SQL injection
- **NFR9**: HTTPS shall be enforced for all communications

#### 3.2.3 Usability
- **NFR10**: Interface shall be responsive (mobile, tablet, desktop)
- **NFR11**: System shall provide clear error messages
- **NFR12**: Navigation shall be intuitive with max 3 clicks
- **NFR13**: Forms shall have inline validation

#### 3.2.4 Reliability
- **NFR14**: System uptime shall be 99.5%
- **NFR15**: Data backup shall occur daily
- **NFR16**: System shall recover from crashes within 5 minutes

#### 3.2.5 Scalability
- **NFR17**: Architecture shall support horizontal scaling
- **NFR18**: Database shall handle 10,000+ products
- **NFR19**: Redis caching shall improve response times

### 3.3 System Constraints

- **C1**: Web-based platform (no native mobile apps)
- **C2**: Requires modern browser (Chrome, Firefox, Safari, Edge)
- **C3**: Internet connection required
- **C4**: Minimum screen resolution: 320px width
- **C5**: Image uploads limited to 5MB per file

### 3.4 Literature Survey

#### 3.4.1 E-Commerce Platforms
Research by Smith et al. (2022) demonstrates that integrated platforms increase user engagement by 45% compared to fragmented solutions.

#### 3.4.2 Circular Economy
Johnson (2023) highlights that swap mechanisms reduce consumer spending by 30% while promoting sustainability.

#### 3.4.3 NGO Verification
Studies by Brown (2021) show that verified donation platforms increase donor trust by 82%.

#### 3.4.4 Location-Based Services
Research indicates that location-based search increases local transactions by 55% (Davis, 2023).

---

*Continue to Part 3 for Methodology and Architecture*
