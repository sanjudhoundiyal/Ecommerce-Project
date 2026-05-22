import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();

  // Custom Brand Design Configurations
  const brandColor = "#ff3f6c";
  const API = "http://localhost:8080/api";
  const IMG = "http://localhost:8080";

  // State Management
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");

  // 📐 Core Responsive Layout Obverser Hooks
  useEffect(() => {
    handleResizeFix();
    window.addEventListener("resize", handleResizeFix);
    return () => window.removeEventListener("resize", handleResizeFix);
  }, []);

  const handleResizeFix = () => {
    if (window.innerWidth <= 991) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  };

  useEffect(() => {
    if (window.innerWidth <= 991) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // 📥 Async Data Initialization Fetcher
  const fetchWishlist = useCallback(async () => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setUserId(currentUserId);

    try {
      setLoading(true);
      const res = await fetch(`${API}/wishlist/${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // 🗑️ Remove Item Action Handler (Fixed your original undefined pId crash)
  const removeItem = async (productId) => {
    if (!productId) {
      console.error("No Product ID provided for removal");
      return;
    }

    try {
      const res = await fetch(
        `${API}/wishlist/remove?userId=${userId}&productId=${productId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        // Optimistic state filtering using matching parameter variable name
        setWishlist((prev) =>
          prev.filter((item) => {
            const id = item.product?.id || item.productId || item.id;
            return Number(id) !== Number(productId);
          })
        );
        
        Swal.fire({
          title: "Removed",
          text: "Item removed from wishlist.",
          icon: "success",
          confirmButtonColor: brandColor,
          timer: 1500
        });
      } else {
        Swal.fire({ title: "Error", text: "Failed to remove item", icon: "error", confirmButtonColor: brandColor });
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🛍️ Cart Dispatch Transaction Management
  const handleAddToCart = async (item) => {
    const product = item.product ? item.product : item;
    const pId = item.product?.id || item.productId || product.id;

    const isWatch =
      (product.category && product.category.toLowerCase().includes("watch")) ||
      (product.name && product.name.toLowerCase().includes("watch"));

    const payload = {
      userId: Number(userId),
      productId: Number(pId),
      quantity: 1,
      size: isWatch ? null : (item.size || null),
    };

    try {
      const res = await fetch(`${API}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setWishlist((prev) => prev.filter((i) => (i.product ? i.product.id : i.productId) !== pId));
        window.dispatchEvent(new Event("cartUpdated"));
        
        Swal.fire({
          title: "Moved to Bag!",
          text: "Item is waiting for you in your cart 🛒",
          icon: "success",
          confirmButtonColor: brandColor
        });
      } else {
        const errorData = await res.json();
        Swal.fire({ title: "Notice", text: errorData.message || "Failed to add", icon: "info", confirmButtonColor: brandColor });
      }
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Icons = {
    Overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    Address: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Wishlist: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    User: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  };

  const navItems = [
    { label: "Profile", icon: Icons.User, path: "/profile" },
    { label: "Wishlist", icon: Icons.Wishlist, path: "/wishlist" },
    { label: "Orders", icon: Icons.Orders, path: "/orders" },
    { label: "Addresses", icon: Icons.Address, path: "/address" },
    { label: "Overview", icon: Icons.Overview, path: "/" },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f0f2f5" }}>
        <div className="spinner-border" style={{ color: brandColor }} role="status">
          <span className="visually-hidden">Loading Layout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 📱 MOBILE SIDEBAR HAMBURGER TOGGLE */}
      <div className="d-lg-none p-3 position-fixed top-0 start-0 m-3 rounded-circle shadow-sm bg-white" style={{ zIndex: 1050, cursor: "pointer" }} onClick={toggleSidebar}>
        ☰
      </div>
      
      {/* 🖥️ SHIELDED PERSISTENT BRAND SIDEBAR */}
      <aside 
        className={`d-flex flex-column p-4 ${isSidebarOpen ? "d-flex" : "d-none d-lg-flex"}`} 
        style={{ 
          width: "260px", 
          height: "100vh", 
          position: "fixed", 
          backgroundColor: "#1e293b", 
          color: "#f8fafc", 
          zIndex: 1000,
          transition: "transform 0.3s ease-in-out"
        }}
      >
        <div className="mb-5 mt-2 px-2">
          <h4 className="fw-bolder m-0" style={{ letterSpacing: "1px", color: brandColor }}>My Shop</h4>
        </div>
        
        <nav className="nav flex-column gap-2 flex-grow-1">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`nav-link border-0 d-flex align-items-center gap-3 px-3 py-2 text-start transition-all ${isActive ? 'text-white shadow-sm' : 'text-white-50 bg-transparent hover-light'}`}
                style={{ 
                  borderRadius: "12px", 
                  fontSize: "0.95rem", 
                  fontWeight: isActive ? "600" : "400",
                  backgroundColor: isActive ? brandColor : "transparent"
                }}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="nav-link border-0 text-white-50 d-flex align-items-center gap-3 px-3 py-2 bg-transparent mt-auto hover-light" style={{ borderRadius: "12px" }}>
          {Icons.Logout} <span className="fw-bold">Sign Out</span>
        </button>
      </aside>

      {/* 🎛️ MAIN GRID CONTENT DASHBOARD */}
      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen && window.innerWidth > 991 ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
        
        <header className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>My Wishlist</h1>
            <p className="text-secondary fw-medium">{wishlist.length} premium pieces saved for later</p>
          </div>

          
        </header>

        <div className="card border-0 shadow-lg" style={{ borderRadius: "30px", backgroundColor: "#ffffff" }}>
          <div className="card-body p-5">
            {!userId ? (
              <div className="text-center py-5">
                <h5 className="fw-bold mb-3">Please login to view your wishlist</h5>
                <button onClick={() => navigate("/login")} className="btn btn-primary rounded-pill px-5 fw-bold" style={{ backgroundColor: brandColor, borderColor: brandColor }}>
                  Login Account
                </button>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="fs-1 mb-3" style={{ opacity: 0.3 }}>❤️</div>
                <h5 className="fw-bold text-dark">Your wishlist is empty</h5>
                <p className="small">Explore our catalog and find items you love!</p>
                <button onClick={() => navigate("/")} className="btn btn-outline-dark rounded-pill px-4 mt-2 font-weight-bold btn-sm">Shop Now</button>
              </div>
            ) : (
              <div className="row g-4">
                {wishlist.map((item, index) => {
                  const p = item.product || item;
                  const currentId = item.product?.id || item.productId || p.id;
                  
                  return (
                    <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={currentId || index}>
                      <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden hover-card-premium" style={{ borderRadius: "20px" }}>
                        
                        {/* 🗑️ ABSOLUTE POSITIONED REMOVE ACTION BANNER */}
                        <button
                          type="button"
                          className="btn btn-white shadow-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center trash-icon-btn"
                          style={{ 
                            width: "34px", 
                            height: "34px", 
                            zIndex: 10, 
                            background: "white", 
                            border: "1px solid #e2e8f0",
                            cursor: "pointer" 
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            removeItem(currentId);
                          }}
                        >
                          <i className="bi bi-trash3 text-danger" style={{ fontSize: "14px" }}></i>
                        </button>

                        <div className="ratio ratio-1x1 bg-light cursor-pointer" onClick={() => navigate(`/product/${p.slug || currentId}`)}>
                          <img
                            src={p.imageUrl ? `${IMG}${p.imageUrl}` : "https://via.placeholder.com/400"}
                            className="card-img-top object-fit-cover item-media-element"
                            alt={p.name}
                          />
                        </div>
                        
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="text-dark fw-bold text-truncate mb-1" style={{ fontSize: "0.9rem", cursor: "pointer" }} onClick={() => navigate(`/product/${p.slug || currentId}`)}>
                              {p.name}
                            </h6>
                            {item.size && (
                              <p className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                                Size: <span className="text-dark fw-bold">{item.size}</span>
                              </p>
                            )}
                            <p className="text-dark fw-bold mb-3" style={{ fontSize: "1rem", color: brandColor }}>
                              ₹{p.price}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="btn btn-dark w-100 rounded-pill py-2 fw-bold action-move-bag"
                            onClick={() => handleAddToCart(item)}
                            style={{ fontSize: "0.75rem", backgroundColor: "#1e293b", borderColor: "#1e293b", letterSpacing: "0.5px" }}
                          >
                            MOVE TO BAG
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .hover-light:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .fw-800 { font-weight: 800; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .bg-light-subtle { background-color: #fcfcfd; }
        
        /* Premium Card Interactions Styling */
        .hover-card-premium { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease; border: 1px solid #f1f5f9 !important; }
        .hover-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important; }
        .item-media-element { transition: transform 0.5s ease; }
        .hover-card-premium:hover .item-media-element { transform: scale(1.04); }
        .trash-icon-btn:hover { background-color: #fef2f2 !important; border-color: #fee2e2 !important; }
        .action-move-bag:hover { background-color: ${brandColor} !important; border-color: ${brandColor} !important; }

        @media (max-width: 991px) {
          main { margin-left: 0 !important; padding: 80px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default Wishlist;