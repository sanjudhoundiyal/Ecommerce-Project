import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import Swal from "sweetalert2";
function Product() {
  const { slug } = useParams();
  const navigate = useNavigate(); // ✅ Declared once
  const { fetchCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [wishlist, setWishlist] = useState([]); // Array of product IDs

  const API = "http://localhost:8080/api/products";

  // ✅ Fetch Products
  useEffect(() => {
    if (!slug) return;

    fetch(`${API}/subcategory/${slug.toLowerCase()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  // ✅ Fetch User's Wishlist on mount (to show active hearts)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:8080/api/wishlist/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          // Assuming API returns array of objects, map to IDs
          setWishlist(data.map(item => item.id || item.productId));
        })
        .catch(() => console.log("Wishlist fetch failed"));
    }
  }, []);

const handleWishlist = async (e, product) => {
  e.stopPropagation();

  const userId = Number(localStorage.getItem("userId"));
  const currentSize = selectedSizes[product.id]; // Get size for this product

  // 1. Check Login
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

  // 2. Check if Size is selected (The "Popup" logic)
  if (!currentSize) {
    Swal.fire({
  icon: "info",
  title: "Select Size",
  text: "Please select size before adding to wishlist!",
  confirmButtonColor: "#ff3e6c",
});
    return;
  }

  try {
    // Note: If your backend wishlist table doesn't store size, 
    // you might need to update your API to accept it.
    const res = await fetch(
      `http://localhost:8080/api/wishlist/add?userId=${userId}&productId=${product.id}&size=${currentSize}`,
      {
        method: "POST"
      }
    );

    if (res.ok) {
      setWishlist((prev) =>
        prev.includes(product.id)
          ? prev.filter((id) => id !== product.id)
          : [...prev, product.id]
      );
    } else {
      console.error("Wishlist failed");
    }
  } catch (err) {
    console.error("Wishlist error", err);
  }
};
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
    if (!size) {
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
        body: JSON.stringify({ userId, productId: product.id, quantity: 1, size })
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

  const handleSizeSelect = (e, productId, size) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  if (loading) return <div className="loader-box">Loading...</div>;

  return (
    <div className="shop-wrapper mt-5">
      <div className="container">
        <h2 className="category-title">{slug} Edition</h2>
        <div className="row g-4">
          {products.map((p) => {
            const currentSize = selectedSizes[p.id];
            const hasDiscount = p.discount > 0;
            const dPrice = hasDiscount ? p.price - (p.price * p.discount / 100) : p.price;
            const isWishlisted = wishlist.includes(p.id);

            return (
              <div key={p.id} className="col-6 col-md-4 col-lg-3">
                <div className="elite-card">
                  <div className="image-container" onClick={() => navigate(`/product/${p.slug}`)}>
                    <img src={`http://localhost:8080${p.imageUrl}`} alt={p.name} />
                    {hasDiscount && <div className="discount-tag">-{p.discount}%</div>}
                    
                    <button 
                      className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                      onClick={(e) => handleWishlist(e, p)}
                    >
                      <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                    </button>
                  </div>

                  <div className="elite-details">
                   
                    <h5 className="product-name">{p.name}</h5>

                    <div className="delivery-info">
                       <i ></i> {p.deliveryDays || "Express Delivery"}
                    </div>

                    <div className="price-box">
                      <span className="price-new">₹{Math.round(dPrice)}</span>
                      {hasDiscount && <span className="price-old">₹{p.price}</span>}
                    </div>

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
      </div>

      <style>{`
        .shop-wrapper { padding-bottom: 100px; }
        .category-title { font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin-bottom: 40px; font-size: 1.5rem;}
        
        .elite-card { 
          background: #fff; border: 1px solid #eee; border-radius: 4px; transition: 0.3s;
          display: flex; flex-direction: column; height: 100%; position: relative;
        }
        .elite-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.05); transform: translateY(-3px); }

        .image-container { position: relative; aspect-ratio: 1/1.2; overflow: hidden; cursor: pointer; }
        .image-container img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .elite-card:hover img { transform: scale(1.05); }

        .discount-tag { position: absolute; top: 10px; left: 10px; background: #000; color: #fff; font-size: 10px; padding: 2px 8px; font-weight: bold; z-index: 2;}

        .wishlist-btn {
          position: absolute; top: 10px; right: 10px; background: white; border: none;
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); z-index: 5;
          transition: 0.3s; color: #666; cursor: pointer;
        }
        .wishlist-btn:hover { transform: scale(1.1); color: #ff3e6c; }
        .wishlist-btn.active { color: #ff3e6c; }

        .elite-details { padding: 15px; flex-grow: 1; }
        .brand-label { font-size: 11px; font-weight: 900; color: #1a1a1a; letter-spacing: 0.5px; display: block; }
        .product-name { font-size: 14px; color: #4d4d4d; font-weight: 400; margin: 5px 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .delivery-info { font-size: 11px; color: #28a745; font-weight: 600; margin-bottom: 10px; }

        .price-box { margin-bottom: 15px; }
        .price-new { font-weight: 700; font-size: 17px; color: #000; }
        .price-old { text-decoration: line-through; color: #999; font-size: 13px; margin-left: 8px; }

        .size-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;}
        .size-circle { 
          width: 34px; height: 34px; border-radius: 50%; border: 1px solid #ddd; 
          background: #fff; font-size: 11px; font-weight: 700; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .size-circle.active { border-color: #000; border-width: 2px; }

        .action-btns { display: flex; gap: 8px; flex-direction: column; margin-top: auto; }
        .btn-outline, .btn-pink { 
          width: 100%; padding: 10px; font-size: 11px; font-weight: 800; border-radius: 4px;
          text-transform: uppercase; transition: 0.3s; cursor: pointer;
        }
        .btn-outline { background: #fff; border: 1px solid #ddd; color: #333; }
        .btn-pink { background: #ff3e6c; border: none; color: #fff; }

        .loader-box { height: 50vh; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        @media (min-width: 768px) {
           .action-btns { flex-direction: row; }
           .btn-outline, .btn-pink { padding: 10px 5px; flex: 1; }
        }
      `}</style>
    </div>
  );
}

export default Product;