import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeftRight, MapPin, Shield, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import heroImage from '../assets/hero-illustration.jpg';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

/* ─── Landing Navbar ─────────────────────────────────────────── */
const LandingNavbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        {/* Logo */}
        <Link to="/" className="lp-logo">ShareHub</Link>

        {/* Desktop nav links */}
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#categories" className="lp-nav-link">Categories</a>
          <a href="#how-it-works" className="lp-nav-link">How It Works</a>
          <a href="#ngos" className="lp-nav-link">NGOs</a>
        </div>

        {/* Right section */}
        <div className="lp-nav-right">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="lp-btn-ghost">Dashboard</Link>
              <Link to="/products" className="lp-btn-solid">Browse Items</Link>
            </>
          ) : (
            <>
              <div className="lp-role-btns">
                <Link to="/signup?role=ngo" className="lp-role-btn">NGO</Link>
                <Link to="/signup?role=seller" className="lp-role-btn">Seller</Link>
                <Link to="/signup?role=user" className="lp-role-btn">User</Link>
              </div>
              <Link to="/login" className="lp-btn-ghost">Log In</Link>
              <Link to="/signup" className="lp-btn-solid">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lp-mobile-menu">
          <a href="#features" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#categories" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>Categories</a>
          <a href="#how-it-works" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#ngos" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>NGOs</a>
          <div className="lp-mobile-actions">
            <Link to="/login" className="lp-btn-ghost w-full">Log In</Link>
            <Link to="/signup" className="lp-btn-solid w-full">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ─── Hero ───────────────────────────────────────────────────── */
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="lp-hero">
      <div className="lp-container lp-hero-inner">
        {/* Left */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="lp-hero-text"
        >
          <motion.span custom={0} variants={fadeUp} className="lp-badge">
            Community-Powered Sharing
          </motion.span>
          <motion.h1 custom={1} variants={fadeUp} className="lp-hero-heading">
            Share More,{' '}
            <span className="lp-green">Waste Less</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} className="lp-hero-desc">
            Sell, donate, or swap clothes, books, and rations with your community.
            Build connections while reducing waste and supporting those in need.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="lp-hero-btns">
            <Link to="/signup" className="lp-btn-solid lp-btn-lg">Start Sharing</Link>
            <Link to="/products" className="lp-btn-outline lp-btn-lg">Browse Items</Link>
          </motion.div>
          <motion.div custom={4} variants={fadeUp} className="lp-stats">
            {[
              { label: 'Active Users', value: '2K+' },
              { label: 'Items Shared', value: '10K+' },
              { label: 'NGOs Partnered', value: '50+' },
            ].map((s) => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right – illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lp-hero-img-wrap"
        >
          <img
            src={heroImage}
            alt="Community members sharing items"
            className="lp-hero-img"
          />
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Features ───────────────────────────────────────────────── */
const features = [
  { Icon: ShoppingBag, title: 'Sell Items',        desc: 'List your unused items at fair prices and connect with local buyers easily.' },
  { Icon: Heart,       title: 'Donate Goods',      desc: 'Give to individuals or verified NGOs. Every donation creates a ripple of kindness.' },
  { Icon: ArrowLeftRight, title: 'Swap & Exchange', desc: 'Trade items you no longer need for something you do. Zero cost, maximum value.' },
  { Icon: MapPin,      title: 'Location Search',   desc: 'Find items and people nearby using integrated map-based search.' },
  { Icon: Shield,      title: 'Verified NGOs',     desc: 'Partner organizations are verified to ensure your donations reach the right hands.' },
  { Icon: Users,       title: 'Community First',   desc: 'Build connections in your neighborhood while promoting sustainable living.' },
];

const Features = () => (
  <section id="features" className="lp-section lp-section-card">
    <div className="lp-container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="lp-section-header"
      >
        <motion.h2 custom={0} variants={fadeUp} className="lp-section-title">
          Everything You Need to Share
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="lp-section-sub">
          A complete platform for selling, donating, and swapping items within your community.
        </motion.p>
      </motion.div>

      <div className="lp-features-grid">
        {features.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="lp-feature-card"
          >
            <div className="lp-feature-icon">
              <Icon size={24} />
            </div>
            <h3 className="lp-feature-title">{title}</h3>
            <p className="lp-feature-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Categories ─────────────────────────────────────────────── */
const categories = [
  { name: 'Clothes',       emoji: '👕', desc: 'Shirts, pants, dresses, and more' },
  { name: 'Books',         emoji: '📚', desc: 'Textbooks, novels, and educational material' },
  { name: 'Ration Items',  emoji: '🍚', desc: 'Food packages and essential supplies' },
];

const Categories = () => (
  <section id="categories" className="lp-section">
    <div className="lp-container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="lp-section-header"
      >
        <motion.h2 custom={0} variants={fadeUp} className="lp-section-title">
          What Can You Share?
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="lp-section-sub">
          Three categories focused on maximum community impact.
        </motion.p>
      </motion.div>

      <div className="lp-categories-grid">
        {categories.map(({ name, emoji, desc }, i) => (
          <motion.div
            key={name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lp-cat-card"
          >
            <div className="lp-cat-emoji">{emoji}</div>
            <h3 className="lp-cat-name">{name}</h3>
            <p className="lp-cat-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── How It Works ───────────────────────────────────────────── */
const steps = [
  { step: '01', title: 'Create an Account',  desc: 'Sign up in seconds with your email' },
  { step: '02', title: 'List Your Items',    desc: 'Upload photos, set category and type' },
  { step: '03', title: 'Connect Locally',    desc: 'Find nearby buyers, donors, or swappers' },
  { step: '04', title: 'Share & Impact',     desc: 'Complete the exchange and make a difference' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="lp-section lp-section-card">
    <div className="lp-container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="lp-section-header"
      >
        <motion.h2 custom={0} variants={fadeUp} className="lp-section-title">
          How It Works
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="lp-section-sub">
          Four simple steps to start making a difference.
        </motion.p>
      </motion.div>

      <div className="lp-steps-grid">
        {steps.map(({ step, title, desc }, i) => (
          <motion.div
            key={step}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lp-step"
          >
            <div className="lp-step-circle">{step}</div>
            <h3 className="lp-step-title">{title}</h3>
            <p className="lp-step-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── NGO CTA ─────────────────────────────────────────────────── */
const NgoCTA = () => (
  <section id="ngos" className="lp-section">
    <div className="lp-container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="lp-ngo-banner"
      >
        <motion.h2 custom={0} variants={fadeUp} className="lp-ngo-title">
          Are You an NGO?
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="lp-ngo-desc">
          Register your organization on ShareHub to receive direct donations from community members.
          Get verified and start receiving clothes, books, and rations for those who need them most.
        </motion.p>
        <motion.div custom={2} variants={fadeUp}>
          <Link to="/signup?role=ngo" className="lp-btn-secondary lp-btn-lg">
            Register Your NGO
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────── */
const LandingFooter = () => (
  <footer className="lp-footer">
    <div className="lp-container">
      <div className="lp-footer-grid">
        <div>
          <h3 className="lp-footer-logo">ShareHub</h3>
          <p className="lp-footer-about">
            A community-based platform promoting responsible sharing of household items.
          </p>
        </div>
        <div>
          <h4 className="lp-footer-heading">Platform</h4>
          <ul className="lp-footer-links">
            <li><Link to="/products">Browse Items</Link></li>
            <li><Link to="/seller/products/add">Sell</Link></li>
            <li><Link to="/ngos">Donate</Link></li>
            <li><Link to="/swaps/explore">Swap</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="lp-footer-heading">Community</h4>
          <ul className="lp-footer-links">
            <li><Link to="/ngos">NGO Partners</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="lp-footer-heading">Legal</h4>
          <ul className="lp-footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="lp-footer-bottom">
        © 2026 ShareHub. Built for communities, by communities.
      </div>
    </div>
  </footer>
);

/* ─── Page ────────────────────────────────────────────────────── */
const Home = () => (
  <div className="lp-root">
    <LandingNavbar />
    <main>
      <Hero />
      <Features />
      <Categories />
      <HowItWorks />
      <NgoCTA />
    </main>
    <LandingFooter />
  </div>
);

export default Home;
