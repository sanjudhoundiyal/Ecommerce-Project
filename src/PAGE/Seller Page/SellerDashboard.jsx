import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const navigate = useNavigate();

  const BASE_URL = "http://localhost:8080";

  const theme = {
    primary: "#ff3f6c",
    sidebar: "#0f172a",
    bodyBg: "#f8fafc",
    textMain: "#1e293b",
    textMuted: "#64748b",
    success: "#10b981",
    border: "#e2e8f0"
  };

  // ===============================
  // LOAD SELLER DATA
  // ===============================
  useEffect(() => {
    const savedSeller = localStorage.getItem("sellerData");

    if (!savedSeller) {
      navigate("/seller/login");
      return;
    }

    const seller = JSON.parse(savedSeller);

    fetch(`${BASE_URL}/api/seller/${seller.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Seller not found");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("sellerData", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
        setUser(seller);
      });
  }, [navigate]);

  // ===============================
  // FETCH ORDERS
  // ===============================
  const fetchLogs = async (sellerId) => {
    if (!sellerId) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`${BASE_URL}/api/seller/orders/${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data || []);
      }
    } catch (error) {
      console.log("Order fetch error:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchLogs(user.id);
    }
  }, [user]);

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/seller/login");
  };

  // ===============================
  // LOADING SCREEN
  // ===============================
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: theme.bodyBg
        }}
      >
        <p style={{ color: theme.textMuted, fontWeight: "600" }}>
          Verifying Session...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.bodyBg,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          backgroundColor: theme.sidebar,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            padding: "30px 24px",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "800",
            letterSpacing: "1px"
          }}
        >
          MY SHOP
          <span style={{ color: theme.primary }}> HUB</span>
        </div>

        {/* Scrollable Nav Area */}
        <nav
          style={{
            flex: 1,
            padding: "0 16px",
            overflowY: "auto"
          }}
        >
          <div
            style={{
              ...s.navItem,
              color: "#fff",
              background: theme.primary
            }}
          >
            📊 Dashboard
          </div>

          <div
            style={s.navItem}
            onClick={() => navigate("/seller/add-product")}
          >
            📦 My Products
          </div>

          <div
            style={s.navItem}
            onClick={() => navigate("/seller/orders")}
          >
            🚚 Manage Orders
          </div>
        </nav>

        {/* LOGOUT BUTTON CONTAINER */}
        <div
          style={{
            padding: "20px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "#ff3f6c",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px"
        }}
      >
        {/* HEADER */}
        <header style={s.header}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              Business Overview
            </h2>
            <p style={{ fontSize: "12px", color: theme.textMuted, margin: 0 }}>
              Welcome back, <strong> {user.name}</strong>
            </p>
          </div>

          {/* PROFILE */}
          <div
            onClick={() => navigate("/seller/profile")}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
            style={{
              ...s.profileTrigger,
              backgroundColor: isProfileHovered ? "#f1f5f9" : "transparent"
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: theme.textMain }}>
                {user.shopName || "User Shop"}
              </div>
              <div style={{ fontSize: "11px", color: theme.textMuted }}>
                Seller ID: #{user.id}
              </div>
            </div>

            <div style={{ ...s.avatar, background: theme.primary }}>
              {user.name ? user.name[0].toUpperCase() : "S"}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ padding: "32px 40px" }}>
          {/* TABLE */}
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                Recent Orders for {user.shopName}
              </h3>
              <button style={s.viewAllBtn} onClick={() => fetchLogs(user.id)}>
                Refresh
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={s.th}>Order ID</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: theme.textMuted }}>
                      Loading your data...
                    </td>
                  </tr>
                ) : activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: theme.textMuted }}>
                      No orders found for this account.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((order) => (
                    <tr key={order.id} style={s.tableRow}>
                      <td style={s.td}>#{order.id}</td>
                      <td style={{ ...s.td, fontWeight: "600" }}>
                        {order.user?.name || order.username || "Guest"}
                      </td>
                      <td style={s.td}>₹{order.totalAmount}</td>
                      <td style={s.td}>
                        <span style={{ color: theme.success, fontSize: "12px", fontWeight: "600" }}>
                          ● {order.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  header: {
    height: "80px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    borderBottom: "1px solid #e2e8f0"
  },
  profileTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "12px",
    transition: "all 0.2s ease"
  },
  navItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: "8px"
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold"
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden"
  },
  tableHeader: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  th: {
    padding: "15px 20px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  td: {
    padding: "15px 20px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#1e293b"
  },
  viewAllBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontSize: "12px",
    background: "#fff"
  },
  tableRow: {
    transition: "0.2s"
  }
};

export default SellerDashboard;