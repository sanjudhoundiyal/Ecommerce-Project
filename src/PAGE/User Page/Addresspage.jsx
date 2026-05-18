import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
function AddressPage() {
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    houseNo: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: ""
  });



 

  // Function to reset form when switching users
  const resetForm = useCallback(() => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      houseNo: "",
      street: "",
      area: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pincode: ""
    });
  }, []);




  const validate = () => {
  if (!formData.fullName.trim()) return "Name required";
if (!formData.email || formData.email.length > 20)
  return "Email must be under 20 characters";

if (!/\S+@\S+\.\S+/.test(formData.email))
  return "Invalid email";

if (!/^[6-9]\d{9}$/.test(formData.phone))
  return "Phone number must be 10 digits";

if (!/^\d{6}$/.test(formData.pincode))
  return "Pincode must be 6 digits";
const validStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi"
];

// State validation
if (!formData.state.trim()) return "State required";

if (
  !validStates.some(
    (state) =>
      state.toLowerCase() === formData.state.trim().toLowerCase()
  )
) {
  return "Enter a valid Indian state";
}

  return null;
};

useEffect(() => {
  if (!userId) {
    navigate("/login");
    return;
  }

  setLoading(true);

  Promise.all([
    fetch(`http://localhost:8080/api/addresses/${userId}`),
    fetch(`http://localhost:8080/api/addmoreaddress/user/${userId}`)
  ])
    .then(async ([res1, res2]) => {
      let hasAddress = false;
      let finalAddress = null;

      if (res1.ok) {
        const data1 = await res1.json();
        if (data1 && data1.userId === Number(userId)) {
          hasAddress = true;
          finalAddress = data1;
        }
      }

      if (!hasAddress && res2.ok) {
        const data2 = await res2.json();
        if (Array.isArray(data2) && data2.length > 0) {
          hasAddress = true;
          finalAddress = data2[0];
        }
      }

      if (hasAddress && finalAddress) {
        const formatted = {
          fullName: finalAddress.fullName || finalAddress.name || "",
          email: finalAddress.email || "",
          phone: finalAddress.phone || "",
          houseNo: finalAddress.houseNo || "",
          street: finalAddress.street || "",
          area: finalAddress.area || "",
          landmark: finalAddress.landmark || "",
          city: finalAddress.city || "",
          state: finalAddress.state || "",
          country: finalAddress.country || "India",
          pincode: finalAddress.pincode || ""
        };

        localStorage.setItem("address", JSON.stringify(formatted));
        navigate("/checkout", { replace: true });
      } else {
        resetForm();
      }
    })
    .catch(() => {
      resetForm();
    })
    .finally(() => setLoading(false));

}, [userId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSave = async (e) => {
  e.preventDefault();

  const error = validate();
  if (error) return Swal.fire({
  title: "Validation Error",
  text: error,
  icon: "error",
  confirmButtonColor: "#ff3f6c",
});
    ;

  try {
    const payload = {
      ...formData,
      user: { id: Number(userId) },
      userId: Number(userId)
    };

    const res = await fetch(
      `http://localhost:8080/api/addmoreaddress/add/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error();

    // ✅ IMPORTANT: Save before redirect
    localStorage.setItem("address", JSON.stringify(formData));

    // ✅ then go to checkout
    navigate("/checkout");

  } catch {
  Swal.fire({
    title: "Save failed ❌",
    text: "Please try again.",
    icon: "error",
    confirmButtonColor: "#ff3f6c",
  });
}
  
};
  return (
    <div className="address-container">
      <style>{`
        .address-container { background-color: #f4f4f7; min-height: 100vh; padding-top: 80px; }
        .address-card { background: #fff; border: none; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .form-label { font-size: 13px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        .form-control { border-radius: 8px; padding: 12px; border: 1.5px solid #eee; background: #fafafa; font-size: 15px; transition: 0.3s; }
        .form-control:focus { border-color: #ff3f6c; box-shadow: none; background: #fff; }
        .save-btn { background: #ff3f6c; color: #fff; padding: 15px; border-radius: 10px; font-weight: 600; border: none; transition: 0.3s; margin-top: 20px; }
        .save-btn:hover { background: #ff3f6c; transform: translateY(-2px); }
        .step-indicator { font-size: 12px; color: #888; margin-bottom: 10px; display: block; letter-spacing: 1px; }
      `}</style>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="address-card">
           
              <h3 className="fw-bold mb-4" style={{ letterSpacing: '-1px' }}>Shipping Details</h3>
              
              <form onSubmit={handleSave}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" placeholder="e.g. Rahul Sharma" required />
                  </div>

 <div className="col-12 mb-3">
                    <label className="form-label"> Email </label>
                    <input name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="e.g. rahul@example.com" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="10-digit mobile" required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">House / Flat No.</label>
                    <input name="houseNo" value={formData.houseNo} onChange={handleChange} className="form-control" placeholder="House/Apt No" required />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Street</label>
                    <input name="street" value={formData.street} onChange={handleChange} className="form-control" placeholder="Street Name, Landmark" required />
                  </div>

                   <div className="col-12 mb-3">
                    <label className="form-label">Landmark</label>
                    <input name="landmark" value={formData.landmark} onChange={handleChange} className="form-control" placeholder="Nearby Landmark" required />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Area / Colony</label>
                    <input name="area" value={formData.area} onChange={handleChange} className="form-control" placeholder="Locality Name" required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">City</label>
                    <input name="city" value={formData.city} onChange={handleChange} className="form-control" placeholder="City" required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">State</label>
                    <input name="state" value={formData.state} onChange={handleChange} className="form-control" placeholder="State" required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Pincode</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} className="form-control" placeholder="6-digit" required />
                  </div>
                </div>

                <button type="submit" className="save-btn w-100">
                  Deliver to this Address
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressPage;