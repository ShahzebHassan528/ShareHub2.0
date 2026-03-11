import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DonationModal from './DonationModal';
import './DonateButton.css';

const DonateButton = ({ product }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show button if user is not logged in
  if (!isAuthenticated) {
    return null;
  }

  // Don't show button if user is the owner of the product
  if (user && product && product.seller_id === user.id) {
    return null;
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button 
        className="donate-button"
        onClick={handleClick}
      >
        <i className="bi bi-heart-fill"></i>
        Donate Item
      </button>

      <DonationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
};

export default DonateButton;
