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
    console.log('🚀 AddProduct handleSubmit called');
    console.log('📦 Received form data:', formData);
    
    try {
      setLoading(true);
      console.log('📤 Calling productAPI.createProduct...');
      
      const response = await productAPI.createProduct(formData);
      console.log('✅ Product created successfully:', response);

      showToast('Product listed successfully!', 'success');
      navigate('/products/my');
    } catch (err) {
      console.error('❌ Error creating product:', err);
      // client.js converts all errors to plain Error objects, so use err.message
      const errorMsg = err.message || 'Failed to create product';
      console.log('❌ Error message:', errorMsg);
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
              onClick={() => navigate('/products/my')}
              className="btn-back"
            >
              ← Back
            </button>
            <h1>Add New Product</h1>
            <p className="page-subtitle">List a new item for sale</p>
          </div>
        </div>

        {/* DEBUG: Direct API Test Button */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>🔧 Debug Test</h3>
          <button
            onClick={async () => {
              console.log('🧪 Testing direct API call...');
              const testData = {
                title: "Test iPhone",
                description: "This is a test product to debug the issue",
                price: 100000,
                quantity: 1,
                product_condition: "good",
                location: "Lahore",
                latitude: 31.5204,
                longitude: 74.3587,
                address: "Lahore, Pakistan"
              };
              
              try {
                console.log('📤 Sending test data:', testData);
                const response = await productAPI.createProduct(testData);
                console.log('✅ Success:', response);
                alert('✅ Product created successfully! Check console for details.');
                showToast('Test product created!', 'success');
              } catch (err) {
                console.error('❌ Error:', err);
                alert('❌ Error: ' + err.message);
                showToast('Error: ' + err.message, 'error');
              }
            }}
            className="btn btn-warning"
            style={{ marginRight: '10px' }}
          >
            🧪 Test Direct API Call
          </button>
          <small style={{ display: 'block', marginTop: '10px', color: '#666' }}>
            Click this button to test if the API is working. Check browser console for logs.
          </small>
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
