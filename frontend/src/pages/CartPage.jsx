/**
 * Cart Page
 * Shopping cart with checkout functionality
 */

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container py-5">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <i className="bi bi-cart-x"></i>
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              <i className="bi bi-shop me-2"></i>
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      <div className="container py-4">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="btn btn-outline-danger" onClick={clearCart}>
            <i className="bi bi-trash me-2"></i>
            Clear Cart
          </button>
        </div>

        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.image_url || item.images?.[0] ? (
                      <img 
                        src={item.image_url || item.images[0]} 
                        alt={item.title}
                      />
                    ) : (
                      <div className="cart-item-no-image">
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <Link to={`/products/${item.id}`} className="cart-item-title">
                      {item.title}
                    </Link>
                    
                    {item.condition && (
                      <span className="cart-item-condition">{item.condition}</span>
                    )}
                    
                    <div className="cart-item-price">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <div className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal ({cart.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>

              {shipping === 0 && (
                <div className="free-shipping-badge">
                  <i className="bi bi-truck me-2"></i>
                  Free shipping on orders over Rs 5,000
                </div>
              )}

              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button 
                className="btn btn-primary btn-lg w-100 checkout-btn"
                onClick={handleCheckout}
              >
                <i className="bi bi-credit-card me-2"></i>
                Proceed to Checkout
              </button>

              <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">
                <i className="bi bi-arrow-left me-2"></i>
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <i className="bi bi-shield-check"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge">
                  <i className="bi bi-truck"></i>
                  <span>Fast Delivery</span>
                </div>
                <div className="trust-badge">
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
