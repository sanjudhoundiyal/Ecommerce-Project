import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const API = "http://localhost:8080/api";
  const IMG = "http://localhost:8080";

  // 1. Fetch Wishlist - Wrapped in useCallback for stability
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/wishlist/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, API]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // 2. Remove Item - Logic fix for the button
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
        // Optimistic UI update: remove from state immediately for a fast feel
        setWishlist((prev) => prev.filter((item) => {
          const idInState = item.product ? item.product.id : item.productId;
          return idInState !== productId;
        }));
      } else {
        alert("Failed to remove item from wishlist");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 3. Move to Bag
  const handleAddToCart = async (item) => {
    const product = item.product ? item.product : item;
    const pId = product.id || item.productId;

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
        // Success: Remove from wishlist locally and notify cart
        setWishlist((prev) => prev.filter((i) => (i.product ? i.product.id : i.productId) !== pId));
        window.dispatchEvent(new Event("cartUpdated"));
        alert("Item moved to bag!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Cart error:", err);
      alert("Error adding item to bag!");
    }
  };

  const Icons = {
    Back: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    ),
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="min-vh-100 py-5" style={{ backgroundColor: "#f8f9fa", marginTop: "60px" }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-4 rounded-pill px-3 py-2"
          style={{ width: "fit-content", fontWeight: "600" }}
        >
          {Icons.Back} <span>Go Back</span>
        </button>

        <div className="row g-4">
          <div className="col-lg-9 mx-auto">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px" }}>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-0">My Wishlist</h4>
                  <p className="text-muted small mb-0">{wishlist.length} items saved</p>
                </div>
                <Link to="/" className="btn btn-dark btn-sm rounded-pill px-4">
                  Shop More
                </Link>
              </div>

              {!userId ? (
                <div className="text-center py-5">
                  <h5 className="fw-bold">Please login to see your wishlist</h5>
                  <button onClick={() => navigate("/login")} className="btn btn-dark mt-3 px-5 rounded-pill">
                    Login
                  </button>
                </div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-heart text-muted mb-3" style={{ fontSize: "3rem", opacity: "0.2" }}></i>
                  <h5 className="fw-bold">Your wishlist is empty</h5>
                  <p className="text-muted">Start adding items you love!</p>
                </div>
              ) : (
                <div className="row g-3">
                  {wishlist.map((item, index) => {
                    // Logic to extract data regardless of API structure
                    const p = item.product ? item.product : item;
                 const currentId = item.productId;

                    return (
                      <div className="col-6 col-md-4" key={currentId || index}>
                        <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden" style={{ borderRadius: "12px" }}>
                          
                          {/* REMOVE BUTTON - Logic Fix: uses currentId explicitly */}
                          <button
                            type="button"
                            className="btn btn-white shadow-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ 
                                width: "32px", 
                                height: "32px", 
                                zIndex: 10, 
                                background: "white", 
                                border: "1px solid #eee",
                                cursor: "pointer" 
                            }}
                           onClick={(e) => {
    e.preventDefault();
    e.stopPropagation(); 
    removeItem(item.productId);
}}
                          >
                            <i className="bi bi-trash3 text-danger" style={{ fontSize: "14px" }}></i>
                          </button>

                          <Link to={`/product/${p.slug || currentId}`} className="text-decoration-none">
                            <div className="ratio ratio-1x1 bg-light">
                              <img
                                src={p.imageUrl ? `${IMG}${p.imageUrl}` : "https://via.placeholder.com/400"}
                                className="card-img-top object-fit-cover"
                                alt={p.name}
                              />
                            </div>
                            <div className="card-body p-2">
                              <h6 className="text-dark fw-bold text-truncate mb-1" style={{ fontSize: "0.85rem" }}>
                                {p.name}
                              </h6>
                              
                              <p className="text-muted mb-1" style={{ fontSize: "0.80rem" }}>
                                Size: <span className="text-dark fw-bold">{item.size || "N/A"}</span>
                              </p>

                              <p className="text-dark fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                                ₹{p.price}
                              </p>
                            </div>
                          </Link>

                          <div className="p-2 pt-0">
                            <button
                              type="button"
                              className="btn btn-dark btn-sm w-100 rounded-pill py-2 fw-bold"
                              onClick={() => handleAddToCart(item)}
                              style={{ fontSize: "0.75rem" }}
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
        </div>
      </div>
      <style>{`
        .card-img-top { transition: transform 0.3s ease; }
        .card:hover .card-img-top { transform: scale(1.05); }
        .btn-white:hover { background-color: #fff1f1 !important; border-color: #ffc1c1 !important; }
      `}</style>
    </section>
  );
}

export default Wishlist;