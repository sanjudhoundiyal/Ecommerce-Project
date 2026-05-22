import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Quick View / Buy Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

 const handleBannerClick = (e, banner) => {
  e.stopPropagation(); // Avoid triggering parent buy drawer modal layout opens

  if (banner.category) {
    navigate(`/products?category=${encodeURIComponent(banner.category)}`);
  } 
  // Make sure productId actually exists and isn't blank!
  else if (banner.productId) {
    navigate(`/product/${banner.productId}`);
  } 
  // Fallback if everything else is missing
  else {
    navigate("/products");
  }
};

  useEffect(() => {
    fetch("http://localhost:8080/api/banner")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBanners(data);
        } else if (data && Array.isArray(data.content)) {
          setBanners(data.content);
        } else {
          setBanners([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching banners:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Auto-play slider every 6 seconds if multiple banners exist
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // Open buy modal with dynamic product data mapping from backend structure
  const handleOpenBuyModal = (bannerData) => {
    setSelectedProduct({
      id: bannerData.productId,
      name: bannerData.title || "Premium Collection Item",
      price: bannerData.productPrice || 2499, 
      image: bannerData.imageUrl,
      offerText: bannerData.offerText || "Special Limited Discount Applied",
      brand: bannerData.brand || "Exclusive Collection",
      description: bannerData.description || bannerData.subtitle
    });
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} units of "${selectedProduct.name}" to your cart!`);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading curated collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <p style={{ ...styles.loadingText, color: "#ff3f6c" }}>
            Failed to load banners: {error}
          </p>
          <p style={{ fontSize: "13px", color: "#696b79", marginTop: "8px" }}>
            Make sure your Spring Boot backend server application context is running on port 8080.
          </p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[activeIndex];
  
  // Image calculation matching your uploaded filesystem rules
  const getImageUrl = (imgName) => {
    if (!imgName) return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";
    const fileName = imgName.split("/").pop();
    return `http://localhost:8080/uploads/${encodeURIComponent(fileName)}`;
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        
        .action-btn-primary:hover {
          background-color: #111111 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .action-btn-secondary:hover {
          background-color: #f7f7f8 !important;
          border-color: #111111 !important;
          transform: translateY(-2px);
        }
        .slider-dot:hover { background-color: #111111 !important; }
        .animate-fade { animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-content { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-animate { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Main Hero Slider Area */}
      <section style={styles.heroSection}>
        {banners.length > 0 ? (
          <div 
            style={styles.bannerContainer} 
            className="animate-fade"
            key={activeIndex}
            onClick={() => handleOpenBuyModal(currentBanner)}
          >
            {/* Left Content Column */}
            <div style={styles.textSide}>
              <div style={styles.textContainer} className="animate-content">
                <div style={styles.badgeWrapper}>
                  <span style={styles.badge}>
                    {currentBanner.offerText || "EXCLUSIVE DEAL"}
                  </span>
                  {currentBanner.brand && (
                    <span style={styles.brandBadge}>{currentBanner.brand}</span>
                  )}
                </div>

                <h1 style={styles.title}>{currentBanner.title || "Premium Design Concept"}</h1>
                <p style={styles.subtitle}>{currentBanner.description || currentBanner.subtitle || "Discover elevated layout structures built for direct premium interface engagement."}</p>

                {/* Direct Action buying controls */}
                <div style={styles.buttonGroup}>
                  <button 
                    className="action-btn-primary" 
                    style={styles.primaryBtn}
                    onClick={(e) => handleBannerClick(e, currentBanner)}
                  >
                    Shop Now
                  </button>
                
                </div>

                {/* Horizontal Divider Line */}
                <div style={styles.divider}></div>

                {/* Core Trust Anchors */}
                <div style={styles.trustBadgeContainer}>
                  <div style={styles.trustItem}>
                    <span style={styles.trustIcon}>✦</span>
                    <span style={styles.trustText}><strong>100%</strong> Original Product Verified</span>
                  </div>
                  <div style={styles.trustItem}>
                    <span style={styles.trustIcon}>✦</span>
                    <span style={styles.trustText}><strong>Instant</strong> Secure Dispatch Entry</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Asset Graphic Column */}
            <div style={styles.imageSide}>
              <img
                src={getImageUrl(currentBanner.imageUrl)}
                alt={currentBanner.title || "Banner View"}
                style={styles.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";
                }}
              />
              <div style={styles.imageOverlay}></div>
              
              {/* Product Price Tag floating above layout */}
              {currentBanner.productId && (
                <div style={styles.floatingPriceTag}>
                  <span style={styles.floatingPriceLabel}>PROMO OFFER</span>
                  <span style={styles.floatingPriceVal}>ID: #{currentBanner.productId}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>No promotional banners linked to the database engine fields index grids.</p>
          </div>
        )}

        {/* Carousel Pagination Controls */}
        {banners.length > 1 && (
          <div style={styles.paginationTrack}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                className="slider-dot"
                style={{
                  ...styles.paginationDot,
                  backgroundColor: idx === activeIndex ? "#111111" : "#d4d5d9",
                  width: idx === activeIndex ? "28px" : "8px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Transactional Quick Buy Overlay Modal */}
      {isModalOpen && selectedProduct && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div 
            style={styles.modalBox} 
            className="modal-animate"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Close Cross icon */}
            <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>

            <div style={styles.modalSplitLayout}>
              {/* Product Preview Pane */}
              <div style={styles.modalLeftAsset}>
                <img 
                  src={getImageUrl(selectedProduct.image)} 
                  alt={selectedProduct.name} 
                  style={styles.modalProductImg}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";
                  }}
                />
              </div>

              {/* Purchase Specification Configurator */}
              <div style={styles.modalRightConfig}>
                <span style={styles.modalBrandText}>{selectedProduct.brand.toUpperCase()}</span>
                <h2 style={styles.modalProductName}>{selectedProduct.name}</h2>
                
                <div style={styles.modalPricingContainer}>
                  <span style={styles.modalPriceValue}>₹{selectedProduct.price}</span>
                  <span style={styles.modalOfferLabel}>{selectedProduct.offerText}</span>
                </div>

                <p style={styles.modalDescText}>{selectedProduct.description}</p>
                
                <div style={styles.modalSystemMeta}>
                  <span><strong>Product Reference:</strong> #{selectedProduct.id || "N/A"}</span>
                </div>

                {/* Configuration controls block */}
                <div style={styles.configControlsGroup}>
                  <label style={styles.controlLabel}>Select Quantity</label>
                  <div style={styles.quantityWidget}>
                    <button 
                      style={styles.qtyBtn} 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span style={styles.qtyDisplay}>{quantity}</span>
                    <button 
                      style={styles.qtyBtn} 
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total estimation bar */}
                <div style={styles.checkoutBreakdown}>
                  <span>Estimated Total:</span>
                  <span style={styles.checkoutTotalValue}>₹{selectedProduct.price * quantity}</span>
                </div>

                {/* Primary Action Terminal UI */}
                <button style={styles.modalActionSubmit} onClick={handleAddToCart}>
                  Proceed to Secure Checkout
                </button>
                <p style={styles.modalSecureNotice}>🛡️ 100% Safe Payments encrypted via standard digital token workflows.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    margin: 0,
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  heroSection: {
    width: "100%",
    position: "relative",
    borderBottom: "1px solid #f2f2f3"
  },
  bannerContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    minHeight: "640px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    flexWrap: "wrap"
  },
  textSide: {
    flex: "1.1",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "60px 5% 60px 8%",
    backgroundColor: "#ffffff",
    minWidth: "320px"
  },
  textContainer: {
    maxWidth: "620px",
  },
  badgeWrapper: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "24px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase"
  },
  brandBadge: {
    display: "inline-block",
    border: "1px solid #111111",
    color: "#111111",
    padding: "4px 11px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.04em"
  },
  title: {
    fontSize: "56px",
    fontWeight: "800",
    lineHeight: "1.08",
    color: "#111111",
    marginBottom: "24px",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "17px",
    lineHeight: "1.65",
    color: "#555557",
    marginBottom: "36px",
    fontWeight: "400"
  },
  buttonGroup: {
    display: "flex",
    gap: "14px",
    marginBottom: "40px",
  },
  primaryBtn: {
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: "16px 36px",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
    borderRadius: "0px",
    cursor: "pointer",
    transition: "all 0.25s ease-in-out",
    letterSpacing: "0.04em",
    textTransform: "uppercase"
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    color: "#111111",
    padding: "16px 28px",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #d4d5d9",
    borderRadius: "0px",
    cursor: "pointer",
    transition: "all 0.25s ease-in-out",
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#eee",
    marginBottom: "24px"
  },
  trustBadgeContainer: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap"
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  trustIcon: {
    color: "#111111",
    fontSize: "14px"
  },
  trustText: {
    fontSize: "13px",
    color: "#666668",
    letterSpacing: "0.01em"
  },
  imageSide: {
    flex: "0.9",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f9f9fb",
    minWidth: "300px"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(270deg, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 1) 100%)",
  },
  floatingPriceTag: {
    position: "absolute",
    bottom: "40px",
    right: "40px",
    backgroundColor: "#ffffff",
    padding: "12px 20px",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    zIndex: 2
  },
  floatingPriceLabel: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#88888a",
    letterSpacing: "0.08em"
  },
  floatingPriceVal: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111111"
  },
  paginationTrack: {
    position: "absolute",
    bottom: "24px",
    left: "8%",
    display: "flex",
    gap: "8px",
    zIndex: 10
  },
  paginationDot: {
    height: "8px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(17, 17, 17, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalBox: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "940px",
    position: "relative",
    borderRadius: "0px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    overflow: "hidden"
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "20px",
    fontSize: "32px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#111111",
    zIndex: 10
  },
  modalSplitLayout: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  modalLeftAsset: {
    flex: "1",
    minWidth: "300px",
    backgroundColor: "#f9f9fb",
    maxHeight: "520px"
  },
  modalProductImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  modalRightConfig: {
    flex: "1.2",
    minWidth: "320px",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column"
  },
  modalBrandText: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#88888a",
    marginBottom: "8px"
  },
  modalProductName: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111111",
    margin: "0 0 16px 0",
    lineHeight: "1.2"
  },
  modalPricingContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "20px"
  },
  modalPriceValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111111"
  },
  modalOfferLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#ff3f6c",
    backgroundColor: "#fff0f3",
    padding: "2px 8px"
  },
  modalDescText: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#555557",
    margin: "0 0 24px 0"
  },
  modalSystemMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "11px",
    color: "#99999c",
    borderTop: "1px solid #eee",
    paddingTop: "16px",
    marginBottom: "24px"
  },
  configControlsGroup: {
    marginBottom: "24px"
  },
  controlLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#111111",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "10px"
  },
  quantityWidget: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #d4d5d9"
  },
  qtyBtn: {
    backgroundColor: "transparent",
    border: "none",
    width: "40px",
    height: "40px",
    fontSize: "16px",
    cursor: "pointer",
    outline: "none"
  },
  qtyDisplay: {
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#111111"
  },
  checkoutBreakdown: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid #eee",
    marginBottom: "24px"
  },
  checkoutTotalValue: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#111111"
  },
  modalActionSubmit: {
    backgroundColor: "#111111",
    color: "#ffffff",
    border: "none",
    width: "100%",
    padding: "18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    transition: "background-color 0.2s"
  },
  modalSecureNotice: {
    textAlign: "center",
    fontSize: "11px",
    color: "#99999c",
    marginTop: "12px",
    marginBottom: 0
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "640px",
    backgroundColor: "#ffffff",
    color: "#696b79",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #111111",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.03em",
    color: "#111111",
  },
};

export default Home;