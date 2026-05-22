import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../PAGE/User Page/CartContext";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8080";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [activeHover, setActiveHover] = useState(null);
  const [noResult, setNoResult] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(storedWishlist.length);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY || window.pageYOffset;
      setIsScrolled(offset > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(search);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories/list`)
      .then((res) => res.json())
      .then(async (data) => {
        const categoriesList = data || [];
        setCategories(categoriesList);

        const subDataMap = {};
        for (const cat of categoriesList) {
          try {
            const key = cat.slug.toLowerCase();
            const res = await fetch(`${API_BASE}/api/subcategories/category/slug/${key}`);
            const subRes = await res.json();
            subDataMap[key] = subRes || [];
          } catch (err) {
            console.error(`Failed to load subcategories for ${cat.slug}`, err);
          }
        }
        setSubMap(subDataMap);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff3f6c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();

        localStorage.removeItem("userId");
localStorage.removeItem("address");
localStorage.removeItem("selectedAddressId");
        setIsLoggedIn(false);
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been logged out successfully",
          confirmButtonColor: "#ff3f6c",
        }).then(() => {
          navigate("/login");
        });
      }
    });
  };

  const handleSearch = async (value) => {
    const query = value.trim();
    if (!query) {
      setProducts([]);
      setNoResult(false);
      return;
    }

    try {
      setLoadingSearch(true);
      const res = await fetch(`${API_BASE}/api/products/search?keyword=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      const filtered = Array.isArray(data)
        ? data.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        : [];

      if (filtered.length > 0) {
        setProducts(filtered);
        setNoResult(false);
      } else {
        setProducts([]);
        setNoResult(true);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally { // 👈 यहाँ स्पेलिंग ठीक कर दी गई है (finally)
      setLoadingSearch(false);
    }
  };

  const isHomePage = location.pathname === "/";

  return (
    <>
      <style>{`
        :root {
          --nav-bg: #ffffff;
          --text-main: #111827;
          --text-muted: #6b7280;
          --accent: #000000;
          --border: rgba(0,0,0,0.08);
          --hover-bg: #f3f4f6;
          --nav-height: 80px;
        }

        .main-nav-container {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 9999;
          padding: 12px 16px;
          transition: all 0.3s ease;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .main-nav-container.is-scrolled { padding: 8px 16px; }

        .nav-wrapper {
          width: 100%; 
          max-width: 100%; 
          margin: 0 auto;
          background: var(--nav-bg);
          border: 1px solid var(--border);
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px 8px 20px;
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          box-sizing: border-box; 
        }
        
        .is-scrolled .nav-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .nav-section { display: flex; align-items: center; }
        
        .nav-section.left { flex: 2; display: flex; gap: 12px; align-items: center; }
        .nav-section.right { flex: 1; justify-content: flex-end; gap: 8px; min-width: max-content; }

        .brand-logo { font-weight: 800; font-size: 1.1rem; letter-spacing: 1px; color: var(--accent); text-transform: uppercase; white-space: nowrap; }

        .category-links { display: none; }
        @media (min-width: 1024px) { 
          .category-links { 
            display: flex; 
            gap: 2px; 
            margin-left: 10px; 
            align-items: center; 
            flex-wrap: nowrap;
          } 
        }

        .nav-item-container { position: relative; padding: 10px 0; }
        
        .nav-link-text { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); cursor: pointer; padding: 8px 12px; border-radius: 20px; transition: 0.2s; white-space: nowrap; }
        .nav-link-text:hover { color: var(--accent); background: var(--hover-bg); }

        .mega-dropdown { 
          position: absolute; 
          top: 100%; 
          left: 50%;
          transform: translateX(-50%);
          background: white; 
          min-width: 200px; 
          border-radius: 12px; 
          padding: 6px; 
          border: 1px solid var(--border); 
          box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
          z-index: 100000;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .dropdown-item { 
          padding: 10px 16px; 
          font-size: 0.85rem; 
          color: var(--text-main);
          font-weight: 500;
          border-radius: 8px; 
          cursor: pointer; 
          transition: 0.2s; 
          white-space: nowrap;
        }
        .dropdown-item:hover { background: var(--hover-bg); color: #ff3f6c; }

        .search-box { background: var(--hover-bg); border-radius: 100px; padding: 6px 14px; display: none; align-items: center; width: 140px; border: 1px solid transparent; transition: all 0.3s ease; }
        @media (min-width: 1150px) { .search-box { display: flex; } } 
        .search-box:focus-within { width: 180px; border-color: #cbd5e1; background: #fff; }
        .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.85rem; }

        .utility-icons { display: flex; align-items: center; gap: 2px; }
        .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-main); position: relative; }
        .icon-btn:hover { background: var(--hover-bg); }

        .cart-badge { position: absolute; top: 4px; right: 4px; background: #ff3f6c; color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold;}

        .logout-pill { display: none; align-items: center; gap: 6px; background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
        .login-pill { display: none; align-items: center; gap: 6px; background: #e0f2fe; color: #0284c7; border: none; padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
        @media (min-width: 1024px) { .logout-pill, .login-pill { display: flex; } }

        .mobile-toggle { display: flex; }
        @media (min-width: 1024px) { .mobile-toggle { display: none; } }

        .mobile-menu { 
          position: fixed; 
          top: 85px; 
          left: 16px; 
          right: 16px; 
          background: white; 
          border-radius: 20px; 
          padding: 20px; 
          border: 1px solid var(--border); 
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
          z-index: 9998; 
        }
        .mobile-link { padding: 12px 0; border-bottom: 1px solid var(--hover-bg); font-weight: 600; color: var(--text-main); }
        .nav-spacer { height: var(--nav-height); width: 100%; }
        .back-btn { border: none; background: transparent; cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; }
        .back-btn:hover { background: var(--hover-bg); }
      `}</style>

      <nav className={`main-nav-container ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="nav-wrapper">
          <div className="nav-section left">
            <div
              className="brand-logo"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer", marginRight: "10px" }}
            >
              My Shop
            </div>
            {!isHomePage && (
              <button
                className="back-btn"
                onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate("/")}
                title="Go Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            )}

            <div className="category-links">
  {categories.map((cat) => (
    <div
      key={cat.id}
      className="nav-item-container"
      onMouseEnter={() => setActiveHover(cat.slug)}
      onMouseLeave={() => setActiveHover(null)}
    >
      <span
        className="nav-link-text"
        onClick={() => navigate(`/category/${cat.slug}`)}
      >
        {cat.name}
      </span>

      {activeHover === cat.slug &&
        subMap[cat.slug?.toLowerCase()]?.length > 0 && (
          <div className="mega-dropdown">
            {subMap[cat.slug?.toLowerCase()]?.map((sub) => (
              <div
                key={sub.id}
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHover(null);
                  navigate(`/products/${sub.slug}`);
                }}
              >
                {sub.name}
              </div>
            ))}
          </div>
        )}
    </div>
  ))}
</div>
          </div>

          <div className="nav-section right">
            <div className="search-box" style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(search); }}
              />
              <span onClick={() => handleSearch(search)} style={{ cursor: "pointer", marginLeft: "4px" }}>
                🔍
              </span>

              {search && (
                <div style={{ position: "absolute", top: "45px", left: 0, right: 0, background: "#fff", borderRadius: "10px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", zIndex: 999, maxHeight: "300px", overflowY: "auto" }}>
                  {loadingSearch ? (
                    <div style={{ padding: "10px", textAlign: "center" }}>Loading...</div>
                  ) : products.length > 0 ? (
                    products.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/product/${item.slug}`)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                      >
                        <img
                          src={item.imageUrl ? `${API_BASE}${item.imageUrl}` : "https://dummyimage.com/50x50"}
                          alt={item.name}
                          width="45" height="45"
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                        />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#777" }}>₹{item.finalPrice}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "14px" }}>
                      Please Try Again....❌
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="utility-icons">
              <button className="icon-btn mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <button className="icon-btn" onClick={() => navigate("/profile")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              <button className="icon-btn" onClick={() => navigate("/cart")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              <button className="icon-btn" onClick={() => navigate("/wishlist")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
              </button>

              {isLoggedIn ? (
                <button className="logout-pill" onClick={handleLogout}>
                  <span>Logout</span>
                </button>
              ) : (
                <button className="login-pill" onClick={() => navigate("/login")}>
                  <span>Login</span>
                </button>
              )}  
            </div>
          </div>
        </div>

     
        <div className="mobile-menu" style={{ display: isMenuOpen ? 'block' : 'none' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="mobile-link" onClick={() => { navigate(`/category/${cat.slug}`); setIsMenuOpen(false); }}>
              {cat.name}
            </div>
          ))}
          <div className="mobile-link" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>Profile</div>
          <div className="mobile-link" onClick={() => { navigate("/cart"); setIsMenuOpen(false); }}>Cart</div>
          <div className="mobile-link" onClick={() => { navigate("/wishlist"); setIsMenuOpen(false); }}>Wishlist</div>
          {isLoggedIn ? (
            <div className="mobile-link" style={{ color: "#dc2626", border: "none" }} onClick={handleLogout}>Logout</div>
          ) : (
            <div className="mobile-link" style={{ color: "#0284c7", border: "none" }} onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>Login</div>
          )}
        </div>
      </nav>

      <div className="nav-spacer"></div>
    </>
  );
}

export default Navbar;