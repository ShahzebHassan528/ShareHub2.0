import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ToastProvider } from './contexts/ToastContext'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import ROLES from './config/roles'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Browse from './pages/Browse'
import Products from './pages/Products'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SwapMarketplace from './pages/SwapMarketplace'
import SwapDetail from './pages/SwapDetail'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Login from './pages/Login'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import SellerDashboard from './pages/seller/SellerDashboard'
import NgoDashboard from './pages/ngo/NgoDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSellers from './pages/admin/AdminSellers'
import AdminNGOs from './pages/admin/AdminNGOs'
import AdminProducts from './pages/admin/AdminProducts'
import UserDashboard from './pages/user/UserDashboard'
import Profile from './pages/Profile'
import UserDonations from './pages/donations/UserDonations'
import NgoDonations from './pages/donations/NgoDonations'
import MySwaps from './pages/swaps/MySwaps'
import SwapOffers from './pages/swaps/SwapOffers'
import SwapExplore from './pages/swaps/SwapExplore'
import NgoListing from './pages/ngos/NgoListing'
import SellerProducts from './pages/seller/SellerProducts'
import AddProduct from './pages/seller/AddProduct'
import EditProduct from './pages/seller/EditProduct'
import Notifications from './pages/Notifications'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import Settings from './pages/Settings'
import HelpPage from './pages/Help'
import MessagesPage from './pages/MessagesPage'
import ConversationPage from './pages/ConversationPage'
import SellerPendingPage from './pages/seller/SellerPendingPage'
import NgoPendingPage from './pages/ngo/NgoPendingPage'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'
import ServerError from './pages/ServerError'
import ComingSoon from './pages/ComingSoon'
import './App.css'

function App() {
  console.log('App component rendering...');
  
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <Routes>
          {/* Public Routes with Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products-old" element={<Products />} />
            <Route path="/swap-marketplace" element={<SwapMarketplace />} />
            <Route path="/swaps/explore" element={<SwapExplore />} />
            <Route path="/swap/:id" element={<SwapDetail />} />
            <Route path="/ngos" element={<NgoListing />} />
          </Route>

          {/* Auth Routes (No Layout) */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route element={<MainLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/donations/my" element={<ProtectedRoute><UserDonations /></ProtectedRoute>} />
            <Route path="/swaps/my" element={<ProtectedRoute><MySwaps /></ProtectedRoute>} />
            <Route path="/swaps/offers" element={<ProtectedRoute><SwapOffers /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
          </Route>

          {/* Role-Based Dashboard Routes */}
          {/* Generic Dashboard - Redirects to role-specific dashboard */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Buyer Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route 
              path="/buyer/dashboard" 
              element={
                <ProtectedRoute requiredRole={ROLES.BUYER}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* User Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Seller Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/seller/pending"
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <SellerPendingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/seller/products" 
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <SellerProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/products/add" 
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <AddProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/products/edit/:id" 
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <EditProduct />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* NGO Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/ngo/pending"
              element={
                <ProtectedRoute requiredRole={ROLES.NGO}>
                  <NgoPendingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute requiredRole={ROLES.NGO}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/ngo/donations" 
              element={
                <ProtectedRoute requiredRole={ROLES.NGO}>
                  <NgoDonations />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<AdminLayout />}>
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole={ROLES.ADMIN}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/sellers" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminSellers /></ProtectedRoute>} />
            <Route path="/admin/ngos" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminNGOs /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminProducts /></ProtectedRoute>} />
          </Route>
          
          {/* Error Pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
