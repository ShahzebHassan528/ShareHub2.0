# Marketplace Platform - E-commerce + Donation + Swap System

A full-stack marketplace platform built with React (Vite) and Node.js/Express that supports:
- Product buying/selling
- Item swapping between users
- Donations to NGOs
- Multi-role authentication (Admin, Seller, Buyer, NGO)

## Tech Stack

### Frontend
- React 18 with Vite
- React Router DOM
- React Bootstrap
- React Icons
- Axios for API calls

### Backend
- Node.js with Express
- MySQL Database
- **Sequelize ORM** - Database abstraction layer
- JWT Authentication
- Bcrypt for password hashing
- Automatic database creation and table synchronization

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/haseebchoudhary/project123.git
cd project123
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Configure Database**
   - Update `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=marketplace_db
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
USE_SEQUELIZE=true
```

   **Note:** The database and tables will be created automatically when you start the server!

4. **Start Development Servers**
```bash
npm run dev
```

This will:
- Automatically create the database if it doesn't exist
- Automatically create/update all tables using Sequelize
- Start Frontend: http://localhost:3000
- Start Backend: http://localhost:5000

**That's it!** No manual database setup required. The application handles everything automatically.

## Project Structure

```
project123/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── backend/               # Express backend
│   ├── config/           # Database & Sequelize configuration
│   ├── database/         
│   │   └── models/       # Sequelize model definitions
│   ├── middleware/       # Auth middleware
│   ├── models/           # Model wrappers (business logic)
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
└── package.json          # Root package.json
```

## Database Architecture

### Sequelize ORM Integration

This project uses **Sequelize ORM** for all database operations, providing:

- **Automatic Database Creation**: Database is created automatically if it doesn't exist
- **Automatic Table Synchronization**: Tables are created/updated automatically in development
- **Cross-Platform Compatibility**: Works seamlessly on Windows, Linux, and macOS
- **Type Safety**: Model definitions with validation
- **Relationship Management**: Automatic handling of foreign keys and associations
- **Query Abstraction**: No raw SQL needed for most operations

### Database Automation Workflow

When you run `npm run dev`, the following happens automatically:

1. **Database Check**: Checks if `marketplace_db` exists
2. **Database Creation**: Creates database if missing (with UTF8MB4 encoding)
3. **Model Synchronization**: Creates/updates all tables based on Sequelize models
4. **Server Start**: Starts the Express server

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=marketplace_db

# Application
NODE_ENV=development        # development | production
JWT_SECRET=your_secret_key
PORT=5000

# ORM Control
USE_SEQUELIZE=true         # true (default) | false (fallback to raw SQL)
```

### Model Architecture

The project uses a **wrapper pattern** for models:

```
database/models/           # Sequelize model definitions
  ├── User.sequelize.js    # Schema definition
  ├── Product.sequelize.js
  └── ...

models/                    # Business logic wrappers
  ├── User.sequelize.wrapper.js    # API methods
  ├── Product.sequelize.wrapper.js
  └── ...
```

**Benefits:**
- Clean separation of schema and business logic
- 100% API compatibility with previous raw SQL implementation
- Easy to test and maintain
- Fallback support for raw SQL if needed

### Production Safety

In production (`NODE_ENV=production`):
- Automatic table synchronization is **disabled**
- Database must be set up manually or via migrations
- Prevents accidental data loss
- Use migrations for schema changes

### Manual Database Operations (Optional)

If you prefer manual control:

```bash
# Create database and tables manually
./setup-database.sh

# Reset database (WARNING: Deletes all data)
./reset-database.sh

# Test Sequelize connection
cd backend
npm run test:sequelize

# Test database auto-creation
npm run test:db-creation

# Test table synchronization
npm run test:sync
```

## Features

### User Roles

1. **Buyer/Customer**
   - Browse and purchase products
   - Swap items with other users
   - Donate items to NGOs
   - Auto-verified on signup

2. **Seller**
   - List products for sale
   - Manage inventory
   - Track sales
   - Requires admin approval

3. **NGO**
   - Receive donations
   - Manage donation requests
   - Requires admin verification

4. **Admin**
   - Approve sellers
   - Verify NGOs
   - Monitor platform activity
   - Manage all users

### Key Features

- **Authentication**: JWT-based secure authentication
- **Product Management**: Full CRUD for products with images
- **Swap System**: User-to-user item exchange
- **Donation System**: Direct donations to verified NGOs
- **Condition Tracking**: Products have condition ratings (new, like_new, good, fair, poor)
- **Reviews & Ratings**: Users can review products and sellers
- **Order Management**: Complete order tracking system
- **Responsive Design**: Mobile-friendly UI with Bootstrap

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller only)

### Swaps
- `GET /api/swaps` - Get all swap items
- `GET /api/swaps/:id` - Get single swap item
- `POST /api/swaps` - Create swap request

## Test Credentials

After running `create-test-users.js`:

- **Buyer**: buyer1@example.com / buyer123
- **Seller**: seller1@example.com / seller123
- **NGO**: ngo1@example.com / ngo123
- **Admin**: admin@marketplace.com / admin123

See `TEST_CREDENTIALS.md` for complete details.

## Database Schema

The platform uses MySQL with the following main tables:
- `users` - All user accounts
- `sellers` - Seller profiles
- `ngos` - NGO profiles
- `products` - Product listings
- `product_images` - Product images
- `orders` - Purchase orders
- `donations` - Donation records
- `product_swaps` - Swap requests
- `reviews` - Product reviews
- `notifications` - User notifications

## Development

### Running Backend Only
```bash
cd backend
npm start
```

### Running Frontend Only
```bash
cd frontend
npm run dev
```

### Database Reset
```bash
./reset-database.sh
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
