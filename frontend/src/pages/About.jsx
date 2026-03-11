import { Container, Row, Col, Card } from 'react-bootstrap';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="py-5 flex-grow-1">
        <Row className="justify-content-center">
          <Col lg={10}>
            <h1 className="text-center mb-5">About Us</h1>
            
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-5">
                <h3 className="mb-4">Our Mission</h3>
                <p className="lead text-muted">
                  We are dedicated to creating a sustainable marketplace where people can buy, sell, 
                  donate, and swap products with ease. Our platform connects buyers, sellers, and NGOs 
                  to create a positive impact on communities.
                </p>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-5">
                <h3 className="mb-4">What We Do</h3>
                <ul className="lead text-muted">
                  <li className="mb-2">Connect verified sellers with customers</li>
                  <li className="mb-2">Enable product donations to verified NGOs</li>
                  <li className="mb-2">Facilitate product swaps between users</li>
                  <li className="mb-2">Ensure secure and transparent transactions</li>
                </ul>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <h3 className="mb-4">Our Values</h3>
                <Row>
                  <Col md={6} className="mb-3">
                    <h5>Trust</h5>
                    <p className="text-muted">We verify all sellers and NGOs to ensure authenticity.</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h5>Community</h5>
                    <p className="text-muted">Building connections that make a difference.</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h5>Sustainability</h5>
                    <p className="text-muted">Promoting reuse and reducing waste.</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h5>Impact</h5>
                    <p className="text-muted">Creating positive change through giving.</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}

export default About;
