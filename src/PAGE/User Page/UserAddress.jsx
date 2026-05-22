import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function UserAddress() {
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const BASE_URL = "http://localhost:8080";

  // --- Theme Colors Matching Profile Dashboards ---
  const colors = {
    bg: "#f4f7f9",
    white: "#ffffff",
    textMain: "#1e293b",
    textMuted: "#64748b",
    primary: "#ff3f6c", 
    border: "#e2e8f0",
    success: "#10b981"
  };

  const emptyAddress = {
    fullName: "",
    email: "",
    phone: "",
    houseNo: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
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

  // Wrap fetchAddress in useCallback
  const fetchAddress = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const addressesList = [];

      const [oldRes, newRes] = await Promise.all([
        fetch(`${BASE_URL}/api/addresses/${userId}`),
        fetch(`${BASE_URL}/api/addmoreaddress/user/${userId}`),
      ]);

      if (oldRes.ok) {
        const oldData = await oldRes.json();
        if (oldData && oldData.userId == userId) {
          addressesList.push({
            id: oldData.id || "main",
            ...oldData,
            fullName: oldData.fullName || oldData.name || "",
          });
        }
      }

      if (newRes.ok) {
        const newData = await newRes.json();
        const moreAddresses = Array.isArray(newData) ? newData : [newData];
        moreAddresses.forEach((addr) => {
          if (addr && addr.id) {
            addressesList.push({
              id: addr.id,
              ...addr,
              fullName: addr.fullName || addr.name || "",
            });
          }
        });
      }

      setAddresses(addressesList);

      const savedSelectedId = localStorage.getItem("selectedAddressId");
      const currentSelectedExists = addressesList.some(addr => addr.id == savedSelectedId);

      if (savedSelectedId && currentSelectedExists) {
        setSelectedId(savedSelectedId);
      } else if (addressesList.length > 0) {
        setSelectedId(addressesList[0].id);
        localStorage.setItem("selectedAddressId", addressesList[0].id);
      } else {
        setSelectedId(null);
        localStorage.removeItem("selectedAddressId");
        localStorage.removeItem("address");
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Reset states when userId changes
  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      setSelectedId(null);
      navigate("/login");
      return;
    }

    setAddresses([]);
    setSelectedId(null);
    localStorage.removeItem("selectedAddressId");
    localStorage.removeItem("address");

    fetchAddress();
  }, [userId, fetchAddress, navigate]);

  useEffect(() => {
    if (selectedId && addresses.length > 0) {
      const selectedAddr = addresses.find((addr) => addr.id == selectedId);
      if (selectedAddr) {
        localStorage.setItem("address", JSON.stringify(selectedAddr));
      }
    }
  }, [selectedId, addresses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    try {
      const payload = {
        ...address,
        user: { id: Number(userId) },
        userId: Number(userId)
      };
      const res = await fetch(`${BASE_URL}/api/addmoreaddress/add/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Add address failed");
      await fetchAddress();
      setIsAdding(false);
      setAddress(null);
    } catch (err) {
      console.error(err);
      alert("Address add failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/addmoreaddress/${address.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchAddress();
      setIsEditing(false);
      setAddress(null);
    } catch (err) {
      console.error(err);
      alert("Address update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await fetch(`${BASE_URL}/api/addmoreaddress/${id}`, { method: "DELETE" });
      await fetchAddress();
      if (selectedId == id) {
        setSelectedId(null);
        localStorage.removeItem("selectedAddressId");
        localStorage.removeItem("address");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleSelectAddress = (addr) => {
    const selectedAddr = {
      ...addr,
      fullName: addr.fullName || addr.name || "",
      email: addr.email || "",
    };
    localStorage.setItem("address", JSON.stringify(selectedAddr));
    setSelectedId(addr.id);
    localStorage.setItem("selectedAddressId", addr.id);
    navigate("/checkout");
  };

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
    Back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
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
          Please wait while we fetch your details
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
          You must login to manage shipping details
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

      {/* 🎛️ MAIN CONTENT AREA */}
      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen && window.innerWidth > 991 ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
        
        {/* Global Back Button (Hides ONLY on `/profile`) */}
        

        <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "34px", letterSpacing: "-1px", color: colors.textMain }}>Choose Delivery Address</h1>
            <p style={{ color: colors.textMuted, fontWeight: "500" }}>Manage and select your saved shipping destinations</p>
          </div>
          {!isAdding && !isEditing && (
            <button
              onClick={() => {
                setIsAdding(true);
                setIsEditing(false);
                setAddress(emptyAddress);
              }}
              style={{
                background: "#1e293b", color: "#fff", border: "none",
                padding: "12px 24px", borderRadius: "8px", cursor: "pointer",
                fontWeight: "700", fontSize: "14px", transition: "0.2s"
              }}
            >
              + Add New Address
            </button>
          )}
        </header>

        {(isAdding || isEditing) && (
          <div style={{ marginBottom: "25px", padding: "24px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: colors.textMain }}>{isAdding ? "Add Shipping Address" : "Edit Shipping Address"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <input name="fullName" placeholder="Full Name" value={address?.fullName || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="email" placeholder="Email" value={address?.email || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="phone" placeholder="Phone" value={address?.phone || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="houseNo" placeholder="House / Flat No." value={address?.houseNo || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", gridColumn: "span 2" }} />
              <input name="street" placeholder="Street" value={address?.street || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", gridColumn: "span 2" }} />
              <input name="landmark" placeholder="Landmark" value={address?.landmark || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", gridColumn: "span 2" }} />
              <input name="area" placeholder="Area / Colony" value={address?.area || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="city" placeholder="City" value={address?.city || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="state" placeholder="State" value={address?.state || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              <input name="pincode" placeholder="Pincode" value={address?.pincode || ""} onChange={handleChange} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={isAdding ? handleAdd : handleUpdate} style={{ background: "#ff3f6c", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Save Address</button>
              <button onClick={() => { setIsAdding(false); setIsEditing(false); setAddress(null); }} style={{ background: "#f3f4f6", color: "#111827", border: "1px solid #d1d5db", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div style={{ padding: "45px", border: "1px solid #e2e8f0", borderRadius: "12px", textAlign: "center", background: "#ffffff", color: colors.textMuted }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📍</div>
            No saved addresses found for this account.
          </div>
        ) : (
          addresses.map((addr) => {
            const isSelected = selectedId == addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => handleSelectAddress(addr)}
                style={{
                  display: "flex", gap: "16px", padding: "20px", borderRadius: "14px",
                  border: isSelected ? `2px solid ${colors.primary}` : "1px solid #e2e8f0",
                  background: isSelected ? "#fff5f7" : "#fff", marginBottom: "16px", cursor: "pointer",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", transition: "0.2s"
                }}
              >
                <input type="radio" checked={isSelected} readOnly style={{ width: "18px", height: "18px", accentColor: colors.primary, marginTop: "3px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                    <strong style={{ color: colors.textMain, fontSize: "16px" }}>{addr.fullName || addr.name || "Unnamed"}</strong>
                    <span style={{ color: colors.textMuted, fontWeight: "600", fontSize: "14px" }}>{addr.phone || "-"}</span>
                  </div>
                  <p style={{ margin: "0 0 12px", color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>
                    {addr.houseNo ? `${addr.houseNo}, ` : ""}
                    {addr.street ? `${addr.street}, ` : ""}
                    {addr.landmark ? `${addr.landmark}, ` : ""}
                    {addr.area ? `${addr.area}, ` : ""}
                    {addr.city ? `${addr.city}, ` : ""}
                    {addr.state ? `${addr.state} - ` : ""}
                    {addr.pincode ? addr.pincode : ""}
                  </p>
                  <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsAdding(false); setAddress(addr); }} style={{ color: colors.primary, border: "none", background: "none", cursor: "pointer", textDecoration: "underline", fontWeight: "700", padding: 0 }}>Edit</button>
                    {addr.id !== "main" && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", textDecoration: "underline", fontWeight: "700", padding: 0 }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Styles */}
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

export default UserAddress;