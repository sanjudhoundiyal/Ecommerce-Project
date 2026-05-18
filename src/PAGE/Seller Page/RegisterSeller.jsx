import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const RegisterSeller = () => {
  const navigate = useNavigate();
  const brandColor = "#ff3f6c"; // Match your User Register theme
  const accentColor = "#ff3f6c";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Added for consistency
    shopName: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // --- SELLER VALIDATION LOGIC ---
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.shopName.trim()) newErrors.shopName = "Shop Name is required";
    
    if (formData.email.length < 8) {
      newErrors.email = "Email must be at least 8 characters";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("sellerId", data.id);
        Swal.fire("Success", "Seller Registered Successfully", "success").then(() => {
          navigate("/seller/login");
        });
      } else {
        Swal.fire("Error", data.message || "Registration Failed", "error");
   
      }
    } catch (error) {
      Swal.fire("Error", "Server error. Please try again later.", "error");

    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: "#f8fafc" }}>
      {/* LEFT VISUAL PANEL - Consistency with User Register */}
      <div className="d-none d-lg-flex col-lg-5 flex-column justify-content-between p-5 text-white position-relative overflow-hidden" 
           style={{ backgroundColor: brandColor }}>
        
        <div className="position-absolute translate-middle" 
             style={{ top: '10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(80px)', borderRadius: '50%' }}></div>

        <div className="position-relative z-index-1">
          <h1 className="fw-bold tracking-tight">My Shop</h1>
      
          <h2 className="display-5 fw-extrabold lh-sm">Grow your <br />business <br />with us.</h2>
        </div>

        <div className="position-relative z-index-1">
          <div className="d-flex align-items-center mb-4">
            
          </div>
          <p className="mt-5 small text-secondary opacity-50">© 2026 My Shop Seller Central.</p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5">
        <div className="w-100" style={{ maxWidth: "520px" }}>
          <div className="mb-5">
            <h2 className="fw-bold text-dark text-center text-lg-start">Become a Seller</h2>
      
            {errors.server && <div className="alert alert-danger border-0 small py-2">{errors.server}</div>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* SHOP NAME (Primary for Sellers) */}
              <div className="col-12">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Official Shop Name</label>
                <input type="text" name="shopName" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.shopName ? "1px solid red" : "none" }} 
                       placeholder="e.g. Elite Fashion Hub" onChange={handleChange} value={formData.shopName} />
                {errors.shopName && <div className="text-danger small mt-1 fw-medium">{errors.shopName}</div>}
              </div>

              {/* FULL NAME */}
              <div className="col-12">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Owner Name</label>
                <input type="text" name="name" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.name ? "1px solid red" : "none" }} 
                       placeholder="Enter full name" onChange={handleChange} value={formData.name} />
                {errors.name && <div className="text-danger small mt-1 fw-medium">{errors.name}</div>}
              </div>

              {/* EMAIL */}
              <div className="col-md-6">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Business Email</label>
                <input type="email" name="email" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.email ? "1px solid red" : "none" }} 
                       placeholder="business@example.com" onChange={handleChange} value={formData.email} />
                {errors.email && <div className="text-danger small mt-1 fw-medium">{errors.email}</div>}
              </div>

              {/* PHONE */}
              <div className="col-md-6">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Contact Number</label>
                <input type="text" name="phone" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.phone ? "1px solid red" : "none" }} 
                       placeholder="10-digit mobile" onChange={handleChange} value={formData.phone} />
                {errors.phone && <div className="text-danger small mt-1 fw-medium">{errors.phone}</div>}
              </div>

              {/* PASSWORD */}
              <div className="col-md-6">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Password</label>
                <input type="password" name="password" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.password ? "1px solid red" : "none" }} 
                       placeholder="••••••••" onChange={handleChange} value={formData.password} />
                {errors.password && <div className="text-danger small mt-1 fw-medium">{errors.password}</div>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="col-md-6">
                <label className="text-uppercase small fw-bold text-secondary tracking-wider mb-2 d-block">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-control border-0 py-3 px-4 shadow-sm" 
                       style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: errors.confirmPassword ? "1px solid red" : "none" }} 
                       placeholder="••••••••" onChange={handleChange} value={formData.confirmPassword} />
                {errors.confirmPassword && <div className="text-danger small mt-1 fw-medium">{errors.confirmPassword}</div>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn w-100 py-3 mt-5 shadow-lg transform active-scale" 
                    style={{ backgroundColor: brandColor, color: "#fff", borderRadius: "12px", fontWeight: "700", transition: "all 0.2s" }}>
              {loading ? "Verifying..." : "Register Store"}
            </button>

            <p className="text-center mt-4 text-muted small fw-medium">
              Already have a seller account? <span className="fw-bold" 
                                      style={{ cursor: "pointer", color: accentColor }} 
                                      onClick={() => navigate("/seller/login")}>Sign In</span>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        .active-scale:active { transform: scale(0.98); }
        .form-control:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          border: 1px solid #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterSeller;