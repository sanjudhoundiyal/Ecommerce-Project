import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // State to track which items are selected (Default: all selected)
  const [selectedItems, setSelectedItems] = useState(
    cartItems.map((item) => item.id)
  );



  useEffect(() => {
  setSelectedItems(cartItems.map((item) => item.id));
}, [cartItems]);
  // Toggle selection for a single item
  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id) 
        : [...prev, id]
    );
  };


   useEffect(() => {
    const handleCartUpdate = () => {
      window.location.reload();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);


  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  // Calculation Logic (Updated to only count selectedItems)
  const filteredItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const subtotal = filteredItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  const totalDiscount = filteredItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    return acc + (price * (discount / 100)) * item.quantity;
  }, 0);

  const deliveryCharge =
    subtotal - totalDiscount > 1000 || subtotal === 0 ? 0 : 50;
  const finalTotal = subtotal - totalDiscount + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="text-center p-5 shadow-sm rounded-4 bg-white"
          style={{ maxWidth: "400px" }}
        >
          <div className="display-1 text-muted mb-3">🛒</div>
          <h2 className="fw-bold">Your bag is empty</h2>
          <p className="text-muted mb-4">Add something to make me happy!</p>
          <button
            className="btn btn-dark btn-lg w-100 rounded-pill shadow"
            onClick={() => navigate("/")}
          >
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ marginTop: "120px", marginBottom: "100px" }}
    >
      <div className="row g-4 justify-content-center">
        {/* LEFT SIDE: PRODUCT LIST */}
        <div className="col-lg-7">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              {/* Select All Checkbox */}
              <input
                type="checkbox"
                className="form-check-input me-3 shadow-none"
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                onChange={toggleSelectAll}
              />
              <h4 className="fw-bold m-0">Shopping Bag</h4>
            </div>
            <span className="badge bg-dark rounded-pill px-3 py-2">
              {cartItems.length} Items
            </span>
          </div>

          {cartItems.map((item) => {
            const p = item.product || {};
            const price = p.price || 0;
            const discount = p.discount || 0;
            const discountedPrice =
              discount > 0 ? price * (1 - discount / 100) : price;
            const isSelected = selectedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`card border-0 shadow-sm rounded-4 mb-3 overflow-hidden transition-all ${
                  !isSelected ? "opacity-75" : ""
                }`}
              >
                <div className="card-body p-3">
                  <div className="row align-items-center">
                    {/* SELECTION CHECKBOX */}
                    <div className="col-1 text-center">
                      <input
                        type="checkbox"
                        className="form-check-input shadow-none"
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </div>

                    <div className="col-3 col-md-2">
                      <img
                        src={
                          p.imageUrl
                            ? `http://localhost:8080${p.imageUrl}`
                            : "https://via.placeholder.com/150"
                        }
                        alt={p.name}
                        className="img-fluid rounded-3"
                        style={{
                          objectFit: "cover",
                          height: "100px",
                          width: "100%",
                        }}
                      />
                    </div>

                    <div className="col-8 col-md-9 d-flex flex-column flex-md-row justify-content-between align-items-md-center ps-4">
                      <div className="mb-2 mb-md-0">
                        <h6
                          className="fw-bold mb-1 text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {p.name}
                        </h6>
                        {/* THE FIX: Dynamic size rendering with an explicit fallback to "M" */}
{(() => {
  const noSizeCategories = [
    "watch",
    "laptop",
    "laptoop",
    "buds",
    "buts",
    "earbuds",
    "ear buts",
    "headphone",
    "mobile",
    "phone",
    "tablet",
    "camera",
    "speaker",
    "smartwatch",
    "airpods",
    "airdopes",
    "vs104",
    "air dopes",
  ];

  const categoryText = `
    ${p.name || ""}
    ${p.categoryName || ""}
    ${p.subCategoryName || ""}
  `.toLowerCase();

  const isElectronic = noSizeCategories.some((keyword) =>
    categoryText.includes(keyword)
  );

  return (
    item.size &&
    !isElectronic &&
    !["N/A", "NA", "null", "One Size", "Default", "M"].includes(item.size) &&
    item.size.trim() !== "" && (
      <p className="text-muted small d-block mb-2">
        Size: <span className="text-dark fw-medium">{item.size}</span>
      </p>
    )
  );
})()}
                        <div
                          className="d-flex align-items-center border rounded-pill bg-light p-1"
                          style={{ width: "fit-content" }}
                        >
                          <button
                            className="btn btn-sm btn-white rounded-circle shadow-sm px-2 py-0"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            {" "}
                            −{" "}
                          </button>
                          <span className="px-3 small fw-bold">
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-sm btn-white rounded-circle shadow-sm px-2 py-0"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            {" "}
                            +{" "}
                          </button>
                        </div>
                      </div>

                      <div className="text-md-end">
                        <h5 className="fw-bold mb-0">
                          ₹{(discountedPrice * item.quantity).toLocaleString()}
                        </h5>
                        {discount > 0 && (
                          <div className="small">
                            <span className="text-muted text-decoration-line-through me-2">
                              ₹{(price * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-danger fw-bold">
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                        <button
                          className="btn btn-sm text-danger mt-2 p-0 border-0 bg-transparent text-uppercase fw-bold"
                          style={{ fontSize: "11px", letterSpacing: "1px" }}
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE: PRICE SUMMARY */}
        <div className="col-lg-4 ps-lg-5">
          <div
            className="card border-0 shadow rounded-4 p-4 sticky-top"
            style={{ top: "140px", backgroundColor: "#fdfdfd" }}
          >
            <h5 className="fw-bold mb-4">
              Price Summary ({selectedItems.length} Items)
            </h5>

            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Total MRP</span>
              <span className="fw-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 text-success">
              <span>Discount</span>
              <span className="fw-medium">- ₹{totalDiscount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Delivery</span>
              <span
                className={
                  deliveryCharge === 0 ? "text-success fw-bold" : "fw-medium"
                }
              >
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>

            <hr className="my-4" />

            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5">Total Amount</span>
              <span className="fw-bold fs-4 text-dark">
                ₹{finalTotal.toLocaleString()}
              </span>
            </div>

            <button
             className="btn w-100 py-3 rounded-pill fw-bold shadow-sm mb-3"
style={{ backgroundColor: "#ff3f6c", borderColor: "#ff3f6c", color: "white" }}
              disabled={selectedItems.length === 0}
      onClick={() => {

  localStorage.setItem(
    "selectedCheckoutItems",
    JSON.stringify(filteredItems)
  );

  navigate("/addresspage");
}}
            >
              PROCEED TO CHECKOUT
            </button>

            <div className="text-center">
              <small className="text-muted">
                Secure Checkout • 30 Day Returns
              </small>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .btn-white { background: white; border: 1px solid #eee; }
        .form-check-input:checked { background-color: #000; border-color: #000; }
      `}</style>
    </div>
  );
}

export default Cart;