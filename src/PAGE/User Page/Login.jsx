import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {

  const navigate = useNavigate();
  const brandColor = "#ff3f6c";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  // login | forgot | verify
  const [mode, setMode] = useState("login");

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      navigate("/");
    }
  }, [navigate]);

  // LOGIN
  const handleLogin = async (e) => {

    e.preventDefault();

    setErrorMsg("");

    if (!email || !password) {
      return setErrorMsg("Enter email & password");
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      const userId =
        data.id ||
        data.userId ||
        data?.data?.id;

      if (res.ok && userId) {

        localStorage.setItem("userId", userId);

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );

        navigate("/");

      } else {

        setErrorMsg(
          data.message ||
          "Invalid email or password"
        );
      }

    } catch (error) {

      setErrorMsg("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  // SEND OTP
  const sendOtp = async () => {

    setErrorMsg("");

    if (!email) {
      return setErrorMsg("Enter email");
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.text();

      if (res.ok) {

        setMode("verify");

        setErrorMsg("OTP sent to your email ");

      } else {

        setErrorMsg(data);
      }

    } catch (error) {

      setErrorMsg("Failed to send OTP");

    } finally {

      setLoading(false);
    }
  };

  // VERIFY OTP + RESET PASSWORD
  const verifyOtp = async () => {

    setErrorMsg("");

    if (!otp || !password) {
      return setErrorMsg(
        "Enter OTP and new password"
      );
    }

    // Strong password
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {

      return setErrorMsg(
        "Password must contain uppercase, lowercase, number & special character"
      );
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:8080/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword: password,
          }),
        }
      );

      const data = await res.text();

      if (res.ok) {

        setMode("login");

        setOtp("");

        setPassword("");

        setErrorMsg(
          "Password reset successful ✅"
        );

      } else {

        setErrorMsg(data);
      }

    } catch (error) {

      setErrorMsg("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  const inputStyle = {
    borderRadius: "10px",
    fontSize: "0.95rem",
    border: "1.5px solid #eee",
    backgroundColor: "#f9f9f9"
  };

  return (

    <section
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        fontFamily: "'Inter', sans-serif"
      }}
    >

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-5 col-lg-4">

            <div
              className="card border-0 shadow-lg p-4 p-md-5"
              style={{
                borderRadius: "20px",
                background: "#ffffff"
              }}
            >

              <div className="text-center mb-4">

                <h2
                  className="fw-bold"
                  style={{ color: "#2d2d2d" }}
                >

                  {mode === "login"
                    ? "Welcome Back"
                    : mode === "forgot"
                    ? "Forgot Password"
                    : "Verify OTP"}

                </h2>

              </div>

              {/* EMAIL */}
              <div className="mb-3">

                <label className="form-label small fw-bold text-secondary">
                  Email Address
                </label>

                <input
                  type="email"
                  className="form-control form-control-lg shadow-none"
                  placeholder="name@shop.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  style={inputStyle}
                />

              </div>

              {/* LOGIN PASSWORD */}
              {mode === "login" && (

                <div className="mb-4">

                  <div className="d-flex justify-content-between">

                    <label className="form-label small fw-bold text-secondary">
                      Password
                    </label>

                    <span
                      className="small"
                      onClick={() => {
                        setMode("forgot");
                        setErrorMsg("");
                      }}
                      style={{
                        color: brandColor,
                        cursor: "pointer",
                        fontSize: "0.75rem"
                      }}
                    >
                      Forgot?
                    </span>

                  </div>

                  <input
                    type="password"
                    className="form-control form-control-lg shadow-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    style={inputStyle}
                  />

                </div>
              )}

              {/* VERIFY OTP */}
              {mode === "verify" && (

                <>
                  <div className="mb-3">

                    <label className="form-label small fw-bold text-secondary">
                      OTP
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg shadow-none"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value)
                      }
                      style={inputStyle}
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label small fw-bold text-secondary">
                      New Password
                    </label>

                    <input
                      type="password"
                      className="form-control form-control-lg shadow-none"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      style={inputStyle}
                    />

                  </div>
                </>
              )}

              {/* ERROR */}
              {errorMsg && (

                <div
                  style={{
                    color:
                      errorMsg.includes("✅")
                        ? "green"
                        : "red",
                    fontSize: "13px",
                    textAlign: "center",
                    marginBottom: "15px",
                    fontWeight: "500"
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* BUTTONS */}
              {mode === "login" && (

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="btn w-100 text-white fw-bold"
                  style={{
                    backgroundColor: brandColor,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none"
                  }}
                >
                  {loading
                    ? "Please wait..."
                    : "Login"}
                </button>
              )}

              {mode === "forgot" && (

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="btn w-100 text-white fw-bold"
                  style={{
                    backgroundColor: brandColor,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none"
                  }}
                >
                  {loading
                    ? "Sending..."
                    : "Send OTP"}
                </button>
              )}

              {mode === "verify" && (

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="btn w-100 text-white fw-bold"
                  style={{
                    backgroundColor: brandColor,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none"
                  }}
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>
              )}

              <div className="text-center mt-4">

                {mode === "login" ? (

                  <p className="text-muted small mb-0">

                    Don’t have an account?{" "}

                    <span
                      style={{
                        color: brandColor,
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                      onClick={() =>
                        navigate("/register")
                      }
                    >
                      Create account
                    </span>

                  </p>

                ) : (

                  <span
                    className="small text-muted"
                    style={{
                      cursor: "pointer",
                      fontWeight: "600",
                      color: brandColor
                    }}
                    onClick={() => {
                      setMode("login");
                      setErrorMsg("");
                    }}
                  >
                    Back to Login
                  </span>
                )}

              </div>      

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Login;