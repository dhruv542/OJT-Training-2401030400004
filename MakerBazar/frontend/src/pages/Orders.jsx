import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Calendar, MapPin, Truck, CheckCircle } from 'lucide-react';

const Orders = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          setError('Failed to retrieve order history.');
        }
      } catch (err) {
        console.error('Fetch orders error:', err.message);
        setError('Connection error reaching order history API.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 'U';

  return (
    <div className="orders-page-container">
      {/* Mini sub-navigation header */}
      <div className="profile-sub-navbar">
        <strong className="profile-brand-text">MakerBazar.in</strong>
        <div className="sub-nav-links">
          <Link to="/orders" className="sub-link active">Orders</Link>
          <Link to="/profile" className="sub-link">Profile</Link>
        </div>
        <div className="user-avatar-circle">{userInitials}</div>
      </div>

      <div className="orders-history-panel">
        <div className="dashboard-section-title">
          <h2>Order History</h2>
        </div>

        {loading ? (
          <div className="orders-loading">
            <div className="spinner"></div>
            <p>Retrieving your order shipments...</p>
          </div>
        ) : error ? (
          <div className="orders-error">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-card">
            <div className="card-hero-content">
              <ShoppingBag size={64} className="empty-icon" />
              <h3>No orders placed yet</h3>
              <p>You haven't ordered any building components yet. Go to our store catalog to start creating!</p>
              <Link to="/" className="btn-go-shopping">Go to Store Catalog</Link>
            </div>
          </div>
        ) : (
          <div className="orders-list-scroller">
            {orders.map((order) => (
              <div key={order._id} className="order-shipping-card">
                <div className="card-top-header">
                  <div className="header-meta">
                    <div className="meta-item">
                      <span className="lbl">Order Number</span>
                      <strong className="val">MB-{(order._id).slice(-8).toUpperCase()}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="lbl">Date Placed</span>
                      <span className="val"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="lbl">Total Cost</span>
                      <strong className="val price">₹ {order.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="order-status-badge">
                    <CheckCircle size={14} /> {order.status}
                  </div>
                </div>

                <div className="card-contents-body">
                  <div className="items-list-block">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="item-detail-row">
                        <span className="name">{item.name}</span>
                        <span className="qty">Qty: {item.quantity}</span>
                        <span className="price">₹ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="shipping-address-block">
                    <div className="address-header">
                      <MapPin size={16} />
                      <h4>Shipping Details</h4>
                    </div>
                    <p className="recipient">
                      <strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong>
                    </p>
                    <p className="details">{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}</p>
                    <p className="city-zip">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pin}</p>
                    <p className="contact">📞 {order.shippingAddress.phone}</p>
                  </div>
                </div>

                <div className="card-footer-tracking">
                  <div className="tracking-timeline">
                    <div className="step active">
                      <span className="bullet"></span>
                      <span className="lbl">Ordered</span>
                    </div>
                    <div className={`step ${order.status === 'Shipped' || order.status === 'Delivered' ? 'active' : ''}`}>
                      <span className="bullet"></span>
                      <span className="lbl"><Truck size={14} /> Shipped</span>
                    </div>
                    <div className={`step ${order.status === 'Delivered' ? 'active' : ''}`}>
                      <span className="bullet"></span>
                      <span className="lbl">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
