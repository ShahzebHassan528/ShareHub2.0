import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, ButtonGroup, ProgressBar } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaMapMarkerAlt, FaIdCard, FaGlobe, FaUserPlus, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../config/roles';

function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    business_name: '',
    business_address: '',
    business_license: '',
    tax_id: '',
    ngo_name: '',
    registration_number: '',
    address: '',
    website: '',
    description: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate password on change
    if (name === 'password') {
      setPasswordValidation({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(v => v === true);
  };

  const getPasswordStrength = () => {
    const validCount = Object.values(passwordValidation).filter(v => v).length;
    return (validCount / 5) * 100;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 40) return 'danger';
    if (strength < 80) return 'warning';
    return 'success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid()) {
      setError('Please meet all password requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/v1';
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Reload to update auth context, then redirect to home
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }) => (
    isValid ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />
  );

  return (
    <div className="auth-gradient-bg min-vh-100 py-5 fade-in">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex p-3 mb-3">
                    <FaUserPlus size={32} className="text-white" />
                  </div>
                  <h2 className="fw-bold">Create Account</h2>
                  <p className="text-muted">Join our marketplace today</p>
                </div>

                <div className="mb-4">
                  <p className="text-center fw-semibold mb-3">Select Account Type</p>
                  <ButtonGroup className="w-100">
                    <Button
                      variant={role === 'buyer' ? 'primary' : 'outline-primary'}
                      onClick={() => setRole('buyer')}
                      className="py-2"
                    >
                      Customer
                    </Button>
                    <Button
                      variant={role === 'seller' ? 'primary' : 'outline-primary'}
                      onClick={() => setRole('seller')}
                      className="py-2"
                    >
                      Seller
                    </Button>
                    <Button
                      variant={role === 'ngo' ? 'primary' : 'outline-primary'}
                      onClick={() => setRole('ngo')}
                      className="py-2"
                    >
                      NGO
                    </Button>
                  </ButtonGroup>
                </div>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaUser /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="full_name"
                            placeholder="Enter your name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaPhone /></InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaLock /></InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ borderLeft: 'none' }}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaLock /></InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ borderLeft: 'none' }}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {formData.password && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Password Strength</small>
                        <small className={`text-${getPasswordStrengthColor()}`}>
                          {getPasswordStrength() < 40 ? 'Weak' : getPasswordStrength() < 80 ? 'Medium' : 'Strong'}
                        </small>
                      </div>
                      <ProgressBar 
                        now={getPasswordStrength()} 
                        variant={getPasswordStrengthColor()}
                        style={{ height: '5px' }}
                      />
                      <div className="mt-2">
                        <small className="d-block">
                          <ValidationIcon isValid={passwordValidation.minLength} /> At least 8 characters
                        </small>
                        <small className="d-block">
                          <ValidationIcon isValid={passwordValidation.hasUpperCase} /> One uppercase letter
                        </small>
                        <small className="d-block">
                          <ValidationIcon isValid={passwordValidation.hasLowerCase} /> One lowercase letter
                        </small>
                        <small className="d-block">
                          <ValidationIcon isValid={passwordValidation.hasNumber} /> One number
                        </small>
                        <small className="d-block">
                          <ValidationIcon isValid={passwordValidation.hasSpecialChar} /> One special character (!@#$%^&*)
                        </small>
                      </div>
                    </div>
                  )}

                  {role === 'seller' && (
                    <>
                      <hr className="my-4" />
                      <h5 className="mb-3 text-primary">Business Information</h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Business Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaBuilding /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="business_name"
                            placeholder="Enter business name"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Business Address</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="business_address"
                            placeholder="Enter business address"
                            value={formData.business_address}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Business License (Optional)</Form.Label>
                            <InputGroup>
                              <InputGroup.Text><FaIdCard /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="business_license"
                                placeholder="License number"
                                value={formData.business_license}
                                onChange={handleChange}
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Tax ID (Optional)</Form.Label>
                            <InputGroup>
                              <InputGroup.Text><FaIdCard /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="tax_id"
                                placeholder="Tax ID"
                                value={formData.tax_id}
                                onChange={handleChange}
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  {role === 'ngo' && (
                    <>
                      <hr className="my-4" />
                      <h5 className="mb-3 text-primary">NGO Information</h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>NGO Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaBuilding /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="ngo_name"
                            placeholder="Enter NGO name"
                            value={formData.ngo_name}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Registration Number</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaIdCard /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="registration_number"
                            placeholder="NGO registration number"
                            value={formData.registration_number}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="address"
                            placeholder="Enter NGO address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Website (Optional)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaGlobe /></InputGroup.Text>
                          <Form.Control
                            type="url"
                            name="website"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={handleChange}
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          placeholder="Tell us about your NGO"
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold mt-3"
                    disabled={loading || !isPasswordValid()}
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Form>

                <hr className="my-4" />

                <p className="text-center text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-primary fw-semibold text-decoration-none">
                    Sign In
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignUp;

