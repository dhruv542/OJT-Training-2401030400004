import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="footer-panel">
      <div className="footer-wrapper">
        <div className="footer-column about-col">
          <h3>ABOUT THE SHOP</h3>
          <p>
            <strong>MakerBazar.in</strong> is the ultimate online store to buy STEM Kits, Electronics, Robotics, 
            Aeromodelling Drone Parts, IoT, Prototyping, and Arts & Crafts materials at the lowest prices. We support 
            makers, hobbyists, students, and DIY builders across India.
          </p>
        </div>

        <div className="footer-column links-col">
          <h3>POPULAR COLLECTIONS</h3>
          <ul>
            <li>Latest Products</li>
            <li>Microcontrollers</li>
            <li>IoT & Sensors</li>
            <li>STEM Toy Kits</li>
            <li>Aeromodelling & Drones</li>
            <li>Arts & Crafts Supplies</li>
          </ul>
        </div>

        <div className="footer-column links-col">
          <h3>INFORMATION</h3>
          <ul>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Frequently Asked Questions (FAQs)</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Refund Policy</li>
            <li>Shipping Policy</li>
          </ul>
        </div>

        <div className="footer-column subscribe-col">
          <h3>SUBSCRIBE TO NEWSLETTER</h3>
          <p>Join us for quick updates, product arrivals, and exclusive offers...</p>
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MakerBazar.in. All Rights Reserved. (MERN Stack Clone)</p>
      </div>
    </footer>
  );
};

export default Footer;
