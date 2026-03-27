/**
 * Help Page
 * FAQ and support information
 */

import { useState } from 'react';

const faqs = [
  {
    category: 'Buying',
    items: [
      { q: 'How do I buy a product?', a: 'Browse products on the Products page, add items to your cart, then proceed to checkout and fill in your shipping details.' },
      { q: 'What payment methods are accepted?', a: 'We currently support Cash on Delivery (COD) and Credit/Debit Card payments.' },
      { q: 'How do I track my order?', a: 'Go to your Buyer Dashboard to view all your orders and their current status.' },
      { q: 'Can I cancel an order?', a: 'Yes, you can cancel an order from your Buyer Dashboard as long as it has not been shipped yet.' },
    ]
  },
  {
    category: 'Selling',
    items: [
      { q: 'How do I list a product for sale?', a: 'Go to your Seller Dashboard → My Products → Add Product. Fill in the product details and submit.' },
      { q: 'Do I need approval to sell?', a: 'Yes, your seller account must be approved by an admin before your products appear publicly.' },
      { q: 'How do I manage my product listings?', a: 'Visit Seller Dashboard → My Products to view, edit, or remove your listings.' },
    ]
  },
  {
    category: 'Swapping',
    items: [
      { q: 'How does swapping work?', a: 'Browse the Swap Marketplace, find an item you want, and send a swap request offering one of your own items in exchange.' },
      { q: 'Can I cancel a swap request?', a: 'Yes, you can cancel a pending swap request from My Swaps in your dashboard.' },
    ]
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I update my profile?', a: 'Click your avatar in the top navbar and go to Profile, or navigate to /profile directly.' },
      { q: 'I forgot my password. What do I do?', a: 'Use the "Forgot Password" option on the login page to reset your password via email.' },
      { q: 'How do I change my role (e.g. become a seller)?', a: 'Contact the admin through the platform. Role upgrades require admin approval.' },
    ]
  },
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (key) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <h2 className="mb-1">
        <i className="bi bi-question-circle me-2"></i>
        Help & FAQ
      </h2>
      <p className="text-muted mb-4">Find answers to common questions about ShareHub.</p>

      {faqs.map((section) => (
        <div key={section.category} className="mb-4">
          <h5 className="fw-bold text-primary mb-3">{section.category}</h5>
          <div className="card border-0 shadow-sm">
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = openIndex === key;
              return (
                <div key={key} className="border-bottom last-border-0">
                  <button
                    className="w-100 text-start px-4 py-3 bg-white border-0 d-flex justify-content-between align-items-center"
                    onClick={() => toggle(key)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="fw-semibold">{item.q}</span>
                    <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-muted">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Contact Support */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body text-center py-4">
          <i className="bi bi-envelope-at fs-1 text-primary mb-3 d-block"></i>
          <h5>Still need help?</h5>
          <p className="text-muted">Reach out to our support team and we'll get back to you.</p>
          <a href="/contact" className="btn btn-primary">
            <i className="bi bi-chat-dots me-2"></i>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
