import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";

function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [wishlist, setWishlist] = useState([]);

  // 🎛️ Refined Professional Filter States (Using Dropdowns now)
  const [categoryInput, setCategoryInput] = useState("");
  const [subcategoryInput, setSubcategoryInput] = useState(slug || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("recommended"); 

  const API = "http://localhost:8080/api/products";

  // ✅ Keep subcategory filter synced if URL slug changes
  useEffect(() => {
    if (slug) {
      setSubcategoryInput(slug);
    }
  }, [slug]);

  // 📥 Fetch Categories List for Dropdown
  useEffect(() => {
    fetch("http://localhost:8080/api/categories/list")
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // 📥 Fetch Subcategories List for Dropdown
  useEffect(() => {
    fetch("http://localhost:8080/api/subcategories")
      .then((res) => res.json())
      .then((data) => setSubcategories(data || []))
      .catch((err) => console.error("Error fetching subcategories:", err));
  }, []);

  // ✅ Products that DON'T need sizes
  const noSizeKeywords = [
    "watch", "smartwatch", "laptop", "buds", "earbuds", "headphone", "headphones",
    "mobile", "electronics", "electronic", "electric", "electricity", "tv", "speaker",
    "camera", "appliance", "appliances", "boat", "iphone", "samsung", "realme",
    "oneplus", "mi", "oppo", "vivo", "sony", "jbl", "noise", "firebolt",
  ];

  const createSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // ✅ Check if size should be hidden
  const checkNoSizeProduct = (category = "", name = "") => {
    const text = `${category} ${name}`.toLowerCase();
    return noSizeKeywords.some((keyword) => text.includes(keyword));
  };

  // 🔄 Fetch Filtered Products from Backend & Apply Live Sorting
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      let url = `${API}/filter?`;

      if (categoryInput?.trim()) {
        url += `category=${createSlug(categoryInput)}&`;
      }

      if (subcategoryInput?.trim()) {
        url += `subcategory=${createSlug(subcategoryInput)}&`;
      }

      if (minPrice !== "") {
        url += `minPrice=${minPrice}&`;
      }

      if (maxPrice !== "") {
        url += `maxPrice=${maxPrice}&`;
      }

      console.log("FILTER URL => ", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");

      let data = await res.json();
      let items = [...data];

      // ✅ Sorting
      if (sortBy === "priceLow") {
        items.sort((a, b) => a.price - b.price);
      }
      if (sortBy === "priceHigh") {
        items.sort((a, b) => b.price - a.price);
      }

      setProducts(items);
    } catch (err) {
      console.error("Filter Error:", err);
      setProducts([]);
    } bits: {
      setLoading(false);
    }
  };

  // ✅ Fetch on initial mount, slug shift, or sort criteria change
  useEffect(() => {
    fetchFilteredProducts();
  }, [slug, sortBy]);

  // 🧹 Reset All Filters Action
  const handleResetFilters = () => {
    setCategoryInput("");
    setSubcategoryInput(slug || "");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("recommended");
    
    setLoading(true);
    const fallbackParam = slug ? `?subcategory=${slug}` : "";
    fetch(`${API}/filter${fallbackParam}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // ✅ Fetch Wishlist
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:8080/api/wishlist/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setWishlist(data.map((item) => item.id || item.productId));
        })
        .catch(() => console.log("Wishlist fetch failed"));
    }
  }, []);

  // ✅ Wishlist Handler
  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    const userId = Number(localStorage.getItem("userId"));
    const currentSize = selectedSizes[product.id];
    const isNoSizeProduct = checkNoSizeProduct(product.category, product.name);

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to use Wishlist ❤️",
        confirmButtonColor: "#ff3e6c",
      });
      navigate("/login");
      return;
    }

    if (!isNoSizeProduct && !currentSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select size before adding to wishlist!",
        confirmButtonColor: "#ff3e6c",
      });
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/wishlist/add?userId=${userId}&productId=${product.id}&size=${currentSize || ""}`,
        { method: "POST" }
      );
      if (res.ok) {
        setWishlist((prev) =>
          prev.includes(product.id)
            ? prev.filter((id) => id !== product.id)
            : [...prev, product.id]
        );
      }
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  // ✅ Add To Cart
  const handleAddToCart = async (product, size, isBuyNow = false) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login first 🛍️",
        confirmButtonColor: "#ff3e6c",
      });
      navigate("/login");
      return;
    }

    const isNoSizeProduct = checkNoSizeProduct(product.category, product.name);

    if (!isNoSizeProduct && !size) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select size first!",
        confirmButtonColor: "#ff3e6c",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: product.id,
          quantity: 1,
          size: isNoSizeProduct ? null : size,
        }),
      });

      if (!res.ok) throw new Error();
      await fetchCart();

      if (isBuyNow) {
        navigate("/cart");
      } else {
        Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: "Item added to cart 🛒",
          confirmButtonColor: "#ff3e6c",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error adding to cart!",
        confirmButtonColor: "#ff3e6c",
      });
    }
  };

  // ✅ Size Select
  const handleSizeSelect = (e, productId, size) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="shop-wrapper-fullscreen mt-4">
      {/* 🎛️ FIXED LEFT SIDEBAR FILTER DRAWER MODULE */}
      <aside className="fullscreen-filter-sidebar">
        <div className="sidebar-inner-scroll">
          <h4 className="filter-heading">Filters</h4>
          
          {/* CATEGORY DROPDOWN */}
          <div className="filter-group">
            <label>Category</label>
            <select 
              className="form-select filter-input" 
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.name || cat}>
                  {cat.name || cat}
                </option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY DROPDOWN */}
          <div className="filter-group">
            <label>Subcategory</label>
            <select 
              className="form-select filter-input" 
              value={subcategoryInput}
              onChange={(e) => setSubcategoryInput(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((sub, index) => (
                <option key={index} value={sub.name || sub}>
                  {sub.name || sub}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range (₹)</label>
            <div className="d-flex gap-2">
              <input 
                type="number" 
                className="form-control filter-input" 
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input 
                type="number" 
                className="form-control filter-input" 
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions mt-4">
            <button className="btn-pink w-100 mb-2 py-2" onClick={fetchFilteredProducts}>
              Apply Filters
            </button>
            <button className="btn-outline w-100 py-2" onClick={handleResetFilters}>
              Clear All
            </button>
          </div>
        </div>
      </aside>

      {/* 🛍️ FULLSCREEN RIGHT CONTAINER CATALOG */}
      <main className="fullscreen-products-content">
        {/* 🏷️ HEAD BAR MODULE */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom px-2">
          <h2 className="category-title m-0">{slug ? `${slug} Edition` : "All Products"}</h2>
          
          <div className="d-flex align-items-center gap-3 native-sort-wrapper">
            <span className="text-muted small fw-medium">{products.length} Items Available</span>
            <select 
              className="form-select real-ecommerce-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID FLUID INLINE AREA */}
        {loading ? (
          <div className="loader-box">Loading matching items...</div>
        ) : products.length === 0 ? (
          <div className="no-products text-center py-5">
            <i className="bi bi-search display-4 text-muted"></i>
            <p className="mt-3 fs-5 text-muted">No products found matching these filter criteria.</p>
          </div>
        ) : (
          <div className="row g-4 m-0 layout-fluid-row">
            {products.map((p) => {
              const currentSize = selectedSizes[p.id];
              const hasDiscount = p.discount > 0;
              const dPrice = hasDiscount ? p.price - (p.price * p.discount) / 100 : p.price;
              const isNoSizeProduct = checkNoSizeProduct(p.category, p.name);
              const isWishlisted = wishlist.includes(p.id);

              return (
                <div key={p.id} className="col-12 col-sm-6 col-md-4 col-xl-3 fluid-grid-card">
                  <div className="elite-card">
                    {/* IMAGE */}
                    <div className="image-container" onClick={() => navigate(`/product/${p.slug}`)}>
                      <img src={`http://localhost:8080${p.imageUrl}`} alt={p.name} />
                      {hasDiscount && <div className="discount-tag">-{p.discount}%</div>}

                      {/* WISHLIST */}
                      <button 
                        className={`wishlist-btn ${isWishlisted ? "active" : ""}`} 
                        onClick={(e) => handleWishlist(e, p)}
                      >
                        <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div className="elite-details">
                      <h5 className="product-name">{p.name}</h5>
                      <div className="delivery-info">{p.deliveryDays || "Express Delivery"}</div>

                      <div className="price-box">
                        <span className="price-new">₹{Math.round(dPrice)}</span>
                        {hasDiscount && <span className="price-old">₹{p.price}</span>}
                      </div>

                      {/* SIZE SELECTION */}
                      {!isNoSizeProduct && (
                        <div className="size-row">
                          {["S", "M", "L", "XL"].map((s) => (
                            <button
                              key={s}
                              className={`size-circle ${currentSize === s ? "active" : ""}`}
                              onClick={(e) => handleSizeSelect(e, p.id, s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="action-btns">
                        <button className="btn-outline" onClick={() => handleAddToCart(p, currentSize)}>
                          <i className="bi bi-bag me-1"></i> ADD
                        </button>
                        <button className="btn-pink" onClick={() => handleAddToCart(p, currentSize, true)}>
                          BUY NOW
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        /* True Premium E-Commerce Layout Structure Shifts */
        .shop-wrapper-fullscreen {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          background-color: #ffffff;
          overflow-x: hidden;
        }

        /* Fixed Full Left Panel Filter Strip */
        .fullscreen-filter-sidebar {
          width: 320px;
          min-width: 320px;
          border-right: 1px solid #eaeaec;
          background: #ffffff;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 99;
          padding-top: 80px; 
        }
        
        .sidebar-inner-scroll {
          padding: 24px;
          height: 100%;
          overflow-y: auto;
        }

        /* Content Container Shifts Completely Right */
        .fullscreen-products-content {
          flex-grow: 1;
          margin-left: 320px;
          padding: 40px 30px 100px 30px;
          width: calc(100vw - 320px);
        }

        .category-title { 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 2px; 
          font-size: 1.3rem; 
          color: #282c3f; 
        }
        
        .real-ecommerce-sort-dropdown {
          width: 200px;
          font-size: 13px;
          border-radius: 4px;
          border: 1px solid #d4d5d9;
          padding: 8px 12px;
          cursor: pointer;
          color: #282c3f;
          font-weight: 600;
          background-color: #fafbfc;
        }
        .real-ecommerce-sort-dropdown:focus {
          box-shadow: none;
          border-color: #ff3e6c;
        }

        .filter-heading { 
          font-size: 1.1rem; 
          font-weight: 800; 
          border-bottom: 1px solid #eaeaec; 
          padding-bottom: 14px; 
          margin-bottom: 24px; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          color: #282c3f;
        }
        .filter-group { margin-bottom: 22px; }
        .filter-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #282c3f; margin-bottom: 8px; display: block; letter-spacing: 0.5px; }
        .filter-input { font-size: 13px; padding: 10px 14px; border-radius: 4px; border: 1px solid #d4d5d9; color: #282c3f; width: 100%; background-color: #fff; }
        .filter-input:focus { border-color: #ff3e6c; box-shadow: none; background: #fff; }

        .layout-fluid-row {
          width: 100% !important;
        }

        .elite-card { background: #fff; border: 1px solid #eaeaec; border-radius: 0px; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); display: flex; flex-direction: column; height: 100%; position: relative; }
        .elite-card:hover { box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06); transform: translateY(-4px); border-color: #d4d5d9; }
        .image-container { position: relative; aspect-ratio: 1/1.25; overflow: hidden; cursor: pointer; background: #fafbfc; }
        .image-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .elite-card:hover img { transform: scale(1.04); }
        .discount-tag { position: absolute; bottom: 12px; left: 12px; background: #ff3e6c; color: #fff; font-size: 11px; padding: 3px 8px; font-weight: 700; z-index: 2; border-radius: 2px; }
        .wishlist-btn { position: absolute; top: 12px; right: 12px; background: #ffffff; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); z-index: 5; transition: 0.25s; color: #9496a5; cursor: pointer; }
        .wishlist-btn:hover { transform: scale(1.08); color: #282c3f; }
        .wishlist-btn.active { color: #ff3e6c; }
        .elite-details { padding: 16px; flex-grow: 1; display: flex; flex-direction: column; }
        .product-name { font-size: 14px; color: #3e4152; font-weight: 700; margin: 0px 0px 4px 0px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.2px; }
        .delivery-info { font-size: 11px; color: #03a685; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.4px; }
        .price-box { margin-bottom: 14px; display: flex; align-items: baseline; }
        .price-new { font-weight: 800; font-size: 16px; color: #282c3f; }
        .price-old { text-decoration: line-through; color: #9496a5; font-size: 12px; margin-left: 8px; font-weight: 500; }
        .size-row { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
        .size-circle { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #d4d5d9; background: #fff; font-size: 11px; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #282c3f; }
        .size-circle:hover { border-color: #282c3f; }
        .size-circle.active { border-color: #282c3f; background-color: #282c3f; color: #ffffff; border-width: 1px; }
        .action-btns { display: flex; gap: 8px; flex-direction: column; margin-top: auto; }
        .btn-outline, .btn-pink { width: 100%; padding: 11px 8px; font-size: 11px; font-weight: 800; border-radius: 4px; text-transform: uppercase; transition: 0.2s; cursor: pointer; letter-spacing: 0.5px; }
        .btn-outline { background: #fff; border: 1px solid #d4d5d9; color: #282c3f; }
        .btn-outline:hover { border-color: #282c3f; background-color: #fafbfc; }
        .btn-pink { background: #ff3e6c; border: 1px solid #ff3e6c; color: #fff; }
        .btn-pink:hover { background-color: #e6355e; border-color: #e6355e; }
        .loader-box { height: 40vh; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #282c3f; letter-spacing: 0.5px; font-size: 14px; }
        
        /* Dynamic Responsive Layout Overrides */
        @media (max-width: 991.98px) {
          .fullscreen-filter-sidebar {
            display: none; 
          }
          .fullscreen-products-content {
            margin-left: 0px;
            width: 100vw;
            padding: 24px 16px;
          }
        }

        @media (min-width: 576px) {
          .action-btns { flex-direction: row; }
          .btn-outline, .btn-pink { flex: 1; }
        }
      `}</style>
    </div>
  );
}

export default Product;