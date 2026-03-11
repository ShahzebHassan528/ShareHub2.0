import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Navbar } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaClock, FaSignOutAlt } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log("DASHBOARD USER:", parsedUser);
    console.log("ROLE:", parsedUser?.role);
    console.log("PERMISSIONS:", parsedUser?.permissions);
    
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) return null;

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'danger',
      seller: 'warning',
      buyer: 'primary',
      ngo: 'success'
    };
    return badges[role] || 'secondary';
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <FaShieldAlt /> : <FaUser />;
  };

  return (
    <>
      <Navbar bg="white" className="shadow-sm mb-0">
        <Container>
          <Navbar.Brand className="fw-bold text-primary">
            <span className="me-2">🛒</span>
            Marketplace
          </Navbar.Brand>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
        </Container>
      </Navbar>

      <div className="dashboard-gradient-bg">
        <Container className="py-5 fade-in">
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div 
                      className="rounded-circle p-3 me-3"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <FaUser size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1">Welcome, {user.full_name}!</h3>
                      <Badge bg={getRoleBadge(user.role)} className="text-uppercase">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <hr />

                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <strong>{user.email}</strong>
                        </div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="d-flex align-items-center">
                        {user.is_verified ? (
                          <FaCheckCircle className="text-success me-2" />
                        ) : (
                          <FaClock className="text-warning me-2" />
                        )}
                        <div>
                          <small className="text-muted d-block">Status</small>
                          <strong>
                            {user.is_verified ? 'Verified' : 'Pending Verification'}
                          </strong>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {user.role === 'buyer' && (
                <Card className="shadow-sm border-0 border-start border-primary border-4">
                  <Card.Body className="p-4">
                    <h5 className="text-primary mb-3">Customer Dashboard</h5>
                    <p className="text-muted mb-0">
                      Browse products, make purchases, swap items with other customers, and donate to NGOs.
                    </p>
                  </Card.Body>
                </Card>
              )}

              {user.role === 'seller' && (
                <Card className="shadow-sm border-0 border-start border-warning border-4">
                  <Card.Body className="p-4">
                    <h5 className="text-warning mb-3">Seller Dashboard</h5>
                    {!user.is_verified ? (
                      <div className="alert alert-warning mb-0">
                        <strong>⏳ Pending Approval:</strong> Your seller account is awaiting admin approval. 
                        You'll be able to list products once approved.
                      </div>
                    ) : (
                      <p className="text-muted mb-0">
                        Your seller account is approved! You can now list and manage your products.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {user.role === 'ngo' && (
                <Card className="shadow-sm border-0 border-start border-success border-4">
                  <Card.Body className="p-4">
                    <h5 className="text-success mb-3">NGO Dashboard</h5>
                    {!user.is_verified ? (
                      <div className="alert alert-info mb-0">
                        <strong>⏳ Pending Verification:</strong> Your NGO is under verification. 
                        You'll be able to receive donations once verified.
                      </div>
                    ) : (
                      <p className="text-muted mb-0">
                        Your NGO is verified! You can now receive and manage donations.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {user.role === 'admin' && (
                <Card className="shadow-sm border-0 border-start border-danger border-4">
                  <Card.Body className="p-4">
                    <h5 className="text-danger mb-3">Admin Dashboard</h5>
                    <p className="text-muted mb-0">
                      Manage sellers, verify NGOs, monitor products, and oversee all platform activities.
                    </p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Dashboard;
