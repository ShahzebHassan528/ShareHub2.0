/**
 * Checkout Page
 * Complete checkout flow with order placement
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import orderAPI from '../api/order.api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        phone: formData.phone,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await orderAPI.createOrder(orderData);

      toast.success('Order placed successfully!');
      setOrderPlaced(true);
      clearCart();
      navigate(`/orders/${response.data?.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  return (
    <div className="checkout-page">
      <div className="container py-4">
        <h1 className="checkout-title">Checkout</h1>

        <div className="row g-4">
          {/* Checkout Form */}
          <div className="col-lg-7">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h3>Shipping Address</h3>
                
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House no, Street name"
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                    {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3>Payment Method</h3>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <i className="bi bi-cash-coin"></i>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <i className="bi bi-credit-card"></i>
                      <div>
                        <strong>Credit/Debit Card</strong>
                        <p>Secure online payment</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card Details */}
              {formData.paymentMethod === 'card' && (
                <div className="form-section">
                  <h3>Card Details</h3>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        maxLength={19}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardData(prev => ({ ...prev, cardNumber: v.replace(/(.{4})/g, '$1 ').trim() }));
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Name on Card</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={cardData.cardName}
                        onChange={e => setCardData(prev => ({ ...prev, cardName: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardData(prev => ({ ...prev, expiry: v }));
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="•••"
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={e => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      />
                    </div>
                    <div className="col-12">
                      <div className="alert alert-info py-2 mb-0" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-lock-fill me-2"></i>
                        This is a demo UI. No real card processing occurs.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div className="form-section">
                <h3>Order Notes (Optional)</h3>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for delivery..."
                ></textarea>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="col-lg-5">
            <div className="checkout-summary">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-image">
                      {item.image_url || item.images?.[0] ? (
                        <img src={item.image_url || item.images[0]} alt={item.title} />
                      ) : (
                        <i className="bi bi-image"></i>
                      )}
                    </div>
                    <div className="summary-item-details">
                      <div className="summary-item-title">{item.title}</div>
                      <div className="summary-item-quantity">Qty: {item.quantity}</div>
                    </div>
                    <div className="summary-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg w-100"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
