import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  const IMAGE_BASE_URL = "http://localhost:8080";
  const API_BASE_URL = "http://localhost:8080/api";

  // Brand Color Constants
  const BRAND_COLOR = "#ff3e6c";

  // Extended keywords list to match all typos, specific brand naming variations
  const noSizeCategories = [
    "watch", "laptop", "laptoop", "buds", "buts", "earbuds", "ear buts", "headphone", 
    "mobile", "phone", "tablet", "camera", "speaker", "smartwatch", "airpods",
    "airdopes", "vs104", "air dopes"
  ];

  // Robust crash-proof size checker
  const isNoSizeProduct = product && noSizeCategories.some((keyword) => {
    const categoryStr = typeof product.category === 'object' 
      ? product.category?.name 
      : product.category;

    const categoryMatch = categoryStr ? String(categoryStr).toLowerCase().includes(keyword.toLowerCase()) : false;
    const nameMatch = product.name ? String(product.name).toLowerCase().includes(keyword.toLowerCase()) : false;

    return categoryMatch || nameMatch;
  });

  const fetchFeedbacks = useCallback(async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Feedback fetch error:", err);
    }
  }, []);

  const checkWishlistStatus = useCallback(async (productId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const exists = data.some(
            (item) => item.productId === productId || item.product?.id === productId
          );
          setIsWishlisted(exists);
        }
      }
    } catch (err) {
      console.error("Wishlist check error:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setSelectedSize(null); // Clear previous size selection
        const res = await fetch(`${API_BASE_URL}/products/slug/${slug}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        
        if (isMounted) {
          setProduct(data);
          setLoading(false);
          if (data?.id) {
            checkWishlistStatus(data.id);
            fetchFeedbacks(data.id);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug, checkWishlistStatus, fetchFeedbacks]);

  const handleWishlistAction = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to use Wishlist ❤️",
        confirmButtonColor: BRAND_COLOR,
      });
      navigate("/login");
      return;
    }

    if (!isNoSizeProduct && !selectedSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select size first!",
        confirmButtonColor: BRAND_COLOR,
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/wishlist/add?userId=${userId}&productId=${product?.id}&size=${selectedSize || ""}`,
        { method: "POST" }
      );

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        Swal.fire({
          icon: "success",
          title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
          text: isWishlisted ? "Item removed successfully." : "Item added to wishlist ❤️",
          confirmButtonColor: BRAND_COLOR,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to cart 🛒",
        confirmButtonColor: BRAND_COLOR,
      });
      navigate("/login");
      return;
    }

    if (!isNoSizeProduct && !selectedSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select a size first!",
        confirmButtonColor: BRAND_COLOR,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          productId: product?.id,
          quantity: 1,
          size: isNoSizeProduct ? null : selectedSize,
        }),
      });

      if (!res.ok) throw new Error("Add to cart failed");

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Item added to cart 🛒",
        confirmButtonColor: BRAND_COLOR,
        timer: 1500,
        showConfirmButton: false,
      });
      
      setTimeout(() => {
        navigate("/cart");
      }, 1500);
    } catch (err) {
      console.error("Add to Bag Error:", err);
      Swal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: "Could not process addition to cart.",
        confirmButtonColor: BRAND_COLOR,
      });
    }
  };

  const handleBuyNow = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to buy now!",
        confirmButtonColor: BRAND_COLOR,
      });
      navigate("/login");
      return;
    }

    if (!isNoSizeProduct && !selectedSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select a size first!",
        confirmButtonColor: BRAND_COLOR,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          productId: product?.id,
          quantity: 1,
          size: isNoSizeProduct ? null : selectedSize,
        }),
      });

      if (!res.ok) throw new Error("Add failed");

      navigate("/cart");
    } catch (err) {
      console.error("Buy Now Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to process transaction!",
        confirmButtonColor: BRAND_COLOR,
      });
    }
  };

  if (loading)
    return (
      <div className="text-center vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-5 p-5">
        <h3>Product Not Found</h3>
      </div>
    );

  const finalPrice = Math.round(
    (product?.price || 0) * (1 - (product?.discount || 0) / 100)
  );

  const displayCategory = typeof product.category === 'object' 
    ? product.category?.name 
    : product.category;

  return (
    <div className="container" style={{ marginTop: "100px", marginBottom: "80px" }}>
      <div className="row g-lg-5">
        {/* Left Side: Modern Image Gallery Look */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="position-relative overflow-hidden rounded-4 shadow-sm">
            <img
              src={
                product?.imageUrl
                  ? `${IMAGE_BASE_URL}${product.imageUrl}`
                  : "https://via.placeholder.com/600x800"
              }
              className="img-fluid w-100"
              alt={product?.name || "Product Image"}
              style={{
                minHeight: "500px",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
            />
            {(product?.discount || 0) > 0 && (
              <div className="position-absolute top-0 start-0 m-4">
                <span className="badge rounded-pill bg-dark px-3 py-2 fw-bold shadow-sm">
                  {product?.discount}% OFF
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Elegant Details */}
        <div className="col-md-6 d-flex flex-column justify-content-center">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb small text-uppercase tracking-wider">
              <li className="breadcrumb-item">
                <a href="/" className="text-decoration-none text-muted">Home</a>
              </li>
              <li className="breadcrumb-item active fw-bold text-dark">
                {displayCategory || "New Arrival"}
              </li>
            </ol>
          </nav>

          <h1 className="display-5 fw-bold text-dark mb-2" style={{ letterSpacing: "-1px" }}>
            {product?.name}
          </h1>

          <div className="d-flex align-items-center gap-3 mb-4 mt-2">
            <h2 className="display-6 fw-bold mb-0" style={{ color: BRAND_COLOR }}>
              ₹{finalPrice}
            </h2>
            {(product?.discount || 0) > 0 && (
              <span className="text-muted text-decoration-line-through fs-4">
                ₹{product?.price}
              </span>
            )}
          </div>

          {/* Size Selection Area */}
          {!isNoSizeProduct && (
            <div className="mb-4">
              <h6 className="text-uppercase fw-bold small text-muted mb-2">Select Size</h6>
              <div className="d-flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className="btn rounded-pill px-4 transition-all"
                    style={{
                      backgroundColor: selectedSize === s ? BRAND_COLOR : "transparent",
                      color: selectedSize === s ? "#fff" : "#000",
                      border: `1px solid ${selectedSize === s ? BRAND_COLOR : "#000"}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-6">
              <button
                className="btn btn-lg w-100 py-3 rounded-pill fw-bold text-uppercase shadow-sm text-white border-0"
                style={{ backgroundColor: BRAND_COLOR }}
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart3 me-2"></i> Add to Bag
              </button>
            </div>

            <div className="col-12 col-xl-6">
              <button
                className="btn btn-outline-dark btn-lg w-100 py-3 rounded-pill fw-bold text-uppercase shadow-sm"
                onClick={handleBuyNow}
              >
                <i className="bi bi-bag-check-fill me-2"></i> Buy Now
              </button>
            </div>

            <div className="col-12 mt-2">
              <button
                className="btn btn-lg w-100 py-3 rounded-pill fw-bold transition-all border-2 d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: isWishlisted ? BRAND_COLOR : "transparent",
                  color: isWishlisted ? "#fff" : "#000",
                  borderColor: isWishlisted ? BRAND_COLOR : "#000"
                }}
                onClick={handleWishlistAction}
              >
                <span>{isWishlisted ? "WISHLISTED" : "WISHLIST"}</span>
                <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>
            </div>
          </div>

          {/* Description Block */}
          <div className="mb-4">
            <h6 className="text-uppercase fw-bold small text-muted mb-2">Description</h6>
            <p className="text-secondary fs-5 lh-base" style={{ maxWidth: "500px" }}>
              {product?.description ||
                "Discover the essence of modern style and superior quality. Crafted for durability and designed with elegance."}
            </p>
          </div>

          {/* Service Grid */}
          <div className="mt-4 pt-4 border-top">
            <div className="row g-4 text-center text-sm-start">
              <div className="col-6 col-sm-3">
                <div className="small fw-bold"><i className="bi bi-shield-check text-success me-1"></i> Original</div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold"><i className="bi bi-truck text-dark me-1"></i> Fast Ship</div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold"><i className="bi bi-arrow-left-right text-dark me-1"></i> 30-Day</div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold"><i className="bi bi-lock text-dark me-1"></i> Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS SECTION ================= */}
      <div className="row mt-5">
        <div className="col-12">
          <hr />
          <h3 className="fw-bold mb-4">⭐ Customer Reviews</h3>
          
          <div className="row g-4">
            {/* Display reviews list spans across the full layout cleanly */}
            <div className="col-12">
              <div className="ps-0">
                {feedbacks.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-4 text-center text-muted">
                    No reviews yet for this product.
                  </div>
                ) : (
                  feedbacks.map((f, index) => {
                    const currentRating = f?.rating || 0;
                    return (
                      <div key={index} className="border-bottom py-3">
                        <div className="mb-1" style={{ color: "gold" }}>
                          {"★".repeat(currentRating)}
                          {"☆".repeat(Math.max(0, 5 - currentRating))}
                        </div>
                        <p className="mb-1 text-dark fs-6">{f?.comment}</p>
                        <small className="text-muted fw-semibold">
                          — {f?.user?.name || "Verified Buyer"}
                        </small>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;