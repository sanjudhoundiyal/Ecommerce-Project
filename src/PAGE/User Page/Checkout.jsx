import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";

function Checkout() {

  const { clearCartUI } = useCart();
  const navigate = useNavigate();

  // ✅ Selected checkout items
  const selectedCartItems = JSON.parse(
    localStorage.getItem("selectedCheckoutItems")
  ) || [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    houseNo: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    paymentMethod: "COD",
    upiApp: "GPay"
  });

  useEffect(() => {
    const address = localStorage.getItem("address");
    const addressId = localStorage.getItem("addressId");

    if (address) {
      const addr = JSON.parse(address);
      setFormData(prev => ({
        ...prev,
        ...addr
      }));
    }

    if (addressId) {
      setSelectedAddressId(addressId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Calculations ---
  const subtotal = selectedCartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  
  const totalDiscount = selectedCartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    return acc + (price * discount / 100) * item.quantity;
  }, 0);

  const deliveryCharge = (subtotal - totalDiscount > 1000 || subtotal === 0) ? 0 : 99;
  const finalTotal = subtotal - totalDiscount + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const userId = localStorage.getItem("userId");

    if (!userId || selectedCartItems.length === 0) {
      alert("User or Cart items missing ❌");
      setIsProcessing(false);
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      alert("User not logged in ❌");
      setIsProcessing(false);
      return;
    }

    if (!selectedCartItems.length || !selectedCartItems[0]?.product?.id) {
      alert("Cart empty or product missing ❌");
      setIsProcessing(false);
      return;
    }
    const payload = {
      fullName: formData.fullName?.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.toString().trim(),
      houseNo: formData.houseNo?.trim(),
      street: formData.street?.trim(),
      area: formData.area?.trim(),
      landmark: formData.landmark?.trim(),
      city: formData.city?.trim(),
      state: formData.state?.trim(),
      country: formData.country?.trim(),
      pincode: formData.pincode?.trim(),
      totalAmount: Number(finalTotal),
      addressId: selectedAddressId,
      userId: user.id,
     orderItems: selectedCartItems.map(item => ({
  productId: item.product?.id || item.productId || item.id,
  quantity: item.quantity,
  price: item.product?.price || item.price
}))
    };

    const res = await fetch("http://localhost:8080/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Order failed ❌ " + errorText,
        confirmButtonColor: "#ff3e6c",
      });
      setIsProcessing(false);
      return;
    }

    const data = await res.json();
    const dbOrderId = data.id;
    localStorage.setItem("lastOrderId", dbOrderId);

    if (formData.paymentMethod === "COD") {
      clearCartUI();
      navigate("/order-success", { state: { orderId: dbOrderId } });
      return;
    }

    const paymentRes = await fetch("http://localhost:8080/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalTotal,
        dbOrderId: dbOrderId
      })
    });

    const paymentData = await paymentRes.json();

    const options = {
      key: "rzp_test_xxxxx", 
      amount: Math.round(paymentData.amount * 100),
      currency: "INR",
      name: "MY SHOP",
      order_id: paymentData.razorpayOrderId,
      handler: async function (response) {
        await fetch("http://localhost:8080/api/payment/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            dbOrderId: dbOrderId,
            method: "ONLINE"
          })
        });

        clearCartUI();
        navigate("/order-success", { state: { orderId: dbOrderId } });
      },
      prefill: {
        name: formData.fullName,
        contact: formData.phone
      },
      theme: { color: "#000000" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="checkout-main">
      <div className="checkout-nav">
        <div className="container d-flex justify-content-between align-items-center h-100">
          
          {/* ✅ BACK BUTTON ADDED HERE */}
          <button 
            type="button"
            className="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center fw-bold" 
            onClick={() => navigate("/cart")}
            style={{ fontSize: "12px", letterSpacing: "1px", zIndex: 10 }}
          >
            <i className="bi bi-arrow-left me-2"></i> RETURN TO CART
          </button>

          <h4 className="logo-text m-0 position-absolute start-50 translate-middle-x">MY SHOP</h4>
          <span className="secure-text"><i className="bi bi-lock-fill"></i> SECURE CHECKOUT</span>
        </div>
      </div>

      <div className="container py-5 mt-5">
        <form onSubmit={handlePlaceOrder} className="row g-5 mt-2">
          
          <div className="col-lg-7">
            <div className="glass-section mb-4">
              <h5 className="section-label">01. CONTACT</h5>
              <div className="row g-3 mt-1">
                <div className="col-md-6 field-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} placeholder="John Doe" required onChange={handleChange} />
                </div>
                <div className="col-md-6 field-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} placeholder="john@example.com" required onChange={handleChange} />
                </div>
                <div className="col-12 field-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} placeholder="+91 98XXX XXXXX" required onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="glass-section mb-4">
              <h5 className="section-label">02. SHIPPING ADDRESS</h5>
              <div className="row g-3 mt-1">
                <div className="col-md-4 field-group">
                  <label>Flat / House No.</label>
                  <input type="text" name="houseNo" value={formData.houseNo} required onChange={handleChange} />
                </div>
                <div className="col-md-8 field-group">
                  <label>Street / Building Name</label>
                  <input type="text" name="street" value={formData.street} required onChange={handleChange} />
                </div>
                <div className="col-md-6 field-group">
                  <label>Area / Colony</label>
                  <input type="text" name="area" value={formData.area} required onChange={handleChange} />
                </div>
                <div className="col-md-6 field-group">
                  <label>Landmark</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} />
                </div>
                <div className="col-md-4 field-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} required onChange={handleChange} />
                </div>
                <div className="col-md-4 field-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} required onChange={handleChange} />
                </div>
                <div className="col-md-4 field-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} required onChange={handleChange} />
                </div>
              </div>
              <button type="button" onClick={() => navigate('/address')} className="btn btn-outline-secondary mt-3">Change Address</button>
            </div>

            <div className="glass-section">
              <h5 className="section-label">03. PAYMENT METHOD</h5>
              <div className="payment-grid mt-3">
                <div className={`pay-card ${formData.paymentMethod === 'COD' ? 'selected' : ''}`} 
                     onClick={() => setFormData({...formData, paymentMethod: 'COD'})}>
                  <div className="pay-circle"></div>
                  <div className="ms-3">
                    <strong>Cash on Delivery</strong>
                    <p className="m-0 text-muted small">Pay at your doorstep</p>
                  </div>
                  <i className="bi bi-truck ms-auto fs-4"></i>
                </div>

                <div className={`pay-card ${formData.paymentMethod === 'UPI' ? 'selected' : ''}`} 
                     onClick={() => setFormData({...formData, paymentMethod: 'UPI'})}>
                  <div className="pay-circle"></div>
                  <div className="ms-3">
                    <strong>Online Payment</strong>
                    <p className="m-0 text-muted small">Cards, UPI, Netbanking</p>
                  </div>
                  <div className="ms-auto">
                    <img src="https://img.icons8.com/color/48/visa.png" width="20" alt="visa" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" width="20" alt="mc" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="sticky-summary">
              <div className="summary-box">
                <h6 className="summary-title">YOUR SELECTION ({selectedCartItems.length})</h6>
                <div className="item-scroll-area">
                  {selectedCartItems.map(item => (
                    <div key={item.id} className="mini-product-card">
                      <div className="img-holder">
                        <img src={`http://localhost:8080${item.product?.imageUrl}`} alt={item.product?.name} />
                        <span className="qty-pill">{item.quantity}</span>
                      </div>
                      <div className="info-holder">
                        <span className="p-name">{item.product?.name}</span>
                        <span className="p-price">₹{((item.product?.price * (1 - item.product?.discount/100))).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="price-stack">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="price-row promo">
                    <span>Discount Applied</span>
                    <span>- ₹{totalDiscount.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>Shipping</span>
                    <span className={deliveryCharge === 0 ? "text-success" : ""}>
                      {deliveryCharge === 0 ? "Complimentary" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="price-row total mt-3 pt-3">
                    <span>Grand Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button type="submit" disabled={isProcessing || selectedCartItems.length === 0} className="order-submit-btn mt-4">
                  {isProcessing ? <span className="spinner-border spinner-border-sm me-2"></span> : "CONFIRM & PAY"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

 <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  /* Main Layout */
  .checkout-main { 
    background: #fafafa; 
    font-family: 'Inter', sans-serif; 
    min-height: 100vh; 
    color: #1a1a1a; 
  }
  
  /* Navbar */
  .checkout-nav { 
    height: 70px; 
    background: #fff; 
    border-bottom: 1px solid #eee; 
    position: fixed; 
    top: 0; 
    width: 100%; 
    z-index: 1000; 
  }
  .logo-text { font-weight: 800; letter-spacing: -1px; }
  .secure-text { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #666; }
  
  /* Left Side - Forms */
  .glass-section { 
    background: #fff; 
    padding: 30px; 
    border-radius: 4px; 
    border: 1px solid #eaeaea; 
  }
  .section-label { 
    font-size: 12px; 
    font-weight: 800; 
    color: #000; 
    letter-spacing: 1.5px; 
    margin-bottom: 25px; 
    border-bottom: 1.5px solid #000; 
    display: inline-block; 
    padding-bottom: 5px; 
  }
  .field-group label { 
    display: block; 
    font-size: 11px; 
    font-weight: 700; 
    text-transform: uppercase; 
    color: #888; 
    margin-bottom: 8px; 
  }
  .field-group input { 
    width: 100%; 
    padding: 12px 0; 
    border: none; 
    border-bottom: 1px solid #ddd; 
    font-size: 14px; 
    transition: 0.3s; 
    outline: none; 
    background: transparent; 
  }
  .field-group input:focus { border-bottom-color: #000; }
  
  /* Payment Cards */
  .payment-grid { display: flex; flex-direction: column; gap: 12px; }
  .pay-card { 
    display: flex; 
    align-items: center; 
    padding: 20px; 
    border: 1px solid #eee; 
    cursor: pointer; 
    transition: 0.3s; 
    border-radius: 4px;
  }
  .pay-card.selected { border-color: #000; background: #fdfdfd; }
  .pay-circle { 
    width: 18px; 
    height: 18px; 
    border: 1px solid #ddd; 
    border-radius: 50%; 
    position: relative; 
  }
  .selected .pay-circle::after { 
    content: ''; 
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%); 
    width: 10px; 
    height: 10px; 
    background: #000; 
    border-radius: 50%; 
  }
  
  /* Right Side - Summary Box */
  .sticky-summary { position: sticky; top: 110px; }
  .summary-box { 
    background: #e8607f; 
    color: #fff; 
    padding: 35px; 
    border-radius: 4px; 
  }
  .summary-title { 
    font-size: 12px; 
    font-weight: 700; 
    letter-spacing: 2px; 
    margin-bottom: 30px; 
    opacity: 0.6; 
  }

  /* Product List & Image Handling */
  .item-scroll-area { 
    max-height: 380px; /* Increased height for 5+ items */
    overflow-y: auto; 
    margin-bottom: 30px; 
    padding-right: 5px;
  }
  
  .mini-product-card { 
    display: flex; 
    gap: 15px; 
    margin-bottom: 20px; 
    align-items: center; 
  }

  .img-holder { 
    position: relative; 
    width: 70px;          /* Adjusted width */
    height: 90px;         /* Adjusted height for better vertical fit */
    flex-shrink: 0; 
    background: #1a1a1a;  /* Background for empty spaces */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    overflow: hidden;
  }

  .img-holder img { 
    width: 100%; 
    height: 100%; 
    object-fit: contain;  /* ✅ FIXED: Now shows full image without cropping */
  }

  .qty-pill { 
    position: absolute; 
    top: -5px; 
    right: -5px; 
    background: #fff; 
    color: #000; 
    font-size: 10px; 
    width: 20px; 
    height: 20px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 800; 
    border-radius: 50%; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .info-holder { flex-grow: 1; }
  .p-name { display: block; font-size: 13px; font-weight: 500; opacity: 0.9; margin-bottom: 4px; }
  .p-price { font-weight: 700; font-size: 14px; }

  /* Pricing */
  .price-stack { border-top: 1px solid #333; padding-top: 20px; }
  .price-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; opacity: 0.8; }
  .promo { color: #55efc4; opacity: 1; }
  .total { opacity: 1; font-weight: 700; font-size: 20px; color: #fff; }
  
  /* Button */
  .order-submit-btn { 
    width: 100%; 
    background: #fff; 
    color: #000; 
    border: none; 
    padding: 18px; 
    font-weight: 800; 
    letter-spacing: 1px; 
    transition: 0.3s; 
    border-radius: 2px; 
    cursor: pointer; 
    text-transform: uppercase;
  }
  .order-submit-btn:hover { background: #eee; }
  .order-submit-btn:disabled { background: #444; color: #888; cursor: not-allowed; }

  /* Custom Scrollbar */
  .item-scroll-area::-webkit-scrollbar { width: 4px; }
  .item-scroll-area::-webkit-scrollbar-track { background: #1a1a1a; }
  .item-scroll-area::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
`}</style>
    </div>
  );
}

export default Checkout;