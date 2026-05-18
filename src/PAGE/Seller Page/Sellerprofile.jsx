import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function SellerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom Executive Brand Color 
  const brandColor = "#ff3f6c";
  
  // State Management
  const [errors, setErrors] = useState({});
  const [currentSeller, setCurrentSeller] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true); // Spinner state for early mount
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Form properties synchronized with your Spring Boot entity requirements
  const [formData, setFormData] = useState({ 
    name: "", // Primary Owner/Merchant Name
    shopName: "", 
    email: "", 
    phone: "",
    password: "" 
  });

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

  // Fetch live seller data from Spring Boot Backend on mount
  useEffect(() => {
    const fetchSellerData = async () => {
      // 1. Retrieve the seller ID or session object from localStorage
const storedSeller = localStorage.getItem("sellerData");
      let sellerId = null;

      if (storedSeller) {
        try {
          const parsed = JSON.parse(storedSeller);
          sellerId = parsed.id;
        } catch (e) {
          console.error("Error parsing stored seller token structural data", e);
        }
      }

      // If no valid session ID exists, redirect to login
      if (!sellerId) {
        setInitialFetchLoading(false);
        return;
      }

      try {
        // 2. HTTP GET call targeting your Spring Boot API endpoint layer
        const response = await fetch(`http://localhost:8080/api/seller/${sellerId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const dbSellerData = await response.json();
          setCurrentSeller(dbSellerData);
          setFormData({
            name: dbSellerData.name || "",
            shopName: dbSellerData.shopName || "",
            email: dbSellerData.email || "",
            phone: dbSellerData.phone || "",
            password: ""
          });
          // Sync fresh database status down to local storage session
        localStorage.setItem("sellerData", JSON.stringify(dbSellerData));
        } else {
          throw new Error("Backend server rejected account token resolution request");
        }
      } catch (error) {
        console.error("Failed to connect with database cluster: ", error);
        Swal.fire({
          title: "Connection Alert",
          text: "Could not fetch fresh live account sync values from backend server.",
          icon: "error",
          confirmButtonColor: brandColor
        });
      } finally {
        setInitialFetchLoading(false);
      }
    };

    fetchSellerData();
  }, [brandColor]);

  // Structural Validation matching Indian Merchant Validation Rules
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "My Shop owner name is required";
    if (!formData.shopName.trim()) newErrors.shopName = "My Shop name is required";

    // Email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Business email address is required";
    } else if (formData.email.length > 20) {
      newErrors.email = "Email must be 20 characters or less";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid corporate email format";
    }

    // Phone parsing (India mobile standard)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Primary registration contact number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      return Swal.fire({
        title: "Validation Failure",
        text: "Please clean up form entry inputs before committing changes.",
        icon: "warning",
        confirmButtonColor: brandColor
      });
    }

    if (!currentSeller?.id) return;
    setLoading(true);

    try {
      // Unified API PUT call targeting your Spring Boot controller path
      const response = await fetch(`http://localhost:8080/api/seller/update/${currentSeller.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem("seller", JSON.stringify(updatedData));
        setCurrentSeller(updatedData);
        setIsEditing(false);
        
        Swal.fire({
          title: "My shop Synced",
          text: "Corporate credentials updated safely ✅",
          icon: "success",
          confirmButtonColor: brandColor,
          timer: 2000
        });
      } else {
        throw new Error("API transactional update error code caught");
      }
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Failed to persist database profile modifications. Check connection node status ❌",
        icon: "error",
        confirmButtonColor: brandColor
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
   localStorage.removeItem("sellerData");
    navigate("/seller/login");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Icons = {
    Overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2"/><path d="M14 6h2"/><path d="M8 10h2"/><path d="M14 10h2"/></svg>,
    Logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  };

  const navItems = [
    { label: "Profile", icon: Icons.Building, path: "/seller/profile" },
    { label: "Dashboard", icon: Icons.Overview, path: "/seller/dashboard" },
  ];

  const renderContent = () => {
    if (initialFetchLoading) {
      return (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-secondary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3 fw-medium">Syncing profile with data engines...</p>
        </div>
      );
    }

    if (location.pathname === "/seller/profile") {
      return (
        <>
          {!currentSeller ? (
            <div className="text-center py-5">
              <div className="mb-4 text-muted">Business Authentication credentials required.</div>
              <button onClick={() => navigate("/seller/login")} className="btn btn-primary btn-lg rounded-pill px-5" style={{ backgroundColor: brandColor, borderColor: brandColor }}>My Shop Login</button>
            </div>
          ) : (
            <div className="row g-0">
              {/* Left Segment: Identity Branding */}
              <div className="col-lg-4 border-end p-5 text-center bg-light-subtle" style={{ borderTopLeftRadius: "30px", borderBottomLeftRadius: "30px" }}>
                <div className="position-relative d-inline-block mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-lg mx-auto" 
                       style={{ width: "130px", height: "130px", fontSize: "3.5rem", background: `linear-gradient(135deg, ${brandColor} 0%, #1e293b 100%)` }}>
                    {formData.shopName ? formData.shopName.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="position-absolute bottom-0 end-0 bg-success border border-4 border-white rounded-circle" style={{ width: "25px", height: "25px" }}></div>
                </div>
                <h4 className="fw-bold mb-1">{currentSeller.shopName}</h4>
                <p className="text-muted small mb-2">Merchant ID: #{currentSeller.id}</p>
               
              </div>

              {/* Right Segment: Editable Operational Fields */}
              <div className="col-lg-8 p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0 text-uppercase tracking-wider" style={{ fontSize: "0.85rem", color: "#64748b" }}>Company Parameters</h5>
                  {!isEditing && (
                    <button className="btn btn-link text-decoration-none fw-bold p-0" style={{ color: brandColor }} onClick={() => setIsEditing(true)}>Edit Details</button>
                  )}
                </div>

                <form className="row g-4" onSubmit={(e) => e.preventDefault()}>
                  {/* Shop Name Input */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>REGISTERED SHOP NAME</label>
                    <input 
                      name="shopName"
                      type="text" 
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.shopName}
                      onChange={handleInputChange}
                      style={{ boxShadow: "none", color: "#1e293b", borderColor: brandColor }}
                    />
                    {errors.shopName && <small className="text-danger d-block mt-1">{errors.shopName}</small>}
                  </div>

                  {/* Merchant Owner Name Input */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>PRIMARY SIGNATORY / OWNER</label>
                    <input 
                      name="name"
                      type="text" 
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ borderColor: brandColor }}
                    />
                    {errors.name && <small className="text-danger d-block mt-1">{errors.name}</small>}
                  </div>

                  {/* Corporate Email Address */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>OFFICIAL BUSINESS EMAIL</label>
                    <input 
                      name="email"
                      type="email"
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ borderColor: brandColor }}
                    />
                    {errors.email && <small className="text-danger d-block mt-1">{errors.email}</small>}
                  </div>

                  {/* Corporate Phone Number */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>CONTACT SUPPORT NUMBER</label>
                    <input 
                      name="phone"
                      type="text"
                      readOnly={!isEditing}
                      className={`form-control border-0 px-0 fs-6 ${isEditing ? 'border-bottom rounded-0' : 'bg-transparent fw-semibold'}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile"
                      style={{ borderColor: brandColor }}
                    />
                    {errors.phone && <small className="text-danger d-block mt-1">{errors.phone}</small>}
                  </div>

                  {/* Dynamic Action Control Triggers */}
                  <div className="col-12 mt-5">
                    {isEditing && (
                      <div className="d-flex gap-2">
                        <button 
                          type="button" 
                          className="btn px-4 py-2 rounded-pill fw-bold shadow text-white" 
                          style={{ backgroundColor: brandColor }}
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "SAVING STRUCTURE..." : "Update Profile"}
                        </button>
                        <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" onClick={() => setIsEditing(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="p-5 text-center">
          <h4 className="text-muted">Viewing {location.pathname.replace("/seller/", "").toUpperCase()} Workspace</h4>
          <p className="text-secondary mt-3">The merchant node cluster data modules are currently synchronized.</p>
        </div>
      );
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Mobile Menu Trigger Toggle */}
      <div className="d-lg-none p-3 position-fixed top-0 start-0 m-3 rounded-circle shadow-sm bg-white" style={{ zIndex: 1050, cursor: "pointer" }} onClick={toggleSidebar}>
        ☰
      </div>
      
      {/* Merchant Dashboard Sidebar */}
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
          <h4 className="fw-bolder m-0" style={{ letterSpacing: "1px", color: brandColor }}>My Shop</h4>
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
                  backgroundColor: isActive ? brandColor : "transparent"
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

      {/* Main Panel Content Window Layer */}
      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen && window.innerWidth > 991 ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
        
        <header className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>Seller Control Panel</h1>
            <p className="text-secondary fw-medium">Manage corporate identifiers, store parameters, and account settings</p>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm bg-white fw-bold transition-all"
            style={{ borderColor: "#cbd5e1" }}
          >
            {Icons.Back} Go Back
          </button>
        </header>

        <div className="card border-0 shadow-lg" style={{ borderRadius: "30px", backgroundColor: "#ffffff" }}>
          <div className="card-body p-0">
            {renderContent()}
          </div>
        </div>
      </main>

      <style>{`
        .hover-light:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .fw-800 { font-weight: 800; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .tracking-wider { letter-spacing: 0.1em; }
        .bg-light-subtle { background-color: #fcfcfd; }
        .bg-emerald { background-color: #e6f4ea; }
        @media (max-width: 991px) {
          main { margin-left: 0 !important; padding: 80px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default SellerProfile;