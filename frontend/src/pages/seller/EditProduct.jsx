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
      // FIX: backend returns { success, data: product }
      // client.js unwraps response.data, so data = { success, data: product }
      // We need data.data to get the actual product object
      setProduct(data.data);
    } catch (err) {
      // client.js converts errors to plain Error objects — use err.message
      const errorMsg = err.message || 'Failed to load product';
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
      navigate('/products/my');
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error');
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
              onClick={() => navigate('/products/my')}
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
              onClick={() => navigate('/products/my')}
              className="btn-back"
            >
              ← Back
            </button>
            <h1>Edit Product</h1>
            <p className="page-subtitle">Update product details</p>
          </div>
        </div>

        {/* product is now the actual product object with product_condition etc. */}
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
