import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productAPI from '../api/product.api';
import swapAPI from '../api/swap.api';
import donationAPI from '../api/donation.api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [swapItems, setSwapItems] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(true);
  const [ngoLoading, setNgoLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchSwapItems();
    fetchNGOs();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts({ limit: 8 });
      // Backend returns: { success: true, count: X, data: [...] }
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSwapItems = async () => {
    try {
      setSwapLoading(true);
      const response = await swapAPI.getAvailableSwaps({ limit: 5 });
      setSwapItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching swap items:', error);
      setSwapItems([]);
    } finally {
      setSwapLoading(false);
    }
  };

  const fetchNGOs = async () => {
    try {
      setNgoLoading(true);
      const response = await donationAPI.getVerifiedNGOs();
      setNgos(response.ngos || []);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      setNgos([]);
    } finally {
      setNgoLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const categories = [
    { id: 1, name: 'Electronics', icon: '💻', color: '#3b82f6' },
    { id: 2, name: 'Clothing', icon: '👜', color: '#ec4899' },
    { id: 3, name: 'Furniture', icon: '🪑', color: '#8b5cf6' },
    { id: 4, name: 'Books', icon: '📚', color: '#f59e0b' },
    { id: 5, name: 'Toys', icon: '🧸', color: '#10b981' },
  ];

  const staticNgos = [
    { id: 1, organization_name: 'Help Foundation', description: 'Supporting underprivileged children', verified: true },
    { id: 2, organization_name: 'Green Pakistan', description: 'Environmental conservation NGO', verified: true },
    { id: 3, organization_name: 'Health Care Foundation', description: 'Medical assistance and awareness', verified: true },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="landing-page">
      {/* HERO BANNER */}
      <section className="hero">
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Buy, Sell, Swap & Donate</h1>
            <h2>All in One Place</h2>
            
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search in ShareHub"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-search">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="category-card"
              >
                <div className="category-icon" style={{ backgroundColor: cat.color }}>
                  {cat.icon}
                </div>
                <p>{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUY NOW - PRODUCTS SECTION */}
      <section className="buy-section">
        <div className="container">
          <div className="buy-header">
            <h2>🛒 Buy Now</h2>
            <p>Great deals on quality products</p>
          </div>

          {loading ? (
            <div className="buy-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="buy-card">
                  <div className="skeleton-image"></div>
                  <div className="buy-info">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="buy-grid">
              {products.slice(0, 4).map((product, index) => {
                const gradients = [
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                ];
                
                const icons = ['💻', '👕', '📚', '🪑', '📱', '⌚', '🎮', '📷', '🎧', '⚽'];
                
                return (
                  <Link key={product.id} to={`/products/${product.id}`} className="buy-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="buy-image" style={{ background: gradients[index % gradients.length] }}>
                      {product.primary_image ? (
                        <img src={product.primary_image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="buy-icon">{icons[index % icons.length]}</div>
                      )}
                    </div>
                    <div className="buy-info">
                      <h3>{product.title}</h3>
                      <p className="buy-price">{formatPrice(product.price)}</p>
                      <div className="buy-footer">
                        <span className="buy-location">📍 {product.seller_name || 'Seller'}</span>
                        <span className="buy-btn">Buy Now</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="buy-grid">
              {[
                { icon: '📦', title: 'Gaming Laptop', price: 'PKR 85,000', location: 'Lahore', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { icon: '👕', title: 'Designer Shirt', price: 'PKR 3,500', location: 'Karachi', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                { icon: '📚', title: 'Book Collection', price: 'PKR 2,500', location: 'Islamabad', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                { icon: '🪑', title: 'Office Chair', price: 'PKR 15,000', location: 'Multan', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
              ].map((item, index) => (
                <Link key={index} to="/products" className="buy-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="buy-image" style={{ background: item.gradient }}>
                    <div className="buy-icon">{item.icon}</div>
                  </div>
                  <div className="buy-info">
                    <h3>{item.title}</h3>
                    <p className="buy-price">{item.price}</p>
                    <div className="buy-footer">
                      <span className="buy-location">📍 {item.location}</span>
                      <span className="buy-btn">Buy Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NGO SECTION */}
      <section className="ngo-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>❤️ Verified NGOs</h2>
              <p>Donate to trusted organizations</p>
            </div>
            <Link to="/ngos" className="see-more">View All →</Link>
          </div>
          
          {ngoLoading ? (
            <div className="ngos-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ngo-card">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ngos-grid">
              {(ngos.length > 0 ? ngos : staticNgos).slice(0, 3).map((ngo) => (
                <div key={ngo.id} className="ngo-card">
                  <h3>{ngo.ngo_name || ngo.organization_name || ngo.name}</h3>
                  <p>{ngo.description}</p>
                  <span className="verified">✓ Verified</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AVAILABLE FOR SWAP */}
      <section className="swap-section">
        <div className="container">
          <div className="swap-header">
            <h2>🔄 Available for Swap</h2>
            <p>Exchange items without spending money</p>
          </div>

          {swapLoading ? (
            <div className="swap-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="swap-card">
                  <div className="skeleton-image"></div>
                  <div className="swap-info">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : swapItems.length > 0 ? (
            <div className="swap-grid">
              {swapItems.slice(0, 5).map((item, index) => {
                const gradients = [
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                ];
                
                const icons = ['💻', '📷', '📱', '⌚', '🎮', '🎧', '📚', '👕', '🏀', '🎸'];
                
                return (
                  <div key={item.id} className="swap-card">
                    <div className="swap-image" style={{ background: gradients[index % gradients.length] }}>
                      {item.primary_image ? (
                        <img src={item.primary_image} alt={item.item_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="swap-icon">{icons[index % icons.length]}</div>
                      )}
                    </div>
                    <div className="swap-info">
                      <h3>{item.item_title || 'Swap Item'}</h3>
                      <p className="swap-desc">{item.description || 'Available for exchange'}</p>
                      <div className="swap-footer">
                        <span className="swap-location">📍 {item.owner_name || 'User'}</span>
                        <Link to="/swaps/explore" className="swap-btn">Swap Now</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="swap-grid">
              {[
                { icon: '💻', title: 'Gaming Laptop', desc: 'High performance laptop for gaming', location: 'Lahore', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { icon: '📷', title: 'DSLR Camera', desc: 'Professional camera with lens', location: 'Karachi', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                { icon: '📱', title: 'iPhone 12', desc: 'Excellent condition, 128GB', location: 'Islamabad', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                { icon: '⌚', title: 'Smart Watch', desc: 'Fitness tracker with GPS', location: 'Multan', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                { icon: '🎮', title: 'Gaming Console', desc: 'PlayStation 4 with controllers', location: 'Faisalabad', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
              ].map((item, index) => (
                <div key={index} className="swap-card">
                  <div className="swap-image" style={{ background: item.gradient }}>
                    <div className="swap-icon">{item.icon}</div>
                  </div>
                  <div className="swap-info">
                    <h3>{item.title}</h3>
                    <p className="swap-desc">{item.desc}</p>
                    <div className="swap-footer">
                      <span className="swap-location">📍 {item.location}</span>
                      <Link to="/swaps/explore" className="swap-btn">Swap Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Us</h2>
          <p className="subtitle">Three powerful ways to trade</p>
          
          <div className="features-grid">
            <div className="feature-card sell">
              <div className="card-icon">💰</div>
              <h3>Sell & Earn</h3>
              <p>Turn your unused items into cash. List products in minutes.</p>
              <ul className="features-list">
                <li>✓ Easy listing</li>
                <li>✓ Secure payments</li>
                <li>✓ Wide reach</li>
              </ul>
              <Link to="/seller/products/add" className="btn btn-sell">
                Start Selling →
              </Link>
            </div>

            <div className="feature-card donate">
              <div className="card-icon">❤️</div>
              <h3>Donate & Help</h3>
              <p>Make a difference by donating to verified NGOs.</p>
              <ul className="features-list">
                <li>✓ Verified NGOs</li>
                <li>✓ Direct impact</li>
                <li>✓ Tax benefits</li>
              </ul>
              <Link to="/ngos" className="btn btn-donate">
                Donate Now →
              </Link>
            </div>

            <div className="feature-card swap">
              <div className="card-icon">🔄</div>
              <h3>Swap & Exchange</h3>
              <p>Trade items without spending money.</p>
              <ul className="features-list">
                <li>✓ No money needed</li>
                <li>✓ Fair exchange</li>
                <li>✓ Eco-friendly</li>
              </ul>
              <Link to="/swaps/explore" className="btn btn-swap">
                Explore Swaps →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
