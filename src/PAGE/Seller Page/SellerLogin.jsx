import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const inputStyle = {
  borderRadius: "10px",
  fontSize: "0.95rem",
  border: "1.5px solid #eee",
  backgroundColor: "#f9f9f9",
  padding: "12px"
};

function SellerLogin() {
  const navigate = useNavigate();
  const brandColor = "#ff3f6c"; 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/seller-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("sellerId", data.id);
        localStorage.setItem("sellerData", JSON.stringify(data));
        Swal.fire("Success", "Login Successful", "success").then(() => {
          navigate("/seller/dashboard");
        });
      } else {
        Swal.fire("Error", data.message || "Invalid Email or Password", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD WORKFLOW (OTP & RESET) ---
  const handleForgotPassword = async () => {
    // Step 1: Ask for Email
    const { value: targetEmail } = await Swal.fire({
      title: "Forgot Password",
      input: "email",
      inputLabel: "Enter your registered business email",
      inputPlaceholder: "name@business.com",
      showCancelButton: true,
      confirmButtonColor: brandColor,
    });

    if (!targetEmail) return;

    Swal.showLoading();

    try {
      // Step 2: Send Request to backend for OTP
      const res = await fetch("http://localhost:8080/api/seller/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Email not found");
      }

      // Step 3: Open Verification Form Modal if OTP sent successfully
      const { value: formValues } = await Swal.fire({
        title: "Verify OTP & Reset Password",
        html:
          `<input id="swal-otp" class="swal2-input" placeholder="Enter 6-Digit OTP" maxlength="6">` +
          `<input id="swal-newpassword" type="password" class="swal2-input" placeholder="New Password">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: "#ff3f6c",
        preConfirm: () => {
          const otp = document.getElementById("swal-otp").value;
          const newPassword = document.getElementById("swal-newpassword").value;
          if (!otp || !newPassword) {
            Swal.showValidationMessage("Please fill out both fields");
          }
          return { otp, newPassword };
        },
      });

      if (!formValues) return;

      Swal.showLoading();

      // Step 4: Submit OTP and New Password to backend
      const verifyRes = await fetch("http://localhost:8080/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          otp: formValues.otp,
          newPassword: formValues.newPassword,
        }),
      });

      if (verifyRes.ok) {
        Swal.fire("Success", "Password updated successfully! Please login.", "success");
      } else {
        const verifyError = await verifyRes.text();
        Swal.fire("Error", verifyError || "Invalid OTP verification failed.", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong.", "error");
    }
  };

  return (
    <section
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div
              className="card border-0 shadow-lg p-4 p-md-5"
              style={{ borderRadius: "20px", background: "#ffffff" }}
            >
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: "#2d2d2d" }}>Seller Login</h2>
                <p className="text-muted small">Access your business dashboard</p>
              </div>

              <form onSubmit={handleLogin}>
                {/* EMAIL */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Business Email</label>
                  <input
                    type="email"
                    className="form-control shadow-none"
                    placeholder="name@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Password</label>
                  <input
                    type="password"
                    className="form-control shadow-none"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* FORGOT PASSWORD LINK */}
                <div className="text-end mb-4">
                  <span
                    onClick={handleForgotPassword}
                    style={{ color: "#ff3f6c", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                  >
                    Forgot Password?
                  </span>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 text-white fw-bold"
                  style={{
                    backgroundColor: "#ff3f6c"  ,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    transition: "0.3s",
                  }}
                >
                  {loading ? "Verifying..." : "Login to Portal"}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  New here?{" "}
                  <span
                    style={{ color: brandColor, cursor: "pointer", fontWeight: "700" }}
                    onClick={() => navigate("/seller/register")}
                  >
                    Create Seller Account
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SellerLogin;