import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, RefreshCw } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  
  // Search & Filter state
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  
  // Slice products for the 12 Just Arrived slots
  const justArrivedProducts = products.slice(0, 12);

  const renderJustArrivedSlot = (idx, className) => {
    const prod = justArrivedProducts[idx];
    if (!prod) {
      return (
        <div key={idx} className={`${className} empty-slot`}>
          <span>Maker Component</span>
        </div>
      );
    }

    const isTall = ['j1', 'j2', 'j7', 'j8'].includes(className);

    if (isTall) {
      return (
        <div key={prod._id} className={`${className} just-arrived-card tall`}>
          <div className="card-image-box">
            <img src={prod.image} alt={prod.name} />
          </div>
          <div className="card-meta-box">
            <span className="cat">{prod.category}</span>
            <h4 title={prod.name}>{prod.name}</h4>
            <span className="price">₹ {prod.price.toFixed(2)}</span>
            <button onClick={() => addToCart(prod, 1)} className="btn-add-mini">Add to Cart</button>
          </div>
        </div>
      );
    } else {
      return (
        <div key={prod._id} className={`${className} just-arrived-card compact`}>
          <img src={prod.image} alt={prod.name} className="thumb" />
          <div className="card-meta-box">
            <h4 title={prod.name}>{prod.name}</h4>
            <span className="price">₹ {prod.price.toFixed(2)}</span>
            <button onClick={() => addToCart(prod, 1)} className="btn-add-micro">Add</button>
          </div>
        </div>
      );
    }
  };
  const [clearanceProducts, setClearanceProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef(null);
  const slides = [
    'https://makerbazar.in/cdn/shop/files/WhatsApp_Image_2025-10-24_at_20.38.07.jpg?v=1761471358&width=1600',
    'https://makerbazar.in/cdn/shop/files/Web_Banner_Maker.jpg?v=1722621420&width=2000',
    'https://makerbazar.in/cdn/shop/files/banner.jpg?v=1763288112&width=2000',
    'https://makerbazar.in/cdn/shop/files/MakerBazar_Customer_Care.jpg?v=1735030421&width=2000',
    'https://makerbazar.in/cdn/shop/files/offer.jpg?v=1685608547&width=1800'
  ];

  // Quadcopter Drone Zoom Panel State
  const [droneProduct, setDroneProduct] = useState(null);
  const [activeDroneImg, setActiveDroneImg] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const zoomContainerRef = useRef(null);

  // Fetch Products
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'http://127.0.0.1:5000/api/products';
        const params = [];
        if (category) params.push(`category=${encodeURIComponent(category)}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);

          // Find drone product for zoom gallery demonstration
          const drone = data.find(p => p.category === 'RC Planes & Drones');
          if (drone) {
            setDroneProduct(drone);
            setActiveDroneImg(drone.image);
          } else if (!category && !search) {
            // Fetch drone product directly if not in current search parameters
            const allResponse = await fetch('http://127.0.0.1:5000/api/products');
            const allData = await allResponse.json();
            const d = allData.find(p => p.category === 'RC Planes & Drones');
            if (d) {
              setDroneProduct(d);
              setActiveDroneImg(d.image);
            }
          }
        } else {
          setError('Failed to fetch product catalog.');
        }
      } catch (err) {
        console.error('Fetch products error:', err.message);
        setError('Connection error reaching product API.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [category, search]);

  // Fetch Clearance Sale Products
  useEffect(() => {
    const fetchClearance = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/products?clearance=true');
        if (response.ok) {
          const data = await response.json();
          setClearanceProducts(data);
        }
      } catch (err) {
        console.error('Fetch clearance error:', err.message);
      }
    };
    fetchClearance();
  }, []);

  // Slider Logic
  const startSlider = () => {
    stopSlider();
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
  };

  const stopSlider = () => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
  };

  useEffect(() => {
    startSlider();
    return () => stopSlider();
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    startSlider();
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    startSlider();
  };

  // Magnifying Zoom logic
  const handleMouseMove = (e) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    
    // Calculate hover percentage
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeDroneImg})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%' // Magnify ratio
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="homepage-container">
      {/* Banner Slider */}
      <div 
        className="hero-slider"
        onMouseEnter={stopSlider}
        onMouseLeave={startSlider}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`slider-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ opacity: idx === currentSlide ? 1 : 0 }}
          >
            <img src={slide} alt={`MakerBazar Banner promotion ${idx + 1}`} />
          </div>
        ))}
        
        <button className="slider-nav-btn prev-btn" onClick={handlePrevSlide} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button className="slider-nav-btn next-btn" onClick={handleNextSlide} aria-label="Next slide">
          <ChevronRight size={24} />
        </button>

        <div className="slider-dots">
          {slides.map((_, idx) => (
            <span 
              key={idx} 
              className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => { setCurrentSlide(idx); startSlider(); }}
            ></span>
          ))}
        </div>
      </div>

      {/* Categories Collection (Circular layout from original site) */}
      <section className="collections-section">
        <div className="section-title">
          <h2>Our Collection Categories</h2>
        </div>
        <div className="collections-grid">
          {[
            { name: 'RC Planes & Drones', img: 'https://makerbazar.in/cdn/shop/collections/Makerware_Collection_Bullet_-_Aeromodelling-02-02.png?v=1573633272&width=480' },
            { name: 'Arts & Crafts', img: 'https://makerbazar.in/cdn/shop/collections/Arts_Crafts_Collection.jpg?v=1573640701&width=480' },
            { name: '3D printing', img: 'https://makerbazar.in/cdn/shop/collections/3d_printer.jpg?v=1573633327&width=480' },
            { name: 'STEM Learing Toys', img: 'https://makerbazar.in/cdn/shop/collections/makerware_elements_new-02_1.png?v=1578559073&width=240' },
            { name: 'Sensors', img: 'https://makerbazar.in/cdn/shop/collections/IOt_sensors.jpg?v=1573633211&width=480' },
            { name: 'Hardware', img: 'https://makerbazar.in/cdn/shop/collections/Makerware_Collection_Bullet_-_Wood_Working-02-02-02_1.jpg?v=1573640654&width=480' }
          ].map((cat, idx) => (
            <Link key={idx} to={`/?category=${encodeURIComponent(cat.name)}`} className="collection-circle-card">
              <div className="circle-image-wrapper">
                <img src={cat.img} alt={cat.name} />
              </div>
              <p>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Clearance Sale section */}
      {clearanceProducts.length > 0 && (
        <section className="clearance-sale-section">
          <div className="section-header">
            <h3>🔥 clearance Sale (Clearout Offers)</h3>
            <Link to="/?category=Hardware" className="view-all-link">View all</Link>
          </div>

          <div className="products-grid">
            {clearanceProducts.map(prod => (
              <div key={prod._id} className="premium-product-card">
                <div className="product-badge">SALE</div>
                <div className="image-frame">
                  <img src={prod.image} alt={prod.name} />
                </div>
                <div className="product-info">
                  <span className="product-cat">{prod.category}</span>
                  <h4 className="product-title" title={prod.name}>{prod.name}</h4>
                  <div className="rating-row">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(prod.rating) ? '#F6A704' : 'none'} stroke="#F6A704" />
                      ))}
                    </div>
                    <span className="reviews">({prod.reviewsCount} reviews)</span>
                  </div>
                  <div className="price-row">
                    <span className="current-price">₹ {prod.price.toFixed(2)}</span>
                    <span className="original-price">₹ {(prod.price * 1.5).toFixed(0)}</span>
                  </div>
                  <button onClick={() => addToCart(prod, 1)} className="btn-add-cart">
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Just Arrived Asymmetric Grid Section */}
      {products.length > 0 && (
        <section className="just-arrived-section">
          <div className="section-header">
            <h3>✨ Just Arrived</h3>
            <Link to="/" className="view-all-link">View all</Link>
          </div>
          <div className="j-g">
            <div className="jgr">
              {renderJustArrivedSlot(0, 'j1')}
              {renderJustArrivedSlot(1, 'j2')}
              {renderJustArrivedSlot(2, 'j3')}
              {renderJustArrivedSlot(3, 'j4')}
              {renderJustArrivedSlot(4, 'j5')}
              {renderJustArrivedSlot(5, 'j6')}
              {renderJustArrivedSlot(6, 'j7')}
              {renderJustArrivedSlot(7, 'j8')}
              {renderJustArrivedSlot(8, 'j9')}
              {renderJustArrivedSlot(9, 'j10')}
              {renderJustArrivedSlot(10, 'j11')}
              {renderJustArrivedSlot(11, 'j12')}
            </div>
          </div>
        </section>
      )}

      {/* Premium Roll-over Zoom Panel (Wooden drone) */}
      {droneProduct && (
        <section className="interactive-showcase-section">
          <div className="section-title">
            <h2>Premium Product Feature</h2>
          </div>
          <div className="showcase-card">
            <div className="showcase-gallery">
              <div className="thumbnails-scroller">
                {(droneProduct.images && droneProduct.images.length > 0 ? droneProduct.images : [droneProduct.image]).map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumb-btn ${activeDroneImg === img ? 'active' : ''}`}
                    onClick={() => setActiveDroneImg(img)}
                    aria-label={`Select thumbnail ${idx + 1}`}
                  >
                    <img src={img} alt={`Drone thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
              <div 
                className="main-view-zoom-container"
                ref={zoomContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img src={activeDroneImg} alt={droneProduct.name} className="main-zoom-image" />
                <div className="magnified-zoom-window" style={zoomStyle}></div>
                <div className="zoom-hint">Roll over image to zoom in</div>
              </div>
            </div>

            <div className="showcase-details">
              <span className="showcase-badge">Featured Drone Kit</span>
              <h3>{droneProduct.name}</h3>
              <div className="stars-row">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#F6A704" stroke="#F6A704" />
                  ))}
                </div>
                <span>4.9 (37 reviews)</span>
              </div>
              <div className="price-tag">₹ {droneProduct.price.toFixed(2)}</div>
              <p className="description">{droneProduct.description}</p>
              
              <ul className="details-highlights">
                <li>✨ Free Delivery on pre-paid orders!</li>
                <li>🛠️ Includes premium laser-cut wooden frame structure</li>
                <li>🛸 Compatible with all standard KK2.1, APM, or Pixhawk controllers</li>
                <li>📦 Perfect for engineering prototyping and STEM workshops</li>
              </ul>

              <button onClick={() => addToCart(droneProduct, 1)} className="btn-buy-now">
                Add to Shopping Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main product showcase / Catalog */}
      <section className="catalog-products-section">
        <div className="section-header">
          <h3>
            {category ? `${category} Collection` : search ? `Search Results for "${search}"` : 'All Products Catalog'}
          </h3>
          {(category || search) && (
            <Link to="/" className="reset-search-link">
              <RefreshCw size={14} /> Reset Filters
            </Link>
          )}
        </div>

        {loading ? (
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Fetching active product inventory...</p>
          </div>
        ) : error ? (
          <div className="catalog-error">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">
            <p>No products found matching your search options.</p>
            <Link to="/" className="btn-reset-catalog">View All Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(prod => (
              <div key={prod._id} className="premium-product-card">
                <div className="image-frame">
                  <img src={prod.image} alt={prod.name} />
                </div>
                <div className="product-info">
                  <span className="product-cat">{prod.category}</span>
                  <h4 className="product-title" title={prod.name}>{prod.name}</h4>
                  <div className="rating-row">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(prod.rating) ? '#F6A704' : 'none'} stroke="#F6A704" />
                      ))}
                    </div>
                    <span className="reviews">({prod.reviewsCount} reviews)</span>
                  </div>
                  <div className="price-row">
                    <span className="current-price">₹ {prod.price.toFixed(2)}</span>
                  </div>
                  <button onClick={() => addToCart(prod, 1)} className="btn-add-cart">
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
