import { useState } from 'react';
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
    quantity: initialData.quantity || 1,
  });

  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 1,
      });
    }
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
        <label htmlFor="image_url">Image URL</label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
        />
        <span className="field-hint">Optional: Provide a URL to your product image</span>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
