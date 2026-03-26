import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productAPI from '../../api/product.api';
import { useToast } from '../../contexts/ToastContext';
import ProductForm from '../../components/products/ProductForm';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await productAPI.createProduct(formData);

      showToast('Product listed successfully!', 'success');
      navigate('/seller/products');
    } catch (err) {
      // client.js converts all errors to plain Error objects, so use err.message
      const errorMsg = err.message || 'Failed to create product';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="container">
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate('/seller/products')}
              className="btn-back"
            >
              ← Back
            </button>
            <h1>Add New Product</h1>
            <p className="page-subtitle">List a new item for sale</p>
          </div>
        </div>

        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="List Product"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AddProduct;
