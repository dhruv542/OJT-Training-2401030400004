import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Trash2, MapPin, Edit3, X, CreditCard, ShoppingBag } from 'lucide-react';

const Profile = () => {
  const { user, token, updateAddresses, logout } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Address form state
  const [country, setCountry] = useState('India');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected shipping address ID for checkout (default to the default address if present)
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Set default selected address
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault);
      if (defAddr) {
        setSelectedAddressId(defAddr._id);
      } else {
        setSelectedAddressId(user.addresses[0]._id);
      }
    }
  }, [user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form fields
    setFirstName('');
    setLastName('');
    setCompany('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setPin('');
    setPhone('');
    setIsDefault(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName || !lastName || !addressLine1 || !city || !state || !pin || !phone) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country,
          firstName,
          lastName,
          company,
          addressLine1,
          addressLine2,
          city,
          state,
          pin,
          phone,
          isDefault
        })
      });

      const data = await response.json();

      if (response.ok) {
        updateAddresses(data); // Sync state to context
        handleCloseModal();
      } else {
        setErrorMsg(data.error || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Add address error:', err.message);
      setErrorMsg('Connection error saving address details.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/auth/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateAddresses(data);
      }
    } catch (err) {
      console.error('Delete address error:', err.message);
    }
  };

  // Checkout Placement Handler
  const handlePlaceOrder = async () => {
    setCheckoutError('');
    if (!selectedAddressId) {
      setCheckoutError('Please select a shipping address to proceed.');
      return;
    }

    const shippingAddress = user.addresses.find(a => a._id === selectedAddressId);
    if (!shippingAddress) {
      setCheckoutError('Selected shipping address details could not be loaded.');
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      if (response.ok) {
        // Success
        await clearCart(); // Clear front/back cart
        navigate('/orders'); // Redirect to orders history tracker
      } else {
        const data = await response.json();
        setCheckoutError(data.error || 'Checkout placement failed.');
      }
    } catch (err) {
      console.error('Checkout error:', err.message);
      setCheckoutError('Network error during checkout placement.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 'U';

  return (
    <div className="profile-page-container">
      {/* Mini sub-navigation header */}
      <div className="profile-sub-navbar">
        <strong className="profile-brand-text">MakerBazar.in</strong>
        <div className="sub-nav-links">
          <Link to="/orders" className="sub-link">Orders</Link>
          <Link to="/profile" className="sub-link active">Profile</Link>
        </div>
        <div className="user-avatar-circle">{userInitials}</div>
      </div>

      <div className="profile-dashboard-layout">
        {/* Left Side: Profile Details & Address Book */}
        <div className="profile-left-panel">
          <div className="dashboard-section-title">
            <h2>User Account Profile</h2>
          </div>

          {/* Personal detail card */}
          <div className="personal-details-card">
            <div className="card-header">
              <div className="header-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <Edit3 size={18} className="edit-icon-btn" />
            </div>
            <hr className="divider" />
            <div className="details-body">
              <div className="detail-row">
                <span className="label">Registered Email</span>
                <span className="val">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Addresses list card */}
          <div className="addresses-book-card">
            <div className="addresses-card-header">
              <h3>Shipping Address Book</h3>
              <button onClick={handleOpenModal} className="btn-add-address-trigger">
                <Plus size={16} /> Add Address
              </button>
            </div>

            {user.addresses && user.addresses.length === 0 ? (
              <div className="empty-addresses-banner">
                <MapPin size={32} className="empty-icon" />
                <p>No shipping addresses have been added yet.</p>
              </div>
            ) : (
              <div className="addresses-selector-list">
                {user.addresses.map((addr) => (
                  <div 
                    key={addr._id} 
                    className={`address-item-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="address-select-radio">
                      <input 
                        type="radio" 
                        name="shippingAddressSelect"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                    </div>
                    <div className="address-contents">
                      <div className="name-default-row">
                        <strong>{addr.firstName} {addr.lastName}</strong>
                        {addr.isDefault && <span className="default-tag">Default</span>}
                      </div>
                      {addr.company && <p className="company">{addr.company}</p>}
                      <p className="street">{addr.addressLine1}, {addr.addressLine2}</p>
                      <p className="city-zip">{addr.city}, {addr.state} - {addr.pin}</p>
                      <p className="phone">📞 {addr.phone}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }} 
                      className="btn-delete-address"
                      title="Remove address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="logout-actions-panel">
            <button onClick={logout} className="btn-profile-logout">Sign Out</button>
            <p className="device-logout-sub">Sign out of all logged-in devices</p>
          </div>
        </div>

        {/* Right Side: Active Checkout Summary Drawer (If items in Cart) */}
        {cartItems.length > 0 && (
          <div className="profile-checkout-side-panel">
            <div className="checkout-sticky-card">
              <div className="checkout-header">
                <CreditCard size={20} />
                <h3>Secure Checkout</h3>
              </div>

              {checkoutError && <div className="checkout-error-feedback">{checkoutError}</div>}

              <div className="checkout-items-summary">
                <div className="items-list-header">
                  <span>Order Items</span>
                  <span>Total</span>
                </div>
                <div className="scroller-items-checkout">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="checkout-item-line">
                      <span className="qty-name">{item.quantity}x {item.product.name}</span>
                      <span className="cost">₹ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="checkout-totals-block">
                <div className="total-row">
                  <span>Items cost:</span>
                  <span>₹ {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span className="shipping-val">FREE (Pre-paid discount)</span>
                </div>
                <hr className="totals-divider" />
                <div className="grand-total-row">
                  <span>Grand Total:</span>
                  <span>₹ {getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={checkoutSubmitting}
                className="btn-submit-order-pay"
              >
                {checkoutSubmitting ? (
                  <>
                    <ShoppingBag size={18} className="spin-animate" /> Processing Payment...
                  </>
                ) : (
                  'Confirm & Pay via Gateway'
                )}
              </button>
              <p className="payment-security-note">🔒 Secured by 256-bit AES SSL Gateway</p>
            </div>
          </div>
        )}
      </div>

      {/* Address Form Popup Modal Dialog (Fully Accessible) */}
      {isModalOpen && (
        <div className="address-modal-shadow-overlay" onClick={handleCloseModal}>
          <div className="address-popup-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="modal-header">
              <h3 id="modalTitle">Add shipping address</h3>
              <button className="btn-close-modal" onClick={handleCloseModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="address-form-body">
              {errorMsg && <div className="form-error-feedback">{errorMsg}</div>}

              <div className="form-group col-full">
                <label htmlFor="country-select">Country/region</label>
                <select id="country-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="form-row-half">
                <div className="form-group">
                  <label htmlFor="fname-input">First name</label>
                  <input id="fname-input" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="lname-input">Last name</label>
                  <input id="lname-input" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group col-full">
                <label htmlFor="company-input">Company (optional)</label>
                <input id="company-input" type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div className="form-group col-full">
                <label htmlFor="address-1-input">Street address</label>
                <input id="address-1-input" type="text" placeholder="House number and street name" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
              </div>

              <div className="form-group col-full">
                <label htmlFor="address-2-input">Apartment, suite, unit etc. (optional)</label>
                <input id="address-2-input" type="text" placeholder="Apartment, suite, etc." value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
              </div>

              <div className="form-row-third">
                <div className="form-group">
                  <label htmlFor="city-input">City</label>
                  <input id="city-input" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="state-select">State</label>
                  <select id="state-select" value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="Andaman & Nicobar Islands">Andaman & Nicobar Islands</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="pin-input">PIN code</label>
                  <input id="pin-input" type="text" placeholder="PIN code" value={pin} onChange={(e) => setPin(e.target.value)} required />
                </div>
              </div>

              <div className="form-group col-full">
                <label htmlFor="phone-input">Phone Number</label>
                <div className="phone-input-wrapper">
                  <span className="prefix">+91</span>
                  <input id="phone-input" type="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>

              <div className="form-checkbox-row col-full">
                <input id="default-addr-chk" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                <label htmlFor="default-addr-chk">Set as default shipping address</label>
              </div>

              <button type="submit" className="btn-modal-save-address col-full">Save Address</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
