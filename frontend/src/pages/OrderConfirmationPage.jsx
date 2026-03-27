/**
 * Order Confirmation Page
 * Displayed after a successful checkout at /orders/:id
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaBoxOpen, FaShoppingBag } from 'react-icons/fa';
import orderAPI from '../api/order.api';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getOrderById(id);
        setOrder(response.data);
      } catch (err) {
        setError(err.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Loading order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/browse" className="btn btn-primary">Continue Shopping</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '700px' }}>
      {/* Success Header */}
      <div className="text-center mb-4">
        <FaCheckCircle size={64} className="text-success mb-3" />
        <h2 className="fw-bold">Order Placed Successfully!</h2>
        <p className="text-muted">
          Thank you for your order. We'll notify you when it ships.
        </p>
      </div>

      {/* Order Summary Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Order #{order?.order_number || id}</h5>
              <small className="text-muted">
                {order?.created_at
                  ? new Date(order.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </small>
            </div>
            <Badge bg={statusColors[order?.status] || 'secondary'} className="text-capitalize fs-6">
              {order?.status || 'pending'}
            </Badge>
          </div>

          {/* Order Items */}
          {order?.OrderItems?.length > 0 && (
            <div className="mb-3">
              <h6 className="text-muted mb-2">
                <FaBoxOpen className="me-2" />
                Items
              </h6>
              {order.OrderItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <div>
                    <span>{item.Product?.title || `Product #${item.product_id}`}</span>
                    <small className="text-muted ms-2">x{item.quantity}</small>
                  </div>
                  <span className="fw-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <Row className="mt-3">
            <Col>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Method</span>
                <span className="text-capitalize">{order?.payment_method || 'COD'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Shipping To</span>
                <span style={{ maxWidth: '55%', textAlign: 'right' }}>{order?.shipping_address}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order?.total_amount || 0)}</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="d-flex gap-3 justify-content-center">
        <Link to="/browse" className="btn btn-primary">
          <FaShoppingBag className="me-2" />
          Continue Shopping
        </Link>
        <Link to="/buyer/dashboard" className="btn btn-outline-secondary">
          View My Orders
        </Link>
      </div>
    </Container>
  );
};

export default OrderConfirmationPage;
