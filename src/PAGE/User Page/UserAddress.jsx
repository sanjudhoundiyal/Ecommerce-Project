import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function UserAddress() {
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const BASE_URL = "http://localhost:8080";

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
  }, [userId, fetchAddress]);

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

  const Icons = {
    Back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading addresses...</div>;
  }

  return (
    <div className="d-flex" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-grow-1" style={{ padding: "60px 80px" }}>
        
        {/* Global Back Button (Hides ONLY on `/profile`) */}
        {location.pathname !== "/profile" && (
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 mb-4 rounded-pill px-3 py-2" 
            style={{ width: "fit-content", fontWeight: "600" }}
          >
            {Icons.Back} <span>Go Back</span>
          </button>
        )}

        <header className="mb-5 d-flex justify-content-between align-items-end">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>Choose Delivery Address</h1>
            <p className="text-secondary fw-medium">Manage and select your saved shipping destinations</p>
          </div>
          {!isAdding && !isEditing && (
            <button
              onClick={() => {
                setIsAdding(true);
                setIsEditing(false);
                setAddress(emptyAddress);
              }}
              style={{
                background: "#1f2937", color: "#fff", border: "none",
                padding: "10px 22px", borderRadius: "8px", cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              + Add New Address
            </button>
          )}
        </header>

        {(isAdding || isEditing) && (
          <div style={{ marginBottom: "25px", padding: "22px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#ffffff" }}>
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
              <button onClick={isAdding ? handleAdd : handleUpdate} style={{ background: "#111827", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "8px", cursor: "pointer" }}>Save Address</button>
              <button onClick={() => { setIsAdding(false); setIsEditing(false); setAddress(null); }} style={{ background: "#f3f4f6", color: "#111827", border: "1px solid #d1d5db", padding: "12px 18px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div style={{ padding: "35px", border: "1px solid #e5e7eb", borderRadius: "12px", textAlign: "center", background: "#ffffff" }}>
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
                  display: "flex", gap: "16px", padding: "18px", borderRadius: "14px",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: isSelected ? "#eef2ff" : "#fff", marginBottom: "14px", cursor: "pointer",
                }}
              >
                <input type="radio" checked={isSelected} readOnly style={{ width: "18px", height: "18px", accentColor: "#2563eb" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>{addr.fullName || addr.name || "Unnamed"}</strong>
                    <span>{addr.phone || "-"}</span>
                  </div>
                  <p style={{ margin: "0 0 10px", color: "#475569", fontSize: "14px" }}>
                    {addr.houseNo ? `${addr.houseNo}, ` : ""}
                    {addr.street ? `${addr.street}, ` : ""}
                    {addr.landmark ? `${addr.landmark}, ` : ""}
                    {addr.area ? `${addr.area}, ` : ""}
                    {addr.city ? `${addr.city}, ` : ""}
                    {addr.state ? `${addr.state} - ` : ""}
                    {addr.pincode ? addr.pincode : ""}
                  </p>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsAdding(false); setAddress(addr); }} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>Edit</button>
                    {addr.id !== "main" && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>Delete</button>
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
        .fw-800 { font-weight: 800; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .tracking-wider { letter-spacing: 0.1em; }
        .bg-light-subtle { background-color: #fcfcfd; }
        @media (max-width: 991px) {
          main { padding: 60px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default UserAddress;