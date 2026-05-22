import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashbord() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Toggle between Login and Signup
  const [isSignup, setIsSignup] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [activityLogs, setActivityLogs] = useState([]);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080";

  const colors = {
    primary: "#ff3f6c",
    sidebar: "#0f172a",
    bodyBg: "#f8fafc",
    textMain: "#1e293b",
    textMuted: "#64748b",
    success: "#10b981",
    danger: "#ef4444",
    border: "#e2e8f0"
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("admin");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/alladmin`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    const endpoint = isSignup ? "/api/admin/signup" : "/api/admin/login";
    
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isSignup && data.role === "USER") {
          setMessage({ text: "ACCESS DENIED: Standard users cannot enter portal.", isError: true });
        } else {
          setMessage({ 
            text: isSignup ? "REGISTRATION SUCCESSFUL! Please Login." : "SUCCESS: Identity Verified.", 
            isError: false 
          });
          
          if (isSignup) {
            setIsSignup(false); // Switch to login mode after signup
          } else {
            setTimeout(() => {
              setUser(data);
              localStorage.setItem("admin", JSON.stringify(data));
            }, 1500);
          }
        }
      } else {
        setMessage({ text: data.message || "ACTION FAILED: Check credentials.", isError: true });
      }
    } catch (error) {
      setMessage({ text: "SYSTEM ERROR: Server is offline.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  if (!user) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={styles.logoBadge}>MS</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "10px 0" }}>
              MY<span style={{ color: colors.primary }}>SHOP</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              {isSignup ? "Create Admin Account" : "Admin Portal"}
            </p>
          </div>

          {message.text && (
            <div style={{
              ...styles.messageBanner,
              backgroundColor: message.isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
              color: message.isError ? colors.danger : colors.success,
              border: `1px solid ${message.isError ? colors.danger : colors.success}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div style={{ marginBottom: "16px" }}>
                <label style={styles.inputLabel}>FULL NAME</label>
                <input 
                  type="text" 
                  style={styles.inputField} 
                  placeholder="John Doe"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
            )}
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.inputLabel}>OFFICIAL EMAIL</label>
              <input 
                type="email" 
                style={styles.inputField} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={styles.inputLabel}>SECURITY KEY</label>
              <input 
                type="password" 
                style={styles.inputField} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required 
              />
            </div>
            <button type="submit" disabled={loading} style={styles.loginButton}>
              {loading ? "PROCESSING..." : isSignup ? "CREATE ACCOUNT" : "SECURE LOGIN"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button 
              onClick={() => setIsSignup(!isSignup)} 
              style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
            >
              {isSignup ? "Already have access? Login here" : "Need access? Join the Registry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: colors.bodyBg, fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: "260px", backgroundColor: colors.sidebar, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "30px 24px", color: "#fff", fontSize: "18px", fontWeight: "800" }}>MYSHOP</div>
        <nav style={{ flex: 1, padding: "0 16px" }}>
          <div style={{ ...styles.navItem, color: colors.primary }} onClick={() => navigate("/admin/dashboard")}>📊 Overview</div>
          <div style={styles.navItem} onClick={() => navigate("/admin/product")}>📦 Products</div>
          <div style={styles.navItem} onClick={() => navigate("/admin/users")}>👤 Users</div>
          <div style={styles.navItem} onClick={() => navigate("/admin/category")}>📂 Categories</div>
            <div style={styles.navItem} onClick={() => navigate("/admin/subcategory")}>🗂️ Subcategory</div>
              <div style={styles.navItem} onClick={() => navigate("/admin/banner")}>🎉 Banner</div>
          <div style={styles.navItem} onClick={() => navigate("/admin/orders")}>🚚 Orders</div>
          <div style={styles.navItem} onClick={() => navigate("/admin/sellers")}>🏪 Sellers</div>
          <div style={styles.navItem} onClick={() => navigate("/seller/dashboard")}>📊 Seller Panel</div>
          
          {/* CRITICAL UPGRADE: ONLY THIS NEW ECOMMERCE BUTTON ADDED AS REQUESTED */}
    



    <div style={styles.ecommerceBtn} onClick={() => navigate("/")}>
            🛒 Go to My Shop
          </div>
        </nav>


         
        <div style={{ padding: "20px" }}>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={styles.header}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Admin Management</h2>
            <p style={{ fontSize: "12px", color: colors.textMuted, margin: 0 }}>System Administrators Control Panel</p>
          </div>

          <div 
            onClick={() => navigate("/admin/profile")}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
            style={{
              ...styles.profileTrigger,
              backgroundColor: isProfileHovered ? "#f1f5f9" : "transparent"
            }}
          >
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 'bold', fontSize: '14px', color: colors.textMain}}>
                  {user.name}
                </div>
                <div style={{fontSize: '11px', color: colors.textMuted}}>Admin ID: #{user.id}</div>
              </div>
              <div style={{...styles.avatar, background: colors.primary}}>
                {user.name ? user.name[0].toUpperCase() : "A"}
              </div>
          </div>
        </header>

        <div style={{ padding: "32px 40px" }}>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Registered Administrators</h3>
              <button style={styles.viewAllBtn} onClick={fetchLogs}>Refresh Data</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{background: "#f8fafc", textAlign: "left"}}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>EMAIL</th>
                  <th style={styles.th}>ROLE</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
                ) : activityLogs.map((admin) => (
                  <tr key={admin.id} style={styles.tableRow}>
                    <td style={styles.td}>#{admin.id}</td>
                    <td style={{ ...styles.td, fontWeight: "600" }}>{admin.name}</td>
                    <td style={styles.td}>{admin.email}</td>
                    <td style={styles.td}><span style={styles.badge}>{admin.role || "ADMIN"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  loginWrapper: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" },
  loginCard: { background: "#1e293b", padding: "40px", borderRadius: "20px", width: "350px" },
  logoBadge: { width: "50px", height: "50px", background: "#ff3f6c", margin: "0 auto", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" },
  messageBanner: { padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "12px", textAlign: "center", fontWeight: "600" },
  inputLabel: { display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" },
  inputField: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", marginBottom: "15px", boxSizing: "border-box" },
  loginButton: { width: "100%", padding: "12px", background: "#ff3f6c", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  header: { height: "80px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", borderBottom: "1px solid #e2e8f0" },
  profileTrigger: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "6px 12px", borderRadius: "12px", transition: "all 0.2s ease" },
  avatar: { width: "42px", height: "42px", borderRadius: "10px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", boxShadow: "0 4px 6px -1px rgba(255, 63, 108, 0.3)" },
  navItem: { padding: "12px 16px", cursor: "pointer", borderRadius: "8px", color: "#94a3b8", fontWeight: "600", marginBottom: '4px', transition: '0.2s' },
  
  // Custom Executive Style For E-commerce Navigation Toggle Button
  ecommerceBtn: { padding: "12px 16px", cursor: "pointer", borderRadius: "8px", color: "#fff", background: "rgba(255, 63, 108, 0.15)", border: "1px dashed #ff3f6c", fontWeight: "700", marginTop: '24px', transition: '0.2s', fontSize: "13px" },
  
  tableCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" },
  tableHeader: { padding: "20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: 'center' },
  th: { padding: "15px 20px", fontSize: "11px", color: "#64748b", fontWeight: '700', textTransform: 'uppercase' },
  td: { padding: "15px 20px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "#1e293b" },
  badge: { background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: '600' },
  logoutBtn: { width: "100%", padding: "10px", background: "none", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", cursor: "pointer", fontWeight: '600' },
  viewAllBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer", fontSize: '12px', background: '#fff' },
  tableRow: { transition: '0.2s' }
};

export default AdminDashbord;