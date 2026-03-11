# Marketplace Frontend

Professional React frontend for the marketplace platform built with Vite, React Router, and Bootstrap.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM v6** - Client-side routing
- **Bootstrap 5** - UI framework
- **React Bootstrap** - Bootstrap components for React
- **Axios** - HTTP client
- **React Icons** - Icon library
- **JWT Decode** - JWT token handling

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── layouts/          # Layout components
│   │   └── MainLayout.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── userService.js
│   ├── styles/           # Custom CSS
│   │   └── custom.css
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── index.html            # HTML template
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Backend server running on port 5000

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   The `.env` file is already created with:
   ```env
   VITE_API_URL=http://127.0.0.1:5000/api/v1
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on: http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🎯 Features

### Authentication
- User registration with role selection (Buyer, Seller, NGO)
- Login with JWT authentication
- Password validation with strength indicator
- Protected routes for authenticated users
- Auto-redirect on token expiration

### Product Management
- Browse products with filters
- Product detail pages
- Search functionality
- Category filtering
- Price range filtering
- Condition filtering

### User Dashboard
- Role-based dashboard views
- User profile information
- Account status display
- Role-specific features

### UI/UX
- Responsive design (mobile-first)
- Bootstrap 5 styling
- Custom animations and transitions
- Loading states
- Error handling
- Toast notifications

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token + user data
3. Token stored in localStorage
4. Axios interceptor adds token to all requests
5. Protected routes check authentication
6. Auto-logout on 401 responses

## 📡 API Integration

All API calls go through the centralized `api.js` service:

```javascript
import api from './services/api';

// Example: Get products
const products = await api.get('/products');

// Example: Create order
const order = await api.post('/orders', orderData);
```

### API Base URL
- Development: `http://127.0.0.1:5000/api/v1`
- Configured via `VITE_API_URL` environment variable

## 🎨 Styling

### Bootstrap Classes
- Uses Bootstrap 5 utility classes
- Responsive grid system
- Pre-built components

### Custom CSS
- Located in `src/styles/custom.css`
- Gradient backgrounds
- Hover effects
- Animations
- Custom scrollbar

## 🛣️ Routes

### Public Routes
- `/` - Home page
- `/products` - Browse products
- `/products/:id` - Product detail
- `/about` - About page
- `/contact` - Contact page
- `/signin` - Sign in page
- `/signup` - Sign up page

### Protected Routes
- `/dashboard` - User dashboard
- `/cart` - Shopping cart
- `/orders` - Order history
- `/profile` - User profile

### Error Pages
- `/unauthorized` - 403 error
- `/server-error` - 500 error
- `*` - 404 Not Found

## 🔄 State Management

### Auth Context
Global authentication state managed via React Context:

```javascript
import { useAuth } from './contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

## 📦 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security Features

- JWT token authentication
- Protected routes
- XSS protection via React
- CSRF protection
- Secure HTTP-only cookies (backend)
- Input validation
- Password strength requirements

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - xs: <576px
  - sm: ≥576px
  - md: ≥768px
  - lg: ≥992px
  - xl: ≥1200px

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### API connection issues
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Use 127.0.0.1 instead of localhost for XAMPP

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Guidelines

1. **Component Structure:**
   - One component per file
   - Use functional components with hooks
   - Keep components small and focused

2. **Naming Conventions:**
   - PascalCase for components
   - camelCase for functions/variables
   - UPPER_CASE for constants

3. **Code Style:**
   - Use ES6+ features
   - Async/await for promises
   - Destructuring where appropriate
   - Arrow functions for callbacks

4. **Error Handling:**
   - Try-catch blocks for async operations
   - Display user-friendly error messages
   - Log errors to console in development

## 🚀 Production Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to:**
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Update environment variables:**
   - Set production API URL
   - Configure CORS on backend

## 📄 License

This project is part of the marketplace platform.

## 👥 Support

For issues or questions, contact the development team.
