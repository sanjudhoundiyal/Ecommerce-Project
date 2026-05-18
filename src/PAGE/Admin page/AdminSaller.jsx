import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:8080/api/seller";
  const API = `${BASE_URL}/all`;

  const fetchSellers = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch sellers");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSellers(data);
      } else if (data.data) {
        setSellers(data.data);
      } else {
        setSellers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const deleteSeller = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this seller?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete request failed");

      setSellers((prev) => prev.filter((s) => s.id !== id));
      alert("Seller deleted successfully");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3 style={{ color: "#64748b" }}>Loading Seller Directory...</h3>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px 30px 40px 30px", // Reduced top padding here...
      paddingTop: "100px",            // ...and forced space for fixed Navbar
      background: "#f8fafc", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* Navigation & Header Area */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button 
          onClick={() => navigate("/admin")} 
          className="btn btn-outline-secondary btn-sm mb-4 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h2 style={{ color: "#1e293b", margin: 0, fontWeight: "800", letterSpacing: "-0.5px" }}>
              🏪 Managed Sellers
            </h2>
            <p style={{ color: "#64748b", margin: "5px 0 0 0", fontSize: "14px" }}>
              View and manage all registered shop partners
            </p>
          </div>
          <span style={{ background: "#ff3f6c", color: "#fff", padding: "8px 18px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(255, 63, 108, 0.2)" }}>
            Total: {sellers.length}
          </span>
        </div>

        {/* Table Container */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "10px 20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
            overflowX: "auto"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                <th style={s.th}>ID</th>
                <th style={s.th}>Shop Name</th>
                <th style={s.th}>Owner</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Phone</th>
                <th style={{ ...s.th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "50px", marginBottom: "10px" }}>📦</div>
                    <p style={{ fontWeight: "500" }}>No active sellers found in the database.</p>
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller.id} style={s.tr} className="seller-row">
                    <td style={s.td}><span style={{ color: "#94a3b8", fontWeight: "600" }}>#{seller.id}</span></td>
                    <td style={s.td}><strong style={{ color: "#0f172a" }}>{seller.shopName || "N/A"}</strong></td>
                    <td style={s.td}>{seller.name}</td>
                    <td style={s.td}>{seller.email}</td>
                    <td style={s.td}>{seller.phone || "No contact"}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => deleteSeller(seller.id)}
                        style={s.deleteBtn}
                        onMouseOver={(e) => e.target.style.background = "#dc2626"}
                        onMouseOut={(e) => e.target.style.background = "#ef4444"}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  th: { padding: "20px 10px", color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" },
  td: { padding: "18px 10px", fontSize: "14px", color: "#334155" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    transition: "0.2s",
    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.2)"
  }
};

export default AdminSellers;