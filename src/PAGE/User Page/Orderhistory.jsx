import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");
  const BASE_URL = "http://localhost:8080";

  // --- Theme Colors ---
  const colors = {
    bg: "#f4f7f9",
    white: "#ffffff",
    textMain: "#1e293b",
    textMuted: "#64748b",
    primary: "#ff3f6c", // Indigo
    border: "#e2e8f0",
    success: "#10b981"
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/orders/user/${userId}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, navigate]);

  const Icons = {
    Back: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    )
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
        <div>Loading Securely...</div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* MAIN CONTENT */}
      <main className="flex-grow-1" style={{ padding: "60px 80px" }}>
        {location.pathname !== "/profile" && (
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-4 rounded-pill px-3 py-2" 
            style={{ width: "fit-content", fontWeight: "600" }}
          >
            {Icons.Back} <span>Go Back</span>
          </button>
        )}

        <header style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "34px", fontWeight: "800", color: colors.textMain, letterSpacing: "-1px" }}>My Purchase History</h2>
          <p style={{ color: colors.textMuted, fontWeight: "500" }}>Manage and track your recent orders</p>
        </header>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "50px" }}>📦</div>
            <h3>No orders yet</h3>
            <p>When you buy items, they will appear here.</p>
            <button 
              onClick={() => navigate("/")} 
              style={{ background: "#ff3f6c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginTop: "15px" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const calculatedTotal = order.orderItems?.reduce((sum, item) => {
              const price = item.product?.price || item.price || 0;
              return sum + (price * item.quantity);
            }, 0) || 0;
            
            const totalAmount = order.totalAmount > 0 ? order.totalAmount : calculatedTotal;

            const renderAddress = () => {
              const addr = order?.address || order?.userAddress;
              if (!addr || typeof addr !== "object") return <span style={{ display: "block", marginTop: "4px" }}>Address not available</span>;

              const parts = [
                addr.houseNo,
                addr.street,
                addr.area,
                addr.city,
                addr.state,
                addr.pincode
              ]
              .map(v => (v ? v.toString().trim() : ""))
              .filter(v => v !== "" && v !== "-" && v !== "null");

              if (parts.length === 0) return <span style={{ display: "block", marginTop: "4px" }}>Address not available</span>;

              return <span style={{ display: "block", marginTop: "4px" }}>{parts.join(", ")}</span>;
            };

            return (
              <div key={order.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                {/* ORDER HEADER */}
                <div style={{ backgroundColor: "#f8fafc", padding: "15px 25px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", display: "block" }}>ORDER PLACED</span>
                    <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", display: "block" }}>TOTAL AMOUNT</span>
                    <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>₹{totalAmount.toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: "auto" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", display: "block" }}>ORDER # {order.id}</span>
                    <div style={{ color: colors.primary, fontWeight: "700", cursor: "pointer" }} onClick={() => navigate(`/order/${order.id}`)}>
                      View Invoice
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  <div style={{ marginBottom: "10px", fontWeight: "700", color: colors.success }}>
                    Status: {order.status ? order.status.toUpperCase() : "PROCESSING"}
                  </div>
                  
                  <div style={{ marginBottom: "15px", fontSize: "14px", color: "#475569" }}>
                    <b>Delivery Address:</b>
                    {renderAddress()}
                  </div>

                  {order.orderItems?.map((item, index) => {
                    const price = item.product?.price || item.price || 0;
                    const discount = item.product?.discount || 0;
                    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          padding: "15px 0",
                          borderBottom: "1px solid #f1f5f9"
                        }}
                      >
                        <img
                          src={
                            item.product?.imageUrl
                              ? `${BASE_URL}${item.product.imageUrl}`
                              : "https://via.placeholder.com/80"
                          }
                          alt={item.product?.name || "Product Image"}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #eee"
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 5px 0", color: colors.textMain, fontSize: "15px" }}>
                            {item.product?.name || "Product"}
                          </h4>

                          <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>
                            Qty: {item.quantity}
                          </p>

                          {discount > 0 && (
                            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px", fontSize: "13px" }}>
                              ₹{price}
                            </span>
                          )}

                          <span style={{ fontWeight: "700", fontSize: "14px", marginTop: "5px", display: "inline-block" }}>
                            ₹{finalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: "15px 25px", backgroundColor: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#64748b" }}>
                  <span>Expected Delivery: <b style={{ color: colors.textMain }}>{order.deliveryDate || "TBD"}</b></span>
                  <button onClick={() => navigate(`/order/${order.id}`)} style={{ background: "#ff3f6c", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Track Package</button>
                </div>
              </div>
            );
          })
        )}
      </main>

      <style>{`
        .fw-800 { font-weight: 800; }
        .transition-all { transition: all 0.2s ease-in-out; }
        @media (max-width: 991px) {
          main { padding: 60px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default OrderHistory;