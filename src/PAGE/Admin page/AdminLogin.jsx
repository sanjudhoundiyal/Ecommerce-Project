import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Views handle karne ke liye dynamic states: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD" | "VERIFY_OTP"
  const [authMode, setAuthMode] = useState("LOGIN");
  
  // Centralized single object state for all inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ADMIN",
    otp: "",
    newPassword: ""
  });
  
  const [activityLogs, setActivityLogs] = useState([]);
  const [message, setMessage] = useState({ text: "", isError: false });

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080";

  // Check login status on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("admin");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Fetch all admins for the dashboard table
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/alladmin`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data || []);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoadingLogs(false); 
    }
  };

  useEffect(() => { 
    if (user) fetchLogs(); 
  }, [user]);

  // Generic input changes handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {

  e.preventDefault();

  setLoading(true);

  setMessage({
    text: "",
    isError: false
  });

  let endpoint = "/api/admin/login";

  let payload = {};

  // LOGIN
  if (authMode === "LOGIN") {

    endpoint = "/api/admin/login";

    payload = {
      email: formData.email,
      password: formData.password
    };
  }

  // REGISTER
  else if (authMode === "REGISTER") {

    endpoint = "/api/admin/register";

    payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: "ADMIN"
    };
  }

  // FORGOT PASSWORD
  else if (authMode === "FORGOT_PASSWORD") {

    endpoint = "/api/admin/forgot-password";

    payload = {
      email: formData.email
    };
  }

  // VERIFY OTP
  else if (authMode === "VERIFY_OTP") {

    endpoint = "/api/admin/verify-otp";

    payload = {
      email: formData.email,
      otp: formData.otp,
      newPassword: formData.newPassword
    };
  }

  try {

    const res = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const contentType =
      res.headers.get("content-type");

    let data;

    // JSON RESPONSE
    if (
      contentType &&
      contentType.includes("application/json")
    ) {

      data = await res.json();

    }

    // TEXT RESPONSE
    else {

      const textData = await res.text();

      data = {
        message: textData
      };
    }

    // SUCCESS
    if (res.ok) {

      // LOGIN SUCCESS
      if (authMode === "LOGIN") {

        // USER BLOCK
        if (data.role === "USER") {

          setMessage({
            text: "ACCESS DENIED: Admin only.",
            isError: true
          });

          return;
        }

        setMessage({
          text: "Login Successful",
          isError: false
        });

        setUser(data);

        localStorage.setItem(
          "admin",
          JSON.stringify(data)
        );

        // DASHBOARD ROUTE
        navigate("/admin");
      }

      // REGISTER SUCCESS
      else if (authMode === "REGISTER") {

        setMessage({
          text: "Admin Registered Successfully",
          isError: false
        });

        setTimeout(() => {

          // LOGIN PAGE ROUTE
          navigate("/admin/login");

          setAuthMode("LOGIN");

        }, 1500);
      }

      // FORGOT PASSWORD SUCCESS
      else if (
        authMode === "FORGOT_PASSWORD"
      ) {

        setMessage({
          text: "OTP Sent Successfully",
          isError: false
        });

        setAuthMode("VERIFY_OTP");
      }

      // PASSWORD RESET SUCCESS
      else if (
        authMode === "VERIFY_OTP"
      ) {

        setMessage({
          text:
            "Password Updated Successfully",
          isError: false
        });

        setTimeout(() => {

          navigate("/admin/login");

          setAuthMode("LOGIN");

        }, 1500);
      }
    }

    // FAILED
    else {

      setMessage({
        text:
          data.message ||
          "Invalid Credentials",
        isError: true
      });
    }

  } catch (error) {

    console.log(error);

    setMessage({
      text: "Server Connection Failed",
      isError: true
    });

  } finally {

    setLoading(false);
  }
};

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("admin");
    setAuthMode("LOGIN");
    navigate("/admin/login");
  };

  // --- VIEW 1: AUTHENTICATION INTERFACE (LOGIN / REGISTER / FORGOT PW / OTP) ---
  if (!user) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginCard}>
          <div style={styles.logoBadge}>A</div>
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "20px" }}>
            {authMode === "LOGIN" && "Admin Sign In"}
            {authMode === "REGISTER" && "Admin Register"}
            {authMode === "FORGOT_PASSWORD" && "Forgot Password"}
            {authMode === "VERIFY_OTP" && "Reset Password"}
          </h2>
          
          {message.text && (
            <div style={{ ...styles.messageBanner, color: message.isError ? "#ef4444" : "#10b981" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* REGISTER CONDITIONAL FIELDS */}
            {authMode === "REGISTER" && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.inputField}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.inputField}
                  required
                />
              </>
            )}

            {/* COMMON EMAIL FIELD FOR LOGIN, REGISTER, & FORGOT PASSWORD */}
            {authMode !== "VERIFY_OTP" && (
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                style={styles.inputField}
                required
              />
            )}

            {/* PASSWORD FIELD FOR LOGIN & REGISTER */}
            {(authMode === "LOGIN" || authMode === "REGISTER") && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={styles.inputField}
                required
              />
            )}

            {/* VERIFY OTP & NEW PASSWORD FIELDS */}
            {authMode === "VERIFY_OTP" && (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-Digit OTP"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleChange}
                  style={styles.inputField}
                  required
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={styles.inputField}
                  required
                />
              </>
            )}

            <button type="submit" disabled={loading} style={styles.loginButton}>
              {loading ? "Processing..." : 
               authMode === "LOGIN" ? "Login to Portal" : 
               authMode === "REGISTER" ? "Register Admin" : 
               authMode === "FORGOT_PASSWORD" ? "Send OTP" : "Reset Password"}
            </button>
          </form>

          {/* AUTH DYNAMIC NAVIGATION LINKS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "15px" }}>
            {authMode === "LOGIN" && (
              <>
                <span onClick={() => { setAuthMode("FORGOT_PASSWORD"); setMessage({ text: "", isError: false }); }} style={styles.toggleLink}>
                  Forgot Password?
                </span>
                <span
  onClick={() => navigate("/admin/register")}
  style={styles.toggleLink}
>
  Don't have an account? Register Here
</span>
              </>
            )}

            {authMode !== "LOGIN" && (
              <span onClick={() => { setAuthMode("LOGIN"); setMessage({ text: "", isError: false }); }} style={{ ...styles.toggleLink, color: "#ff3f6c  " }}>
                Back to Login
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: ADMIN DASHBOARD PANEL (AFTER SUCCESSFUL LOGIN) ---
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc" }}>
       {/* Sidebar */}
       <aside style={{ width: "260px", background: "#0f172a", color: "white", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ marginBottom: "20px" }}>ADMIN PANEL</h3>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>Welcome, {user.name || 'System Admin'}</p>
            <p style={{ fontSize: "12px", color: "#64748b" }}>Role: {user.role}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
       </aside>

       {/* Main Content Area */}
       <main style={{ flex: 1, padding: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Admin Staff List</h2>
            <button onClick={fetchLogs} style={{ padding: "8px 16px", background: "#0f172a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              {loadingLogs ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
             <thead>
               <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                 <th style={{ padding: "12px" }}>Admin Name</th>
                 <th style={{ padding: "12px" }}>Email Address</th>
                 <th style={{ padding: "12px" }}>Role Status</th>
               </tr>
             </thead>
             <tbody>
               {activityLogs.length > 0 ? (
                 activityLogs.map((admin, index) => (
                   <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                     <td style={{ padding: "12px" }}>{admin.name}</td>
                     <td style={{ padding: "12px" }}>{admin.email}</td>
                     <td style={{ padding: "12px" }}>
                       <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                         {admin.role}
                       </span>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan="3" style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>
                     {loadingLogs ? "Syncing Admin List..." : "No administrative logs recorded"}
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
       </main>
    </div>
  );
}

const styles = {
  loginWrapper: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" },
  loginCard: { background: "#1e293b", padding: "40px", borderRadius: "20px", width: "360px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" },
  logoBadge: { width: "50px", height: "50px", background: "#ff3f6c", margin: "0 auto", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", marginBottom: "15px", fontSize: "20px" },
  inputField: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", marginBottom: "15px", outline: "none", boxSizing: "border-box" },
  loginButton: { width: "100%", padding: "12px", background: "#ff3f6c", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" },
  toggleLink: { background: "none", border: "none", color: "#f0dfe4", fontSize: "13px", cursor: "pointer", width: "100%", textAlign: "center", fontWeight: "500" },
  messageBanner: { padding: "10px", textAlign: "center", fontSize: "14px", marginBottom: "15px", borderRadius: "5px", background: "#334155", fontWeight: "500" },
  logoutBtn: { width: "100%", padding: "10px", background: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "auto" }
};

export default AdminLogin;