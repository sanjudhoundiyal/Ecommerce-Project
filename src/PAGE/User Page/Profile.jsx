import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom Brand Color
  const brandColor = "#ff3f6c";
  
  // State Management
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    role: "" 
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
       
        });
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  // Strict Validation Logic
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!formData.email.trim()) {
  newErrors.email = "Email is required";

} else if (formData.email.length > 50) {
  newErrors.email = "Email must be 50 `characters or less";

} else if (!emailRegex.test(formData.email)) {
  newErrors.email = "Invalid email format";
}

    // Phone validation (India: 10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time Input Handling (Prevents letters in phone)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      return Swal.fire({
        title: "Validation Error",
    text: "Please enter valid data.",
        icon: "warning",
        confirmButtonColor: brandColor
      });
    }

    if (!currentUser?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedData));
        setCurrentUser(updatedData);
        setIsEditing(false);
        
        Swal.fire({
          title: "Profile Updated",
          text: "Your changes have been saved successfully ✅",
          icon: "success",
          confirmButtonColor: brandColor,
          timer: 2000
        });
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Could not save profile changes ❌",
        icon: "error",
        confirmButtonColor: brandColor
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Icons = {
    Overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    Address: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Wishlist: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    User: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  };

  const navItems = [
    { label: "Profile", icon: Icons.User, path: "/profile" },
    { label: "Wishlist", icon: Icons.Wishlist, path: "/wishlist" },
    { label: "Orders", icon: Icons.Orders, path: "/orders" },
    { label: "Addresses", icon: Icons.Address, path: "/address" },
    { label: "Overview", icon: Icons.Overview, path: "/" },
  ];

  const renderContent = () => {
    if (location.pathname === "/profile") {
      return (
        <>
          {!currentUser ? (
            <div className="text-center py-5">
              <div className="mb-4 text-muted">Authentication required.</div>
              <button onClick={() => navigate("/login")} className="btn btn-primary btn-lg rounded-pill px-5" style={{ backgroundColor: brandColor, borderColor: brandColor }}>Login Now</button>
            </div>
          ) : (
            <div className="row g-0">
              <div className="col-lg-4 border-end p-5 text-center bg-light-subtle" style={{ borderTopLeftRadius: "30px", borderBottomLeftRadius: "30px" }}>
                <div className="position-relative d-inline-block mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-lg mx-auto" 
                       style={{ width: "130px", height: "130px", fontSize: "3.5rem", background: `linear-gradient(135deg, ${brandColor} 0%, #b80d3b 100%)` }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="position-absolute bottom-0 end-0 bg-success border border-4 border-white rounded-circle" style={{ width: "25px", height: "25px" }}></div>
                </div>
                <h4 className="fw-bold mb-1">{currentUser.name}</h4>
                <p className="text-muted small mb-4">{currentUser.email}</p>
               
              </div>

              <div className="col-lg-8 p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0 text-uppercase tracking-wider" style={{ fontSize: "0.85rem", color: "#64748b" }}>General Information</h5>
                  {!isEditing && (
                    <button className="btn btn-link text-decoration-none fw-bold p-0" style={{ color: brandColor }} onClick={() => setIsEditing(true)}>Edit Details</button>
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
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>EMAIL ADDRESS</label>
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
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-bold" style={{ fontSize: "0.75rem" }}>PHONE NUMBER</label>
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
                          {loading ? "SAVING..." : "Save Changes"}
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
    } else if (location.pathname === "/wishlist") {
      return (
        <div className="p-5">
          <h4 className="fw-bold mb-4">Your Saved Items</h4>
          {wishlistItems.length > 0 ? (
            <div className="row g-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "20px" }}>
                    <div className="p-3 text-center bg-light" style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}>
                      <img src={item.image} alt={item.name} className="img-fluid" style={{ maxHeight: "120px", objectFit: "cover" }} />
                    </div>
                    <div className="card-body">
                      <h6 className="fw-bold">{item.name}</h6>
                      <p className="fw-bold mt-2" style={{ color: brandColor }}>{item.price}</p>
                      <button className="btn btn-outline-dark btn-sm w-100 rounded-pill mt-3" onClick={() => setWishlistItems(wishlistItems.filter(i => i.id !== item.id))}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              Your wishlist is empty.
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="p-5 text-center">
          <h4 className="text-muted">Viewing {location.pathname.replace("/", "").toUpperCase() || "OVERVIEW"}</h4>
          <p className="text-secondary mt-3">The requested account section is currently under development.</p>
        </div>
      );
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="d-lg-none p-3 position-fixed top-0 start-0 m-3 rounded-circle shadow-sm bg-white" style={{ zIndex: 1050, cursor: "pointer" }} onClick={toggleSidebar}>
        ☰
      </div>
      
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

      <main className="flex-grow-1" style={{ marginLeft: isSidebarOpen && window.innerWidth > 991 ? "260px" : "0", padding: "60px 80px", transition: "margin-left 0.3s" }}>
        
        <header className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-800 text-dark mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>Account Settings</h1>
            <p className="text-secondary fw-medium">View and update your personal profile details</p>
          </div>

          
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
        @media (max-width: 991px) {
          main { margin-left: 0 !important; padding: 80px 20px 20px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default Profile;