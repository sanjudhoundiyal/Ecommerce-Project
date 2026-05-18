import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../PAGE/User Page/CartContext";

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
  
  // Wishlist Count State
  const [wishlistCount, setWishlistCount] = useState(0);

  // Sync login state whenever location changes or on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    
    // Fetch initial wishlist count from API or localStorage
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

  // Fetch categories and pre-fetch subcategories for all categories on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/categories/list`)
      .then((res) => res.json())
      .then(async (data) => {
        const categoriesList = data || [];
        setCategories(categoriesList);

        // Pre-fetch subcategories for all categories to make hover instant
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
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      setIsLoggedIn(false);
      navigate("/login");
    }
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

      const res = await fetch(
        `${API_BASE}/api/products/search?keyword=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      const filtered = Array.isArray(data)
        ? data.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          )
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
      alert("Search error ❌");
    } finally {
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
  padding: 12px 16px; /* This provides the 'gap' around the pill shape */
  transition: all 0.3s ease;
  font-family: 'Inter', system-ui, sans-serif;
}

        .main-nav-container.is-scrolled { padding: 8px 16px; }

        .nav-wrapper {
         width: 100%; 
  max-width: 100%; 
  
  /* Maintain your existing styles */
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
  
  /* Optional: Add box-sizing to ensure padding doesn't push it off screen */
  box-sizing: border-box; 
}
        

        .is-scrolled .nav-wrapper {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .nav-section { display: flex; align-items: center; }
        .nav-section.left { flex: 1; display: flex; gap: 8px; }
        .nav-section.center { flex: 0; cursor: pointer; }
        .nav-section.right { flex: 1; justify-content: flex-end; gap: 8px; }

        .brand-logo { font-weight: 800; font-size: 1.1rem; letter-spacing: 1px; color: var(--accent); text-transform: uppercase; white-space: nowrap; }

        .category-links { display: none; }
        @media (min-width: 1024px) { .category-links { display: flex; gap: 4px; margin-left: 15px; } }

        .nav-item-container { position: relative; }
        .nav-link-text { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); cursor: pointer; padding: 8px 14px; border-radius: 20px; transition: 0.2s; }
        .nav-link-text:hover { color: var(--accent); background: var(--hover-bg); }

        .mega-dropdown { position: absolute; top: 130%; left: 0; background: white; min-width: 220px; border-radius: 12px; padding: 8px; border: 1px solid var(--border); box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 10000; }
        .dropdown-item { padding: 10px 16px; font-size: 0.85rem; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .dropdown-item:hover { background: var(--hover-bg); color: var(--accent); }

        .search-box { background: var(--hover-bg); border-radius: 100px; padding: 6px 14px; display: none; align-items: center; width: 160px; border: 1px solid transparent; transition: all 0.3s ease; }
        @media (min-width: 768px) { .search-box { display: flex; } }
        .search-box:focus-within { width: 220px; border-color: #cbd5e1; background: #fff; }
        .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.85rem; }

        .utility-icons { display: flex; align-items: center; gap: 2px; }
        .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-main); position: relative; }
        .icon-btn:hover { background: var(--hover-bg); }

        .cart-badge { position: absolute; top: 4px; right: 4px; background: var(--accent); color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

        .logout-pill { display: none; align-items: center; gap: 6px; background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
        .login-pill { display: none; align-items: center; gap: 6px; background: #e0f2fe; color: #0284c7; border: none; padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
        @media (min-width: 1024px) { .logout-pill, .login-pill { display: flex; } }

        .mobile-toggle { display: flex; }
        @media (min-width: 1024px) { .mobile-toggle { display: none; } }

        .mobile-menu { position: fixed; top: 85px; left: 16px; right: 16px; background: white; border-radius: 20px; padding: 20px; border: 1px solid var(--border); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: ${isMenuOpen ? 'block' : 'none'}; z-index: 9998; }
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
              style={{ cursor: "pointer", marginRight: "15px" }}
            >
              My Shop
            </div>
            {!isHomePage && (
              <button
                className="back-btn"
                onClick={() =>
                  window.history.state?.idx > 0 ? navigate(-1) : navigate("/")
                }
                title="Go Back"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            )}

            <div className="category-links">
              {categories.slice(0, 4).map((cat) => (
                <div
                  key={cat.id}
                  className="nav-item-container"
                  onMouseEnter={() => setActiveHover(cat.slug)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <span
                    className="nav-link-text"
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    title={cat.name}
                  >
                    {cat.name}
                  </span>
                  {activeHover === cat.slug &&
                    subMap[cat.slug?.toLowerCase()] && (
                      <div className="mega-dropdown">
                        {subMap[cat.slug?.toLowerCase()]?.map((sub) => (
                          <div
                            key={sub.id}
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${sub.slug}`);
                            }}
                            title={sub.name}
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
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(search);
                  }
                }}
                title="Search Products"
              />

              <span
                onClick={() => handleSearch(search)}
                style={{ cursor: "pointer", marginLeft: "4px" }}
                title="Execute Search"
              >
                🔍
              </span>

              {search && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    zIndex: 999,
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {loadingSearch ? (
                    <div style={{ padding: "10px", textAlign: "center" }}>
                      Loading...
                    </div>
                  ) : products.length > 0 ? (
                    products.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/product/${item.slug}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                        title={item.name}
                      >
                        <img
                          src={
                            item.imageUrl
                              ? `http://localhost:8080${item.imageUrl}`
                              : "https://dummyimage.com/50x50"
                          }
                          alt={item.name}
                          width="45"
                          height="45"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#777" }}>
                            ₹{item.finalPrice}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        color: "#999",
                        fontSize: "14px",
                      }}
                    >
                      Please Try Again....❌
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="utility-icons">
              <button
                className="icon-btn mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Toggle Menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <button
                className="icon-btn"
                onClick={() => navigate("/profile")}
                title="Profile"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              <button
                className="icon-btn"
                onClick={() => navigate("/cart")}
                title="Cart"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              <button
                className="icon-btn"
                onClick={() => navigate("/wishlist")}
                title="Wishlist"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {wishlistCount > 0 && (
                  <span className="cart-badge">{wishlistCount}</span>
                )}
              </button>

              {isLoggedIn ? (
                <button
                  className="logout-pill"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  className="login-pill"
                  onClick={() => navigate("/login")}
                  title="Login"
                >
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mobile-menu">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="mobile-link"
              onClick={() => {
                navigate(`/category/${cat.slug}`);
                setIsMenuOpen(false);
              }}
            >
              {cat.name}
            </div>
          ))}
          <div
            className="mobile-link"
            onClick={() => {
              navigate("/profile");
              setIsMenuOpen(false);
            }}
          >
            Profile
          </div>
          <div
            className="mobile-link"
            onClick={() => {
              navigate("/cart");
              setIsMenuOpen(false);
            }}
          >
            Cart
          </div>
          <div
            className="mobile-link"
            onClick={() => {
              navigate("/wishlist");
              setIsMenuOpen(false);
            }}
          >
            Wishlist
          </div>
          {isLoggedIn ? (
            <div
              className="mobile-link"
              style={{ color: "#dc2626", border: "none" }}
              onClick={handleLogout}
            >
              Logout
            </div>
          ) : (
            <div
              className="mobile-link"
              style={{ color: "#0284c7", border: "none" }}
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              Login
            </div>
          )}
        </div>
      </nav>

      <div className="nav-spacer"></div>
    </>
  );
}

export default Navbar;