import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = "http://localhost:8080";

  // --- Theme Colors ---
  const colors = {
    bg: "#f4f7f9",
    white: "#ffffff",
    textMain: "#1e293b",
    textMuted: "#64748b",
    primary: "#ff3f6c", // Pink/Indigo Accent
    border: "#e2e8f0",
    success: "#10b981"
  };

  // 📐 Core Responsive Layout Observer Hooks
  useEffect(() => {
    handleResizeFix();
    window.addEventListener("resize", handleResizeFix);
    return () => window.removeEventListener("resize", handleResizeFix);
  }, []);

  const handleResizeFix = () => {
    if (window.innerWidth <= 991) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  };

  useEffect(() => {
    if (window.innerWidth <= 991) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // 📥 Fetch user orders
  const fetchOrders = useCallback(async () => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setLoading(false);
      navigate("/login");
      return;
    }
    setUserId(currentUserId);

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/orders/user/${currentUserId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Icons = {
    Overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    Address: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Wishlist: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    User: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Back: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    )
  };

  const navItems = [
    { label: "Profile", icon: Icons.User, path: "/profile" },
    { label: "Wishlist", icon: Icons.Wishlist, path: "/wishlist" },
    { label: "Orders", icon: Icons.Orders, path: "/orders" },
    { label: "Addresses", icon: Icons.Address, path: "/address" },
    { label: "Overview", icon: Icons.Overview, path: "/" },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100vh",
          background: "#f4f7f9",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            border: "5px solid #e2e8f0",
            borderTop: "5px solid #ff3f6c",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "18px",
          }}
        ></div>
        <h3 style={{ color: "#1e293b", fontWeight: "700", marginBottom: "6px" }}>
          Loading Securely...
        </h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Please wait while we fetch your data
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!userId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100vh",
          background: "#f4f7f9",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "70px", marginBottom: "15px" }}>🔒</div>
        <h2 style={{ color: "#1e293b", fontWeight: "800", marginBottom: "10px" }}>
          Please Login First
        </h2>
        <p style={{ color: "#64748b", marginBottom: "22px", fontSize: "15px" }}>
          You must login to access this page
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "#ff3f6c",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            transition: "0.3s",
          }}
        >
          Go To Login
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 📱 MOBILE SIDEBAR HAMBURGER TOGGLE */}
      <div className="d-lg-none p-3 position-fixed top-0 start-0 m-3 rounded-circle shadow-sm bg-white" style={{ zIndex: 1050, cursor: "pointer" }} onClick={toggleSidebar}>
        ☰
      </div>

      {/* 🖥️ SHIELDED PERSISTENT BRAND SIDEBAR */}
      <aside 
        className={`d-flex flex-column p-4 ${isSidebarOpen ? "d-flex" : "d-none d-lg-flex"}`} 
        style={{ 
          width: "260px", 
          height: "100vh", 
          position: "fixed", 
          backgroundColor: "#1e293b", 
          color: "#f8fafc", 
          zIndex: 1000,
          transition: "transform 0.3s ease-in-out"
        }}
      >
        <div className="mb-5 mt-2 px-2">
          <h4 className="fw-bolder m-0" style={{ letterSpacing: "1px", color: colors.primary }}>My Shop</h4>
        </div>
        
        <nav className="nav flex-column gap-2 flex-grow-1">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`nav-link border-0 d-flex align-items-center gap-3 px-3 py-2 text-start transition-all ${isActive ? 'text-white shadow-sm' : 'text-white-50 bg-transparent hover-light'}`}
                style={{ 
                  borderRadius: "12px", 
                  fontSize: "0.95rem", 
                  fontWeight: isActive ? "600" : "400",
                  backgroundColor: isActive ? colors.primary : "transparent"
                }}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="nav-link border-0 text-white-50 d-flex align-items-center gap-3 px-3 py-2 bg-transparent mt-auto hover-light" style={{ borderRadius: "12px" }}>
          {Icons.Logout} <span className="fw-bold">Sign Out</span>
        </button>
      </aside>

      {/* 🎛️ MAIN CONTENT PANEL */}
      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen && window.innerWidth > 991 ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
       

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

                <div style={{ padding: "15px 25px", backgroundColor: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", justifycontent: "space-between", alignItems: "center", fontSize: "13px", color: "#64748b" }}>
                  <span>Expected Delivery: <b style={{ color: colors.textMain }}>{order.deliveryDate || "TBD"}</b></span>
                  <button onClick={() => navigate(`/order/${order.id}`)} style={{ background: "#ff3f6c", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginLeft: "auto" }}>Track Package</button>
                </div>
              </div>
            );
          })
        )}
      </main>

      <style>{`
        .hover-light:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .fw-800 { font-weight: 800; }
        .transition-all { transition: all 0.2s ease-in-out; }
        @media (max-width: 991px) {
          main { margin-left: 0 !important; padding: 80px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default OrderHistory;