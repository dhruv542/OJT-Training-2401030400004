import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, User, LogOut, Trash2, X, Plus, Minus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, getItemsCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All categories');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setIsTableMenuOpen(false);
    navigate(`/?category=${encodeURIComponent(cat)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let query = '/?';
    if (searchText.trim()) {
      query += `search=${encodeURIComponent(searchText.trim())}&`;
    }
    if (selectedCategory && selectedCategory !== 'All categories') {
      query += `category=${encodeURIComponent(selectedCategory)}&`;
    }
    navigate(query);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    let query = '/?';
    if (searchText.trim()) {
      query += `search=${encodeURIComponent(searchText.trim())}&`;
    }
    if (cat !== 'All categories') {
      query += `category=${encodeURIComponent(cat)}&`;
    }
    navigate(query);
  };

  return (
    <>
      <div className="top-banner">
        <p>✨ Now get free delivery on prepaid orders above Rs 999/-</p>
      </div>

      <header className="main-header">
        <div className="header-container">
          {/* Menu icon for toggling categories table mega-menu */}
          <button 
            className="menu-toggle-btn" 
            onClick={() => {
              setIsTableMenuOpen(!isTableMenuOpen);
              setIsMobileMenuOpen(false);
            }}
            aria-label="Toggle categories mega menu"
          >
            <div className={`bar ${isTableMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isTableMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isTableMenuOpen ? 'open' : ''}`}></div>
          </button>

          {/* Logo */}
          <div className="brand-logo">
            <Link to="/">
              <h2>
                <span className="char-red">m</span>
                <span className="char-blue">a</span>
                <span className="char-yellow">k</span>
                <span className="char-green">e</span>
                <span className="char-purple">r</span>
                <span className="char-text">bazar</span>
              </h2>
            </Link>
          </div>

          {/* Search bar */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search DIY parts, robotics, drones..."
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="All categories">All categories</option>
              <option value="RC Planes & Drones">RC Planes & Drones</option>
              <option value="Robotics">Robotics</option>
              <option value="Prototyping">Prototyping</option>
              <option value="Arts & Crafts">Arts & Crafts</option>
              <option value="Sensors">Sensors</option>
              <option value="Hardware">Hardware</option>
              <option value="Electronics">Electronics</option>
              <option value="3D printing">3D printing</option>
              <option value="STEM Learing Toys">STEM Learing Toys</option>
            </select>
            <button type="submit" className="search-btn" aria-label="Submit search">
              <Search size={20} />
            </button>
          </form>

          {/* Right account & cart buttons */}
          <div className="header-actions">
            {user ? (
              <div className="user-dropdown-container">
                <Link to="/profile" className="account-link">
                  <User size={20} />
                  <div className="account-text">
                    <span className="greet">Hello, {user.firstName}</span>
                    <span className="subtitle">My Account</span>
                  </div>
                </Link>
                <button onClick={logout} className="action-logout-btn" title="Sign out" aria-label="Sign out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="account-link">
                <User size={20} />
                <div className="account-text">
                  <span>Login / Sign Up</span>
                  <span className="subtitle">My Account</span>
                </div>
              </Link>
            )}

            <button className="cart-trigger-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={24} />
                {getItemsCount() > 0 && <span className="cart-badge">{getItemsCount()}</span>}
              </div>
              <span className="cart-label">Cart</span>
            </button>
          </div>
        </div>

        {/* Categories Navbar List */}
        <nav className={`category-nav-bar ${isMobileMenuOpen ? 'mobile-show' : ''}`}>
          <Link to="/?category=RC Planes %26 Drones" className="nav-link">RC Planes & Drones</Link>
          <Link to="/?category=Robotics" className="nav-link">Robotics</Link>
          <Link to="/?category=Prototyping" className="nav-link">Prototyping</Link>
          <Link to="/?category=Arts %26 Crafts" className="nav-link">Arts & Crafts</Link>
          <Link to="/?category=Sensors" className="nav-link">Sensors</Link>
          <Link to="/?category=Hardware" className="nav-link">Hardware</Link>
          <Link to="/?category=Electronics" className="nav-link">Electronics</Link>
          <Link to="/?category=3D printing" className="nav-link">3D printing</Link>
          <Link to="/?category=STEM Learing Toys" className="nav-link">STEM Learning</Link>
        </nav>
      </header>

      {/* Slide-out Cart Drawer Overlay */}
      {isCartOpen && <div className="cart-overlay-shadow" onClick={() => setIsCartOpen(false)}></div>}

      {/* Slide-out Cart Drawer */}
      <div className={`cart-drawer-panel ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Shopping Cart ({getItemsCount()} items)</h3>
          <button className="close-drawer-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart drawer">
            <X size={24} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-view">
              <ShoppingCart size={64} className="empty-icon" />
              <p>Your shopping cart is currently empty.</p>
              <button className="btn-shop-now" onClick={() => { setIsCartOpen(false); navigate('/'); }}>
                Shop Now
              </button>
            </div>
          ) : (
            <div className="cart-items-scroller">
              {cartItems.map((item) => (
                <div key={item.product._id} className="cart-item-card">
                  <img src={item.product.image} alt={item.product.name} className="item-thumbnail" />
                  <div className="item-details">
                    <h4 className="item-title">{item.product.name}</h4>
                    <span className="item-price">₹ {item.product.price.toFixed(2)} each</span>
                    <div className="qty-picker">
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="qty-btn"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-count">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="qty-btn"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="item-actions">
                    <span className="item-subtotal">₹ {(item.product.price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.product._id)} 
                      className="btn-remove-item"
                      title="Remove product"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="price-row">
              <span>Subtotal:</span>
              <span className="total-value">₹ {getCartTotal().toFixed(2)}</span>
            </div>
            <p className="shipping-note">Taxes and free shipping computed at checkout</p>
            <div className="action-row">
              <button 
                onClick={() => { setIsCartOpen(false); navigate('/profile'); }}
                className="btn-checkout-link"
              >
                Checkout & Pay
              </button>
            </div>
          </div>
        )}
      </div>
    {/* Mega Category Table Menu Overlay */}
    {isTableMenuOpen && (
      <div className="table-menu-overlay" onClick={() => setIsTableMenuOpen(false)}>
        <div className="table-menu-content" onClick={(e) => e.stopPropagation()}>
          <table className="mega-category-table">
            <thead>
              <tr>
                <th onClick={() => handleCategoryClick('Electronics')}>Electronics</th>
                <th onClick={() => handleCategoryClick('Robotics')}>Robotics</th>
                <th onClick={() => handleCategoryClick('Prototyping')}>Prototyping</th>
                <th onClick={() => handleCategoryClick('Brands')}>Brands</th>
                <th onClick={() => handleCategoryClick('Hardware')}>Hardware</th>
                <th onClick={() => handleCategoryClick('RC Planes & Drones')}>RC Planes & Drones</th>
                <th onClick={() => handleCategoryClick('Arts & Crafts')}>Arts & Crafts</th>
                <th onClick={() => handleCategoryClick('Home & Decore')}>Home & Decore</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td onClick={() => handleCategoryClick('Electronics')}>Electronics</td>
                  <td onClick={() => handleCategoryClick('Robotics')}>Robotics</td>
                  <td onClick={() => handleCategoryClick('Prototyping')}>Prototyping</td>
                  <td onClick={() => handleCategoryClick('Brands')}>Brands</td>
                  <td onClick={() => handleCategoryClick('Hardware')}>Hardware</td>
                  <td onClick={() => handleCategoryClick('RC Planes & Drones')}>RC Planes & Drones</td>
                  <td onClick={() => handleCategoryClick('Arts & Crafts')}>Arts & Crafts</td>
                  <td onClick={() => handleCategoryClick('Home & Decore')}>Home & Decore</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
