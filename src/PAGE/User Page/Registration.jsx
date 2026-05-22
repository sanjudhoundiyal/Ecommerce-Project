import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const brandColor = "#ff3f6c";

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    pincode: "",
  });

  // State to hold error messages for each field
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // --- VALIDATION LOGIC ---
    if (!user.name.trim()) newErrors.name = "Name is required";
    
    // Email length check (Min 50 characters as requested)
   // Email validation
if (!user.email.trim()) {
  newErrors.email = "Email is required";
} else if (user.email.length > 50) {
  newErrors.email = "Email must be less than 50 characters";
} else if (!/\S+@\S+\.\S+/.test(user.email)) {
  newErrors.email = "Invalid email format";
}

    // Phone length check (Exactly 10 digits)
// Phone validation
const phone = user.phone?.trim();

if (!/^[6-9]\d{9}$/.test(phone)) {
  newErrors.phone = "Enter a valid 10-digit mobile number";
}
    // Pincode length check (Exactly 6 digits)
 if (!user.pincode.trim()) {
  newErrors.pincode = "Pincode is required";

} else if (!/^[1-9][0-9]{5}$/.test(user.pincode)) {
  newErrors.pincode = "Enter a valid pincode";
}
    if (!user.city) newErrors.city = "City is required";

    if (user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (user.password !== user.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are errors, stop here and show them in red lines
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

  try {
  const payload = {
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    city: user.city,
    pincode: user.pincode,
  };

  const response = await fetch("http://localhost:8080/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    navigate("/login");
  } else {

  const errorText = await response.text();

setErrors({
  email: "Oops! Something Weng Wrong."
});


    // setErrors({
    //   server: errorData.message || "Registration Failed",
   
  }
} catch (error) {
  setErrors({
    server: "Something Went Wrong",
  });

    }
  };

  const inputStyle = {
    fontSize: "0.9rem",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #ddd", // default border
    backgroundColor: "#f8f9fa",
  };

  // Helper component for the red error line
  const ErrorMsg = ({ msg }) => (
    msg ? <div style={{ color: "red", fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>{msg}</div> : null
  );

  return (
    <section className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: "#f4f7f6" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-7 col-xl-6">
            <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: "1.5rem" }}>
              <div className="text-center mb-4">
                <h2 className="fw-bold">Join My Shop</h2>
                <p className="text-muted">Create your profile to enjoy exclusive member benefits.</p>
                {errors.server && <div className="alert alert-danger p-2 small">{errors.server}</div>}
              </div>

              <form onSubmit={handleRegister}>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label small fw-bold text-secondary">Full Name</label>
                    <input type="text" name="name" className="form-control" style={{...inputStyle, borderColor: errors.name ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.name} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Email Address</label>
                    <input type="email" name="email" className="form-control" style={{...inputStyle, borderColor: errors.email ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.email} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Phone Number</label>
                    <input type="text" name="phone" className="form-control" style={{...inputStyle, borderColor: errors.phone ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.phone} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">City</label>
                    <input type="text" name="city" className="form-control" style={{...inputStyle, borderColor: errors.city ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.city} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Pincode</label>
                    <input
  type="text"
  name="pincode"
  maxLength="6"
  className="form-control"
  style={{
    ...inputStyle,
    borderColor: errors.pincode ? "red" : "#ddd"
  }}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");
    setUser({ ...user, pincode: value });

    if (errors.pincode) {
      setErrors({ ...errors, pincode: "" });
    }
  }}
/>
                    <ErrorMsg msg={errors.pincode} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Password</label>
                    <input type="password" name="password" className="form-control" style={{...inputStyle, borderColor: errors.password ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.password} />
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label small fw-bold text-secondary">Confirm Password</label>
                    <input type="password" name="confirmPassword" className="form-control" style={{...inputStyle, borderColor: errors.confirmPassword ? "red" : "#ddd"}} onChange={handleChange} />
                    <ErrorMsg msg={errors.confirmPassword} />
                  </div>
                </div>

                <button type="submit" className="btn btn-lg w-100 text-white shadow-sm mb-3" style={{ backgroundColor: brandColor, borderRadius: "10px", padding: "12px", fontWeight: "600" }}>
                  Create My Profile
                </button>

                <p className="text-center small">
                  Already have an account?{" "}
                  <span className="fw-bold" style={{ color: brandColor, cursor: "pointer" }} onClick={() => navigate("/login")}>
                    Sign In
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;