import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8080";

function CategoryProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  // 📦 Data States
  const [originalProducts, setOriginalProducts] = useState([]); // Keeps pristine copy of backend data
  const [filteredProducts, setFilteredProducts] = useState([]); // Rendered array after filter/sort
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [wishlist, setWishlist] = useState([]);

  const [sortBy, setSortBy] = useState("recommended");

  // Consolidated global keyword matcher for electronic/no-size items
  const noSizeKeywords = [
    "watch", "smartwatch", "laptop", "buds", "earbuds", "headphone", "headphones",
    "mobile", "phone", "tablet", "electronics", "electronic", "electric", "tv", 
    "speaker", "camera", "appliance", "appliances", "boat", "iphone", "samsung", 
    "realme", "oneplus", "mi", "oppo", "vivo", "sony", "jbl", "noise", "firebolt", "airpods"
  ];

  const checkNoSizeProduct = (category = "", name = "") => {
    const text = `${category} ${name}`.toLowerCase();
    return noSizeKeywords.some((keyword) => text.includes(keyword));
  };

  // 📥 Initial Fetch when Slug Updates
  useEffect(() => {
    setLoading(true);
 
    setSortBy("recommended");

    fetch(`${API_BASE}/api/products/category/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const safeData = data || [];
        setOriginalProducts(safeData);
        setFilteredProducts(safeData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching category products:", err);
        setLoading(false);
      });
  }, [slug]);

  // ⚙️ Live Processing Matrix (Triggered by dependencies instantly)
  useEffect(() => {
    let items = [...originalProducts];

  
    // 2. Apply Sorting Controls
    if (sortBy === "priceLow") {
      items.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortBy === "priceHigh") {
      items.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    setFilteredProducts(items);
  }, [originalProducts, sortBy]);

  // 🧹 Reset Utility Action
 

  // ✅ Wishlist Data Fetch
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`${API_BASE}/api/wishlist/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setWishlist(data.map((item) => item.id || item.productId));
        })
        .catch(() => console.log("Wishlist fetch failed"));
    }
  }, []);

  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    const userId = Number(localStorage.getItem("userId"));
    const currentSize = selectedSizes[product.id];
    const isNoSizeProduct = checkNoSizeProduct(product.category, product.name);

    if (!userId) {
      Swal.fire({ icon: "warning", title: "Login Required", text: "Please login to use Wishlist ❤️", confirmButtonColor: "#ff3e6c" });
      navigate("/login");
      return;
    }

    if (!isNoSizeProduct && !currentSize) {
      Swal.fire({ icon: "info", title: "Select Size", text: "Please select size before adding to wishlist!", confirmButtonColor: "#ff3e6c" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/wishlist/add?userId=${userId}&productId=${product.id}&size=${currentSize || ""}`, { method: "POST" });
      if (res.ok) {
        setWishlist((prev) => prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]);
        Swal.fire({ icon: "success", title: "Wishlist Updated", text: "Your wishlist has been updated successfully!", confirmButtonColor: "#ff3e6c" });
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleAddToCart = async (product, size, isBuyNow = false) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({ icon: "warning", title: "Login Required", text: "Please login first 🛍️", confirmButtonColor: "#ff3e6c" });
      navigate("/login");
      return;
    }

    const isNoSizeProduct = checkNoSizeProduct(product.category, product.name);
    if (!isNoSizeProduct && !size) {
      Swal.fire({ icon: "info", title: "Select Size", text: "Please select size first!", confirmButtonColor: "#ff3e6c" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: product.id, quantity: 1, size: isNoSizeProduct ? null : size }),
      });

      if (!res.ok) throw new Error();
      await fetchCart();

      if (isBuyNow) {
        navigate("/cart");
      } else {
        Swal.fire({ icon: "success", title: "Added to Cart", text: "Item added to cart 🛒", confirmButtonColor: "#ff3e6c" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error adding to cart!", confirmButtonColor: "#ff3e6c" });
    }
  };

  const handleSizeSelect = (e, productId, size) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="premium-shop-wrapper mt-5">
      <div className="container-fluid px-lg-5">
        <div className="row">
          
         
          {/* 🛍️ DYNAMIC PRODUCTS GRID VIEWPORT */}
          <main className="col-12 ">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
              <h2 className="premium-category-title m-0">
                {slug ? `${slug.replace("-", " ")} Collection` : "Products"}
              </h2>
              
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small fw-medium">{filteredProducts.length} Items Found</span>
                <select 
                  className="form-select premium-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loader-overlay text-center py-5">
                <div className="spinner-border text-pink" role="status"></div>
                <p className="mt-2 text-muted small fw-medium">Loading premium collection...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products text-center py-5">
                <i className="bi bi-bag-x display-4 text-muted"></i>
                <p className="mt-3 fs-5 text-muted fw-light">No items found matching your criteria.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredProducts.map((p) => {
                  const currentSize = selectedSizes[p.id];
                  const initialPrice = p.price || p.finalPrice;
                  const hasDiscount = p.discount > 0 || (p.price && p.finalPrice < p.price);
                  const discountPercentage = p.discount || (hasDiscount ? Math.round(((p.price - p.finalPrice) / p.price) * 100) : 0);
                  const isNoSizeProduct = checkNoSizeProduct(p.category, p.name);
                  const isWishlisted = wishlist.includes(p.id);

                  return (
                    <div key={p.id} className="col-6 col-md-4 col-xl-3">
                      <div className="premium-product-card">
                        
                        <div className="media-box-container" onClick={() => navigate(`/product/${p.slug}`)}>
                          <img src={`${API_BASE}${p.imageUrl}`} alt={p.name} className="premium-image-element" />
                          {hasDiscount && (
                            <div className="premium-discount-badge">-{discountPercentage}% OFF</div>
                          )}

                          <button 
                            className={`wishlist-btn ${isWishlisted ? "active" : ""}`} 
                            onClick={(e) => handleWishlist(e, p)}
                          >
                            <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                          </button>
                        </div>

                        <div className="premium-details-box">
                          <h5 className="premium-product-name" title={p.name} onClick={() => navigate(`/product/${p.slug}`)} style={{cursor: "pointer"}}>
                            {p.name}
                          </h5>
                          
                          <div className="premium-price-matrix">
                            <span className="current-price">₹{p.finalPrice}</span>
                            {hasDiscount && <span className="old-strike-price">₹{initialPrice}</span>}
                          </div>

                          {!isNoSizeProduct && (
                            <div className="premium-size-matrix">
                              {["S", "M", "L", "XL"].map((size) => (
                                <button
                                  key={size}
                                  className={`size-token ${currentSize === size ? "active-token" : ""}`}
                                  onClick={(e) => handleSizeSelect(e, p.id, size)}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="premium-action-row">
                            <button className="action-btn outline-variant" onClick={() => handleAddToCart(p, currentSize, false)}>
                              <i className="bi bi-bag me-1"></i> ADD
                            </button>
                            <button className="action-btn pink-variant" onClick={() => handleAddToCart(p, currentSize, true)}>
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

        </div>
      </div>

      <style>{`
        .premium-shop-wrapper { padding-bottom: 80px; }
        .premium-category-title { font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-size: 1.2rem; color: #282c3f; }
        .text-pink { color: #ff3e6c !important; }
        
        /* Sidebar Styling */
        .filter-sticky-card { background: #ffffff; border: 1px solid #eaeaec; padding: 20px; border-radius: 4px; position: sticky; top: 20px; }
        .premium-filter-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #282c3f; letter-spacing: 0.5px; }
        .btn-clear-all { border: none; background: transparent; color: #ff3e6c; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; }
        .btn-clear-all:hover { text-decoration: underline; }
        .filter-section-block { margin-bottom: 15px; }
        .filter-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #282c3f; margin-bottom: 8px; display: block; }
        .premium-filter-input { font-size: 13px; border: 1px solid #d4d5d9; padding: 8px 12px; border-radius: 4px; color: #282c3f; }
        .premium-filter-input:focus { border-color: #ff3e6c; box-shadow: none; }
        
        /* Dropdown Sorting Styling */
        .premium-sort-select { font-size: 13px; font-weight: 600; width: 200px; padding: 8px 12px; border-radius: 4px; border: 1px solid #d4d5d9; color: #282c3f; cursor: pointer; background-color: #fafbfc; }
        .premium-sort-select:focus { border-color: #ff3e6c; box-shadow: none; }

        /* Card Styling */
        .premium-product-card {
          background: #ffffff; border: 1px solid #eaeaec; border-radius: 0px;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
          display: flex; flex-direction: column; height: 100%; position: relative;
        }
        .premium-product-card:hover { box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08); transform: translateY(-4px); border-color: #d4d5d9; }

        .media-box-container { position: relative; aspect-ratio: 3 / 4; overflow: hidden; cursor: pointer; background: #f9f9f9; }
        .premium-image-element { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.6s ease; }
        .premium-product-card:hover .premium-image-element { transform: scale(1.04); }

        .premium-discount-badge {
          position: absolute; bottom: 10px; left: 10px; background: rgba(255, 62, 108, 0.95);
          color: #ffffff; font-size: 10px; padding: 3px 8px; font-weight: 700; letter-spacing: 0.5px; border-radius: 2px; z-index: 2;
        }

        .wishlist-btn { 
          position: absolute; top: 10px; right: 10px; background: white; border: none; width: 32px; height: 32px; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
          z-index: 5; transition: 0.3s; color: #666; cursor: pointer; 
        }
        .wishlist-btn.active { color: #ff3e6c; }

        .premium-details-box { padding: 12px 14px; flex-grow: 1; display: flex; flex-direction: column; }
        .premium-product-name { font-size: 13px; color: #3e4152; font-weight: 700; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .premium-price-matrix { margin-bottom: 10px; display: flex; align-items: baseline; }
        .current-price { font-weight: 800; font-size: 15px; color: #282c3f; }
        .old-strike-price { text-decoration: line-through; color: #9496a5; font-size: 12px; margin-left: 8px; font-weight: 500; }

        .premium-size-matrix { display: flex; gap: 5px; margin-bottom: 15px; flex-wrap: wrap; }
        .size-token { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #d4d5d9; background: #fff; font-size: 10px; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #282c3f; }
        .size-token:hover { border-color: #282c3f; }
        .size-token.active-token { border-color: #282c3f; background-color: #282c3f; color: #ffffff; }

        .premium-action-row { display: flex; gap: 6px; flex-direction: column; margin-top: auto; }
        .action-btn { width: 100%; padding: 9px 6px; font-size: 11px; font-weight: 800; border-radius: 4px; text-transform: uppercase; transition: 0.2s; cursor: pointer; letter-spacing: 0.5px; }
        .outline-variant { background: #fff; border: 1px solid #d4d5d9; color: #282c3f; }
        .outline-variant:hover { border-color: #282c3f; background-color: #fafbfc; }
        .pink-variant { background: #ff3e6c; border: 1px solid #ff3e6c; color: #fff; }
        .pink-variant:hover { background-color: #e6355e; border-color: #e6355e; }

        @media (min-width: 576px) {
          .premium-action-row { flex-direction: row; }
          .action-btn { flex: 1; }
        }
      `}</style>
    </div>
  );
}

export default CategoryProducts;