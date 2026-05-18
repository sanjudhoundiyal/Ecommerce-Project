import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Reusable fetch function
  const fetchOrderDetails = useCallback(() => {
    if (!id) return;

    fetch(`http://localhost:8080/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        setOrderData(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Order load failed ❌");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ 2. Initial Load
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // ✅ 3. Fixed Cancel Logic
  const handleCancelOrder = async (orderId) => {
    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/cancel/${orderId}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        const message = await response.text();
        Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          text: message || "Order Cancelled Successfully ✅",
          confirmButtonColor: "#ff3e6c",
        });
        // Update the UI by fetching fresh data
        fetchOrderDetails();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Cancel Order",
          text: "Failed to cancel order. It might already be processed.",
          confirmButtonColor: "#ff3e6c",
        });
      }
    } catch (err) {
      console.error("Cancel Error:", err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Network error. Please try again.",
        confirmButtonColor: "#ff3e6c",
      }   );
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading order...</div>;
  }

  // ✅ SAFETY CHECK
  if (!orderData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>No order found ❌</div>;
  }

  // ✅ TRACKING LOGIC
  const steps = ["PLACED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStep = steps.indexOf(orderData.status?.toUpperCase());

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* HEADER */}
        <button onClick={() => navigate(-1)} style={styles.back}>
          ← Back
        </button>

        <h2>Order #{orderData.id}</h2>
        <p>Status: <b style={{ color: orderData.status === 'CANCELLED' ? '#ef4444' : '#22c55e' }}>{orderData.status}</b></p>

        {/* 🚚 TRACKING BAR (Hidden if Cancelled) */}
        {orderData.status !== "CANCELLED" && (
          <div style={styles.trackingWrapper}>
            <div style={styles.line}></div>
            <div
              style={{
                ...styles.progress,
                width: currentStep >= 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : "0%",
              }}
            ></div>
            {steps.map((step, i) => (
              <div key={i} style={styles.step}>
                <div
                  style={{
                    ...styles.circle,
                    background: i <= currentStep ? "#22c55e" : "#e5e7eb",
                    color: i <= currentStep ? "#fff" : "#000",
                  }}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <p style={styles.label}>{step.replaceAll("_", " ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* 🛒 ITEMS */}
        <div>
          <h3>Items</h3>
          {orderData.orderItems?.map((item, index) => (
            <div key={index} style={styles.item}>
              <img
                src={`http://localhost:8080${item.product?.imageUrl}`}
                style={styles.img}
                alt={item.product?.name}
                onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }} 
              />
              <div style={{ flex: 1 }}>
                <h4>{item.product?.name}</h4>
                <p>Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 📦 SUMMARY */}
        <div style={styles.summary}>
          <h3>Summary</h3>
          <p><b>Total:</b> ₹{orderData.totalAmount}</p>
          
          {/* ✅ DYNAMIC CANCEL BUTTON */}
          {orderData.status !== "CANCELLED" && orderData.status !== "DELIVERED" ? (
            <button 
              onClick={() => handleCancelOrder(orderData.id)} 
              style={styles.cancelBtn}
            >
              Cancel Order
            </button>
          ) : (
            orderData.status === "CANCELLED" && (
              <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>This order has been cancelled.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// 🎨 STYLES (Keep as you had them)
const styles = {
  wrapper: { padding: "30px", background: "#f9fafb", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "800px", margin: "auto", background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  back: { marginBottom: "10px", cursor: "pointer", border: "none", background: "none", color: "#ff3f6c", fontWeight: "600" },
  trackingWrapper: { position: "relative", display: "flex", justifyContent: "space-between", margin: "40px 0" },
  line: { position: "absolute", top: "18px", left: 0, right: 0, height: "4px", background: "#e5e7eb" },
  progress: { position: "absolute", top: "18px", left: 0, height: "4px", background: "#22c55e", transition: "width 0.3s ease" },
  step: { textAlign: "center", flex: 1, zIndex: 2 },
  circle: { width: "36px", height: "36px", borderRadius: "50%", lineHeight: "36px", margin: "auto", fontWeight: "bold", transition: "all 0.3s ease" },
  label: { fontSize: "12px", marginTop: "6px" },
  item: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  img: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" },
  summary: { marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" },
  cancelBtn: {
    marginTop: "15px",
    padding: "10px 24px",
    backgroundColor: "#fff",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s"
  }
};

export default OrderDetails;