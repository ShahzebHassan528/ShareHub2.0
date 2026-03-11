import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { FaShoppingBag, FaTrash } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function Cart() {
  // Placeholder cart items
  const cartItems = [];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="py-5 flex-grow-1">
        <h1 className="mb-4">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="border-0 shadow-sm text-center p-5">
            <Card.Body>
              <div className="mb-4">
                <span style={{ fontSize: '80px' }}>🛒</span>
              </div>
              <h3 className="mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">
                Start shopping and add items to your cart!
              </p>
              <Button as={Link} to="/browse" variant="primary" size="lg">
                <FaShoppingBag className="me-2" />
                Browse Products
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>${item.price}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <Button variant="outline-danger" size="sm">
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-4">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>$10.00</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong>Total:</strong>
                    <strong className="text-primary">${(total + 10).toFixed(2)}</strong>
                  </div>
                  <Button variant="primary" className="w-100 mb-2" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button as={Link} to="/browse" variant="outline-primary" className="w-100">
                    Continue Shopping
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
}

export default Cart;
