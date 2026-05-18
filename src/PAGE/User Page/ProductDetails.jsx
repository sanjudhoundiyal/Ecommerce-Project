import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  const IMAGE_BASE_URL = "http://localhost:8080";
  const API_BASE_URL = "http://localhost:8080/api";

  // Check if product is a watch to hide the size option
  const isWatch = product && (
    (product.category && product.category.toLowerCase().includes("watch")) ||
    (product.name && product.name.toLowerCase().includes("watch"))
  );

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

  const handleSubmitFeedback = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to submit feedback!",
        confirmButtonColor: "#ff3e6c",
      });

      navigate("/login");
      return;
    }

    if (rating === 0) {
      Swal.fire({
        icon: "info",
        title: "Select Rating",
        text: "Please select a rating!",
        confirmButtonColor: "#ff3e6c",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
          productId: product.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setRating(0);
        setComment("");
        alert("Feedback submitted successfully!");
        fetchFeedbacks(product.id);
      } else {
        const errText = await res.text();
        alert(errText || "Failed to submit feedback. You must purchase this product before reviewing it.");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      alert("An error occurred while submitting feedback.");
    }
  };

 const handleWishlistAction = async () => {
  const userId = localStorage.getItem("userId");

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

  // ❗ size validation (non-watch)
  if (!isWatch && !selectedSize) {
    Swal.fire({
      icon: "info",
      title: "Select Size",
      text: "Please select size first!",
      confirmButtonColor: "#ff3e6c",
    });
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/wishlist/add?userId=${userId}&productId=${product.id}&size=${selectedSize || ""}`,
      { method: "POST" }
    );

    if (res.ok) {
      setIsWishlisted(!isWishlisted);
      Swal.fire({
        icon: "success",
        title: "Added to Wishlist",
        text: "Item added to wishlist ❤️",
        confirmButtonColor: "#ff3e6c",
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
        confirmButtonColor: "#ff3e6c",
        });
      navigate("/login");
      return;
    }

    // Only validate size if the product is not a watch
    if (!isWatch && !selectedSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size",
        text: "Please select a size first!",
        confirmButtonColor: "#ff3e6c",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          productId: product.id,
          quantity: 1,
          size: isWatch ? null : selectedSize,
        }),
      });

      if (!res.ok) throw new Error("Add to cart failed");

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Item added to cart 🛒",
        confirmButtonColor: "#ff3e6c",
      });
      setTimeout(() => {
        navigate("/cart");
      }, 300);
    } catch (err) {
      console.error("Add to Bag Error:", err);
      alert("Failed to process transaction!");
    }
  };

  const handleBuyNow = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to buy now!",
        confirmButtonColor: "#ff3e6c",
      }); 
      navigate("/login");
      return;
    }

    // Only validate size if the product is not a watch
    if (!isWatch && !selectedSize) {
      Swal.fire({
        icon: "info",
        title: "Select Size", 
        text: "Please select a size first!",
        confirmButtonColor: "#ff3e6c",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          productId: product.id,
          quantity: 1,
          size: isWatch ? null : selectedSize,
        }),
      });

      if (!res.ok) throw new Error("Add failed");

      setTimeout(() => {
        navigate("/cart");
      }, 300);
    } catch (err) {
      console.error("Buy Now Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to process transaction!",
        confirmButtonColor: "#ff3e6c",
      });
    }
  };

  const StarRating = () => (
    <div className="mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            cursor: "pointer",
            fontSize: "24px",
            color: star <= rating ? "gold" : "#ccc",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

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
    product.price * (1 - (product.discount || 0) / 100)
  );

  return (
    <div
      className="container"
      style={{ marginTop: "100px", marginBottom: "80px" }}
    >
      <div className="row g-lg-5">
        {/* Left Side: Modern Image Gallery Look */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="position-relative overflow-hidden rounded-4 shadow-sm">
            <img
              src={
                product.imageUrl
                  ? `${IMAGE_BASE_URL}${product.imageUrl}`
                  : "https://via.placeholder.com/600x800"
              }
              className="img-fluid w-100"
              alt={product.name}
              style={{
                minHeight: "500px",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
            />
            {product.discount > 0 && (
              <div className="position-absolute top-0 start-0 m-4">
                <span className="badge rounded-pill bg-dark px-3 py-2 fw-bold shadow-sm">
                  {product.discount}% OFF
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
                <a href="/" className="text-decoration-none text-muted">
                  Home
                </a>
              </li>
              <li className="breadcrumb-item active fw-bold text-dark">
                {product.category || "New Arrival"}
              </li>
            </ol>
          </nav>

          <h1
            className="display-5 fw-bold text-dark mb-2"
            style={{ letterSpacing: "-1px" }}
          >
            {product.name}
          </h1>

          <div className="d-flex align-items-center gap-3 mb-4 mt-2">
            <h2 className="display-6 fw-bold text-primary mb-0">
              ₹{finalPrice}
            </h2>
            {product.discount > 0 && (
              <span className="text-muted text-decoration-line-through fs-4">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Size Selection Area - Hidden if the product is a watch */}
          {!isWatch && (
            <div className="mb-4">
              <h6 className="text-uppercase fw-bold small text-muted mb-2">
                Select Size
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      console.log("Selected Size:", s);
                      setSelectedSize(s);
                    }}
                    className={`btn rounded-pill px-4 ${
                      selectedSize === s ? "btn-dark" : "btn-outline-dark"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Area with Add to Bag, Buy Now and Wishlist */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-6">
              <button
                className="btn btn-dark btn-lg w-100 py-3 rounded-pill fw-bold text-uppercase shadow-sm"
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
                className={`btn btn-lg w-100 py-3 rounded-pill fw-bold transition-all border-2 d-flex align-items-center justify-content-center gap-2 ${
                  isWishlisted ? "btn-danger border-danger" : "btn-outline-dark"
                }`}
                onClick={handleWishlistAction}
              >
                <span>{isWishlisted ? "WISHLISTED" : "WISHLIST"}</span>
                <i
                  className={`bi ${
                    isWishlisted ? "bi-heart-fill" : "bi-heart"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          {/* ================= FEEDBACK & RATINGS SECTION ================= */}
          <div className="container mt-2 mb-4 p-0">
            <hr />
            <h3 className="fw-bold mb-4">⭐ Customer Reviews</h3>

            {/* ADD FEEDBACK */}
            <div className="p-4 shadow-sm rounded-4 mb-4">
              <h5>Write a Review</h5>
              <StarRating />
              <textarea
                className="form-control mt-2"
                placeholder="Write your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="btn btn-dark mt-3 rounded-pill px-4"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </button>
            </div>

            {/* SHOW FEEDBACK */}
            {feedbacks.length === 0 ? (
              <p>No reviews yet</p>
            ) : (
              feedbacks.map((f, index) => (
                <div key={index} className="border-bottom py-3">
                  <div style={{ color: "gold" }}>
                    {"★".repeat(f.rating)}
                    {"☆".repeat(5 - f.rating)}
                  </div>
                  <p className="mb-1">{f.comment}</p>
                  <small className="text-muted">
                    {f.user?.name || "User"}
                  </small>
                </div>
              ))
            )}
          </div>

          <div className="mb-4">
            <h6 className="text-uppercase fw-bold small text-muted mb-2">
              Description
            </h6>
            <p
              className="text-secondary fs-5 lh-base"
              style={{ maxWidth: "500px" }}
            >
              {product.description ||
                "Discover the essence of modern style and superior quality. Crafted for durability and designed with elegance."}
            </p>
          </div>

          <hr className="my-4 opacity-10" />

          {/* Service Grid */}
          <div className="mt-5 pt-4 border-top">
            <div className="row g-4 text-center text-sm-start">
              <div className="col-6 col-sm-3">
                <div className="small fw-bold">
                  <i className="bi bi-shield-check text-success me-1"></i> Original
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold">
                  <i className="bi bi-truck text-dark me-1"></i> Fast Ship
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold">
                  <i className="bi bi-arrow-left-right text-dark me-1"></i> 30-Day
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="small fw-bold">
                  <i className="bi bi-lock text-dark me-1"></i> Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;