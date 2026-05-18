import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
useEffect(() => {
  const id = location.state?.orderId || localStorage.getItem("lastOrderId");
  if (!id) { navigate("/"); return; }
  setOrderId(id);

  const fetchOrder = async () => {
    try {
      console.log("OrderSuccess fetch id", id);
      console.log("ORDER DATA:", orderData);
console.log("IMAGE:", orderData?.product?.imageUrl);
      
      const res = await fetch(`http://localhost:8080/api/orders/${id}`);
      const data = await res.json();
      console.log("OrderSuccess response", data);
      const order = Array.isArray(data) ? data[0] : data;
      setOrderData(order);
    } catch (err) {
      console.error("Order fetch failed", err);
    }
  };
  fetchOrder();
}, [location.state, navigate]);

  // ✅ Calculate total amount if not provided
  const totalAmount = orderData?.totalAmount || (orderData?.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0);

  return (
    <div className="order-success-wrapper">
      <div className="success-card">
        {/* Animated Checkmark Header */}
        <div className="success-header">
          <div className="check-icon">
            <i className="bi bi-check2-circle"></i>
          </div>
          <h1 className="main-title">Order Confirmed</h1>
          <p className="subtitle">Hooray! Your order is being prepared for shipment.</p>
        </div>

        {/* Tracking Highlights */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Order Number</span>
            <span className="info-value">#{orderId}</span>
          </div>
          <div className="info-item border-start-custom">
            {/* <span className="info-label">Estimated Delivery</span> */}
  
<span className="info-value text-success">
 {orderData?.deliveryDate || "Not Available"}
</span>

          </div>
        </div>

        {/* Total Banner */}
        <div className="total-banner">
          <span className="total-label">Amount Paid</span>
          <h2 className="total-price">₹{totalAmount}</h2>
        </div>

  {orderData?.orderItems?.map(item => (
  <div key={item.id} className="order-item">

    <img
  src={`http://localhost:8080${item?.product?.imageUrl || "/default.png"}`}
  alt="product"
  style={{ width: "100px" }}
/>



    <div>
      <h6>{item.product.name}</h6>
      <p>Qty: {item.quantity}</p>
      <span>₹{item.price}</span>
    </div>

  </div>
))}
        {/* Action Button */}
        <div className="action-footer">
          <button className="btn-continue" onClick={() => navigate("/")}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');

        .order-success-wrapper {
          background: #fdfdfd;
          min-height: 100vh;
          padding: 120px 20px 80px;
          display: flex;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .success-card {
          background: #fff;
          width: 100%;
          max-width: 650px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          border-radius: 4px;
          padding: 40px;
        }

        /* Header Styles */
        .success-header { text-align: center; margin-bottom: 40px; }
        .check-icon { font-size: 70px; color: #198754; line-height: 1; margin-bottom: 15px; }
        .main-title { font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 28px; color: #1a1a1a; }
        .subtitle { color: #888; font-size: 15px; }

        /* Grid Info */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #fafafa;
          border: 1px solid #eee;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .info-item { padding: 20px; text-align: center; }
        .border-start-custom { border-left: 1px solid #eee; }
        .info-label { display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #aaa; margin-bottom: 5px; }
        .info-value { display: block; font-size: 16px; font-weight: 800; color: #222; }

        /* Total Banner */
        .total-banner { 
          text-align: center; 
          background: #000; 
          color: #fff; 
          padding: 20px; 
          border-radius: 4px; 
          margin-bottom: 40px;
        }
        .total-label { font-size: 12px; font-weight: 400; color: #ccc; }
        .total-price { font-weight: 800; margin: 0; font-size: 30px; letter-spacing: -1px; }

        /* Summary Section */
        .summary-title { font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #000; display: inline-block; }
        .item-list { margin-bottom: 30px; }
        .order-item { display: flex; align-items: center; gap: 20px; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
        
        .item-img-box { width: 60px; height: 80px; overflow: hidden; border-radius: 4px; flex-shrink: 0; background: #f0f0f0; }
        .item-img-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .item-name { margin: 0; font-size: 15px; font-weight: 700; color: #1a1a1a; }
        .item-meta { margin: 0; font-size: 12px; color: #777; }
        .item-price-small { font-weight: 800; font-size: 14px; }

        /* Footer Details */
        .summary-footer { background: #fcfcfc; padding: 20px; border-radius: 4px; }
        .footer-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .status-badge { background: #e8f5e9; color: #2e7d32; padding: 2px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .grand-total { border-top: 1px solid #eee; margin-top: 15px; pt: 15px; font-weight: 900; font-size: 18px; color: #000; }

        /* Button */
        .action-footer { text-align: center; margin-top: 40px; }
        .btn-continue { 
          background: #000; 
          color: #fff; 
          border: none; 
          padding: 18px 40px; 
          font-weight: 800; 
          font-size: 13px; 
          letter-spacing: 2px;
          border-radius: 2px;
          transition: 0.3s;
          width: 100%;
        }
        .btn-continue:hover { background: #333; transform: translateY(-2px); }

        @media (max-width: 576px) {
          .success-card { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .border-start-custom { border-left: 0; border-top: 1px solid #eee; }
          .total-price { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}

export default OrderSuccess;