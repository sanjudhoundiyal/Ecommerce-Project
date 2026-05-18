import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:8080";
  const isSignup = true;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ADMIN",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error message when user starts typing again
    if (status.type === "error") setStatus({ type: "", message: "" });
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const { name, email, password, phone } = formData;

    // 1. Name Validation
    if (name.trim().length < 3) {
      setStatus({ type: "error", message: "Name must be at least 3 characters long." });
      return false;
    }

    // 2. Email Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid official email address." });
      return false;
    }

    // 3. Phone Validation (Exactly 10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setStatus({ type: "error", message: "Enter a valid 10-digit phone number (starts with 6-9)." });
      return false;
    }

    // 4. Password Validation
    if (password.length < 6) {
      setStatus({ type: "error", message: "Security Key must be at least 6 characters long." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run Validation
    if (!validateForm()) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    const endpoint = isSignup ? "/api/admin/register" : "/api/admin/login";

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
        },
        mode: "cors",
        body: JSON.stringify(formData),
      });

      const data = await res.text();

      if (res.ok) {
        setStatus({ type: "success", message: "REGISTRY UPDATED: Admin created successfully!" });
        // Redirect to login after 2 seconds
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        setStatus({ type: "error", message: data || "Registration failed. Email might already exist." });
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setStatus({ 
        type: "error", 
        message: "SYSTEM OFFLINE: Ensure backend is running on port 8080." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerSection}>
          <div style={styles.logoBadge}>MS</div>
          <h2 style={styles.title}>Admin <span style={{ color: "#ff3f6c" }}>Registration</span></h2>
          <p style={styles.subtitle}>Create official administrative credentials</p>
        </div>

        {/* Status Banner Placed Above Form for Better Visibility */}
        {status.message && (
          <div style={{ 
            ...styles.statusBanner, 
            backgroundColor: status.type === "error" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", 
            color: status.type === "error" ? "#ff4d4d" : "#2ecc71", 
            border: `1px solid ${status.type === "error" ? "#ff4d4d" : "#2ecc71"}` 
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>FULL NAME</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>OFFICIAL EMAIL</label>
            <input type="email" name="email" placeholder="admin@myshop.com" value={formData.email} onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>CONTACT NUMBER (10 DIGITS)</label>
            <input 
              type="text" 
              name="phone" 
              placeholder="9876543210" 
              value={formData.phone} 
              maxLength={10}
              // Only allow numbers to be typed
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>SECURITY KEY (MIN 6 CHARS)</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.actionArea}>
            <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.7 : 1}}>
              {loading ? "VALIDATING..." : "CREATE ACCOUNT"}
            </button>
            <button type="button" onClick={() => navigate("/admin")} style={styles.cancelButton}>
              CANCEL & RETURN TO LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a", padding: "20px" },
  card: { background: "#1e293b", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" },
  headerSection: { textAlign: "center", marginBottom: "25px" },
  logoBadge: { width: "45px", height: "45px", background: "#ff3f6c", margin: "0 auto 15px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "20px" },
  title: { fontSize: "22px", fontWeight: "800", color: "#fff", margin: "0" },
  subtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "5px" },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "10px", fontWeight: "bold", color: "#64748b", letterSpacing: "0.5px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", transition: "border 0.3s" },
  actionArea: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" },
  button: { padding: "14px", backgroundColor: "#ff3f6c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
  cancelButton: { backgroundColor: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "10px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", transition: "0.3s" },
  statusBanner: { marginBottom: "20px", padding: "12px", borderRadius: "8px", textAlign: "center", fontSize: "12px", fontWeight: "bold" },
};

export default AdminRegister;