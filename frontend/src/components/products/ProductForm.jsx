import { useState } from 'react';
import apiClient from '../../api/client';
import LocationPicker from '../common/LocationPicker';
import './ProductForm.css';

const ProductForm = ({ initialData = {}, onSubmit, submitLabel = 'Submit', loading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || '',
    // FIX: field name must match DB column 'product_condition'
    product_condition: initialData.product_condition || 'good',
    image_url: initialData.image_url || '',
    location: initialData.location || '',
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
    address: initialData.address || '',
    quantity: initialData.quantity || 1,
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.image_url || '');
  const [uploading, setUploading] = useState(false);

  // FIX: enum values must match DB ENUM('new','like_new','good','fair','poor')
  const conditions = [
    { value: 'new',      label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good',     label: 'Good' },
    { value: 'fair',     label: 'Fair' },
    { value: 'poor',     label: 'Poor' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear URL field when file is chosen
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const data = new FormData();
    data.append('product_images', imageFile);
    setUploading(true);
    try {
      const response = await apiClient.post('/v1/upload/product-images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.images?.[0] || null;
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    console.log('🔍 Validating form...');
    console.log('Title:', formData.title);
    console.log('Description:', formData.description);
    console.log('Price:', formData.price);
    console.log('Location:', formData.location);

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      console.log('❌ Title validation failed');
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
      console.log('❌ Title too short');
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      console.log('❌ Description validation failed');
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      console.log('❌ Description too short');
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
      console.log('❌ Price validation failed');
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
      console.log('❌ Price invalid');
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      console.log('❌ Location validation failed');
    }

    // Temporarily make lat/lng optional for testing
    console.log('Latitude:', formData.latitude);
    console.log('Longitude:', formData.longitude);

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Validation result:', isValid ? '✅ PASS' : '❌ FAIL');
    console.log('Errors:', newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Form submitted!');
    console.log('📝 Form data:', formData);
    
    if (!validate()) {
      console.log('❌ Validation failed:', errors);
      return;
    }

    console.log('✅ Validation passed');

    let finalImageUrl = formData.image_url;
    if (imageFile) {
      console.log('📤 Uploading image file...');
      try {
        const uploaded = await uploadImage();
        if (uploaded) {
          finalImageUrl = uploaded;
          console.log('✅ Image uploaded:', finalImageUrl);
        }
      } catch (err) {
        console.error('❌ Image upload failed:', err);
        // Proceed without image rather than blocking product creation
        finalImageUrl = null;
      }
    }

    const productPayload = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      image_url: finalImageUrl,
    };

    console.log('📦 Sending product data:', productPayload);
    onSubmit(productPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label htmlFor="title">
          Product Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., iPhone 13 Pro Max"
          className={errors.title ? 'error' : ''}
          disabled={loading}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your product..."
          rows="4"
          className={errors.description ? 'error' : ''}
          disabled={loading}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">
            Price (Rs.) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
            className={errors.price ? 'error' : ''}
            disabled={loading}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">
            Quantity <span className="required">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="1"
            min="1"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        {/* FIX: name is 'product_condition' to match DB column */}
        <div className="form-group">
          <label htmlFor="product_condition">
            Condition <span className="required">*</span>
          </label>
          <select
            id="product_condition"
            name="product_condition"
            value={formData.product_condition}
            onChange={handleChange}
            disabled={loading}
          >
            {conditions.map(cond => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location <span className="required">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Karachi, Pakistan"
            className={errors.location ? 'error' : ''}
            disabled={loading}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>
          Pick Location on Map <span className="text-muted">(Optional)</span>
        </label>
        <LocationPicker
          onLocationSelect={(location) => {
            setFormData(prev => ({
              ...prev,
              latitude: location.lat,
              longitude: location.lng,
              address: location.address,
              location: location.address.split(',')[0] || prev.location
            }));
          }}
          initialPosition={
            formData.latitude && formData.longitude
              ? { lat: formData.latitude, lng: formData.longitude }
              : null
          }
        />
        {formData.address && (
          <small className="text-muted mt-2 d-block">
            Selected: {formData.address}
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading || uploading}
          className="form-control mb-2"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxHeight: '120px', objectFit: 'contain', marginBottom: '8px', display: 'block' }}
          />
        )}
        <span className="field-hint">Or enter an image URL instead:</span>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={(e) => {
            handleChange(e);
            if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); }
          }}
          placeholder="https://example.com/image.jpg"
          disabled={loading || uploading || !!imageFile}
          className="mt-1"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading || uploading}
          onClick={(e) => {
            console.log('🖱️ Button clicked!');
            console.log('Form element:', e.target.form);
          }}
        >
          {uploading ? 'Uploading image...' : loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
