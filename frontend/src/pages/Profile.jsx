/**
 * Profile Management Page
 * Complete profile with tabs for Products, Swaps, and Donations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyProfile, updateMyProfile, uploadProfileImage } from '../api/user.api';
import productAPI from '../api/product.api';
import swapAPI from '../api/swap.api';
import donationAPI from '../api/donation.api';
import { useToast } from '../contexts/ToastContext';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    profile_image: ''
  });
  
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Tab data states
  const [products, setProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [donations, setDonations] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab !== 'profile') {
      fetchTabData();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      const profileData = data.data || data.profile || data;
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        profile_image: profileData.profile_image || ''
      });
      setImagePreview(profileData.profile_image);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      setTabLoading(true);
      
      if (activeTab === 'products') {
        const response = await productAPI.getMyProducts();
        setProducts(response.products || response.data || []);
      } else if (activeTab === 'swaps') {
        const response = await swapAPI.getMySwaps();
        setSwaps(response.swaps || response.data || []);
      } else if (activeTab === 'donations') {
        const response = await donationAPI.getMyDonations();
        setDonations(response.donations || response.data || []);
      }
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
      toast.error(err.message || `Failed to load ${activeTab}`);
    } finally {
      setTabLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'profile_image') {
      setImagePreview(value || null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file));

    try {
      setAvatarUploading(true);
      const form = new FormData();
      form.append('profile_avatar', file);
      const data = await uploadProfileImage(form);
      const url = data.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, profile_image: url }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
      setImagePreview(profile?.profile_image || null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const data = await updateMyProfile(formData);
      const updatedProfile = data.data || data.profile || data;
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      profile_image: profile.profile_image || ''
    });
    setImagePreview(profile.profile_image);
    setErrors({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container py-4">
          <div className="profile-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container py-4">
          <div className="alert alert-danger">
            Failed to load profile
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container py-4">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {imagePreview ? (
              <img src={imagePreview} alt={profile.full_name} />
            ) : (
              <div className="avatar-placeholder-large">
                {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{profile.full_name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-badges">
              <span className={`role-badge role-${profile.role}`}>
                {profile.role.toUpperCase()}
              </span>
              {profile.is_verified && (
                <span className="verified-badge">
                  <i className="bi bi-check-circle-fill"></i>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="bi bi-person"></i>
            Profile Info
          </button>
          <button
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="bi bi-box"></i>
            My Products
          </button>
          <button
            className={`tab-button ${activeTab === 'swaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('swaps')}
          >
            <i className="bi bi-arrow-left-right"></i>
            My Swaps
          </button>
          <button
            className={`tab-button ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            <i className="bi bi-heart"></i>
            My Donations
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-info-tab">
              <div className="tab-header">
                <h2>Profile Information</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                    <i className="bi bi-pencil"></i>
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="full_name">Full Name *</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                          placeholder="Enter your full name"
                        />
                        {errors.full_name && (
                          <div className="invalid-feedback">{errors.full_name}</div>
                        )}
                      </>
                    ) : (
                      <p className="form-value">{profile.full_name}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <p className="form-value form-readonly">
                      {profile.email}
                      <span className="readonly-badge">Read-only</span>
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                      </>
                    ) : (
                      <p className="form-value">
                        {profile.phone || <span className="text-muted">Not provided</span>}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <p className="form-value">
                      <span className={`role-badge role-${profile.role}`}>
                        {profile.role.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    {isEditing ? (
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your address"
                        rows="3"
                      />
                    ) : (
                      <p className="form-value">
                        {profile.address || <span className="text-muted">Not provided</span>}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="form-group full-width">
                      <label>Profile Photo</label>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ flexShrink: 0 }}>
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #dee2e6' }}
                            />
                          ) : (
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600 }}>
                              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="avatar_upload"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                          />
                          <label
                            htmlFor="avatar_upload"
                            className="btn btn-outline-secondary btn-sm"
                            style={{ cursor: avatarUploading ? 'not-allowed' : 'pointer' }}
                          >
                            {avatarUploading ? (
                              <><span className="spinner-border spinner-border-sm me-1" />Uploading...</>
                            ) : (
                              <><i className="bi bi-upload me-1" />Upload Photo</>
                            )}
                          </label>
                          <small className="d-block text-muted mt-1">
                            JPG, PNG, WEBP · max 5 MB
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Account Status</label>
                    <p className="form-value">
                      <span className={`status-badge ${profile.is_active ? 'status-active' : 'status-inactive'}`}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Member Since</label>
                    <p className="form-value">{formatDate(profile.created_at)}</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="tab-header">
                <h2>My Products</h2>
                <Link to="/seller/products/add" className="btn btn-primary">
                  <i className="bi bi-plus-lg"></i>
                  Add Product
                </Link>
              </div>

              {tabLoading ? (
                <div className="tab-loading">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-box"></i>
                  <h3>No Products Yet</h3>
                  <p>You haven't listed any products</p>
                  <Link to="/seller/products/add" className="btn btn-primary">
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="items-grid">
                  {products.map((product) => (
                    <div key={product.id} className="item-card">
                      <div className="item-image">
                        {product.image_url || product.images?.[0] ? (
                          <img src={product.image_url || product.images[0]} alt={product.title} />
                        ) : (
                          <div className="item-no-image">
                            <i className="bi bi-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="item-info">
                        <h4>{product.title}</h4>
                        <p className="item-price">{formatPrice(product.price)}</p>
                        <div className="item-meta">
                          <span className="item-condition">{product.condition}</span>
                          <span className={`item-status ${product.availability_status === 'available' ? 'status-available' : ''}`}>
                            {product.availability_status}
                          </span>
                        </div>
                        <div className="item-actions">
                          <Link to={`/products/${product.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                          <Link to={`/seller/products/edit/${product.id}`} className="btn btn-sm btn-primary">
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="swaps-tab">
              <div className="tab-header">
                <h2>My Swap Requests</h2>
                <Link to="/swaps/my" className="btn btn-outline-primary">
                  View All Swaps
                </Link>
              </div>

              {tabLoading ? (
                <div className="tab-loading">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : swaps.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-arrow-left-right"></i>
                  <h3>No Swap Requests</h3>
                  <p>You haven't made any swap requests yet</p>
                  <Link to="/products" className="btn btn-primary">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="swaps-list">
                  {swaps.slice(0, 5).map((swap) => (
                    <div key={swap.id} className="swap-item">
                      <div className="swap-products">
                        <div className="swap-product">
                          <img src={swap.offered_product?.image_url || '/placeholder.png'} alt="Your item" />
                          <div>
                            <p className="swap-label">Your Item</p>
                            <p className="swap-title">{swap.offered_product?.title}</p>
                          </div>
                        </div>
                        <div className="swap-arrow">
                          <i className="bi bi-arrow-left-right"></i>
                        </div>
                        <div className="swap-product">
                          <img src={swap.requested_product?.image_url || '/placeholder.png'} alt="Requested item" />
                          <div>
                            <p className="swap-label">Requested Item</p>
                            <p className="swap-title">{swap.requested_product?.title}</p>
                          </div>
                        </div>
                      </div>
                      <div className="swap-status">
                        <span className={`status-badge status-${swap.status}`}>
                          {swap.status}
                        </span>
                        <span className="swap-date">{formatDate(swap.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="donations-tab">
              <div className="tab-header">
                <h2>My Donations</h2>
                <Link to="/donations/my" className="btn btn-outline-primary">
                  View All Donations
                </Link>
              </div>

              {tabLoading ? (
                <div className="tab-loading">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : donations.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-heart"></i>
                  <h3>No Donations Yet</h3>
                  <p>You haven't made any donations</p>
                  <Link to="/products" className="btn btn-primary">
                    Browse Products to Donate
                  </Link>
                </div>
              ) : (
                <div className="donations-list">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="donation-item">
                      <div className="donation-product">
                        <img src={donation.product?.image_url || '/placeholder.png'} alt={donation.product?.title} />
                        <div className="donation-info">
                          <h4>{donation.product?.title}</h4>
                          <p className="donation-ngo">
                            <i className="bi bi-building"></i>
                            {donation.ngo?.name}
                          </p>
                          {donation.message && (
                            <p className="donation-message">{donation.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="donation-meta">
                        <span className={`status-badge status-${donation.status}`}>
                          {donation.status}
                        </span>
                        <span className="donation-date">{formatDate(donation.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
