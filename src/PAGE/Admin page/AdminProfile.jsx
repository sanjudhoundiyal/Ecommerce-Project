import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function AdminProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const brandColor = "#ff3f6c";
  
  // State Management
  const [errors, setErrors] = useState({});
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    role: "ADMIN" 
  });

  // Handle screen resize for sidebar responsiveness
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

  // Load Admin from localStorage on component mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        setCurrentAdmin(admin);
        setFormData({
          name: admin.name || "",
          email: admin.email || "",
          phone: admin.phone || "",
          role: admin.role || "ADMIN"
        });
      } catch (error) {
        console.error("Error parsing admin data", error);
      }
    }
  }, []);

  // Validation Logic
  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Updated handleUpdate Function
  const handleUpdate = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/update/${currentAdmin.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

    if (res.ok) {

  const message = await res.text();

  // update local admin manually
  const updatedAdmin = {
    ...currentAdmin,
    ...formData
  };

  // save updated data
  localStorage.setItem(
    "admin",
    JSON.stringify(updatedAdmin)
  );

  setCurrentAdmin(updatedAdmin);

  setIsEditing(false);

  Swal.fire({
    icon: 'success',
    title: 'Profile Updated',
    text: message,
    confirmButtonColor: brandColor,
  });
}
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Something went wrong while connecting to the server.',
        confirmButtonColor: brandColor,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin");
  };

  const Icons = {
    Dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  };

  const navItems = [
    { label: "Admin Profile", icon: Icons.Dashboard, path: "/admin/profile" },
    { label: "Dashboard", icon: Icons.Dashboard, path: "/admin" },
  ];

  return (
    <div className="d-flex" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Sidebar */}
      <aside 
        className={`d-flex flex-column p-4 ${isSidebarOpen ? "d-flex" : "d-none d-lg-flex"}`} 
        style={{ width: "260px", height: "100vh", position: "fixed", backgroundColor: "#0f172a", color: "#f8fafc", zIndex: 1000 }}
      >
        <div className="mb-5 mt-2 px-2">
          <h4 className="fw-bolder m-0" style={{ letterSpacing: "1px", color: brandColor }}>ADMIN PANEL</h4>
        </div>
        
        <nav className="nav flex-column gap-2 flex-grow-1">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`nav-link border-0 d-flex align-items-center gap-3 px-3 py-2 text-start transition-all ${location.pathname === item.path ? 'text-white shadow-sm' : 'text-white-50 bg-transparent hover-light'}`}
              style={{ borderRadius: "12px", fontSize: "0.95rem", backgroundColor: location.pathname === item.path ? brandColor : "transparent" }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="nav-link border-0 text-white-50 d-flex align-items-center gap-3 px-3 py-2 bg-transparent mt-auto hover-light" style={{ borderRadius: "12px" }}>
          {Icons.Logout} <span className="fw-bold">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
        
        <header className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>Admin Settings</h1>
            <p className="text-secondary fw-medium">Administrative identity and security controls</p>
          </div>

          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm bg-white fw-bold">
            {Icons.Back} Go Back
          </button>
        </header>

        <div className="card border-0 shadow-lg" style={{ borderRadius: "30px", backgroundColor: "#ffffff" }}>
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left Side: Avatar Card */}
              <div className="col-lg-4 border-end p-5 text-center bg-light-subtle" style={{ borderTopLeftRadius: "30px", borderBottomLeftRadius: "30px" }}>
                <div className="position-relative d-inline-block mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-lg mx-auto" 
                       style={{ width: "130px", height: "130px", fontSize: "3.5rem", background: `linear-gradient(135deg, ${brandColor} 0%, #b80d3b 100%)` }}>
                    {currentAdmin?.name ? currentAdmin.name.charAt(0).toUpperCase() : "A"}
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{currentAdmin?.name || "Admin"}</h4>
                <span className="badge rounded-pill px-3 py-2 mb-4" style={{ backgroundColor: brandColor }}>SYSTEM ADMINISTRATOR</span>
              </div>

              {/* Right Side: Form */}
              <div className="col-lg-8 p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0 text-uppercase tracking-wider" style={{ fontSize: "0.85rem", color: "#64748b" }}>Admin Profile Details</h5>
                  {!isEditing && (
                    <button 
                      className="btn btn-link text-decoration-none fw-bold p-0" 
                      style={{ color: brandColor }} 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Details
                    </button>
                  )}
                </div>

                <form className="row g-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="col-12">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>FULL NAME</label>
                    <input 
                      name="name"
                      type="text" 
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-5 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ boxShadow: "none", color: "#1e293b", borderColor: brandColor }}
                    />
                    {errors.name && <small className="text-danger d-block mt-1">{errors.name}</small>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>ADMIN EMAIL</label>
                    <input 
                      name="email"
                      type="email"
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ boxShadow: "none", color: "#1e293b", borderColor: brandColor }}
                    />
                    {errors.email && <small className="text-danger d-block mt-1">{errors.email}</small>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>CONTACT PHONE</label>
                    <input 
                      name="phone"
                      type="text"
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10 digit number"
                      style={{ boxShadow: "none", color: "#1e293b", borderColor: brandColor }}
                    />
                    {errors.phone && <small className="text-danger d-block mt-1">{errors.phone}</small>}
                  </div>

                  <div className="col-12 mt-5">
                    {isEditing && (
                      <div className="d-flex gap-2">
                        <button 
                          type="button" 
                          className="btn px-4 py-2 rounded-pill fw-bold text-white" 
                          style={{ backgroundColor: brandColor }} 
                          onClick={handleUpdate} 
                          disabled={loading}
                        >
                          {loading ? "SAVING..." : "Update Admin Profile"}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" 
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: currentAdmin.name,
                              email: currentAdmin.email,
                              phone: currentAdmin.phone,
                              role: currentAdmin.role
                            });
                            setErrors({});
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .hover-light:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .fw-800 { font-weight: 800; }
        .bg-light-subtle { background-color: #fcfcfd; }
        @media (max-width: 991px) {
          main { margin-left: 0 !important; padding: 80px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminProfile;