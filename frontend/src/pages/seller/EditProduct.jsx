import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productAPI from '../../api/product.api';
import { useToast } from '../../contexts/ToastContext';
import ProductForm from '../../components/products/ProductForm';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getProductById(id);
      setProduct(data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load product';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await productAPI.updateProduct(id, formData);
      
      showToast('Product updated successfully!', 'success');
      navigate('/seller/products');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update product';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-product-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="edit-product-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Product</h2>
            <p>{error || 'Product not found'}</p>
            <button 
              onClick={() => navigate('/seller/products')}
              className="btn-back-to-list"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="container">
        <div className="page-header">
          <div>
            <button 
              onClick={() => navigate('/seller/products')}
              className="btn-back"
            >
              ← Back
            </button>
            <h1>Edit Product</h1>
            <p className="page-subtitle">Update product details</p>
          </div>
        </div>

        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          submitLabel="Update Product"
          loading={submitting}
        />
      </div>
    </div>
  );
};

export default EditProduct;
