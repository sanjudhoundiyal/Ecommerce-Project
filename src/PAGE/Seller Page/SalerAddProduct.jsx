import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SellerProduct() {
  const navigate = useNavigate();
  
  // 1. Correctly get Seller ID from the object you saved in Dashboard
  const savedData = localStorage.getItem("sellerData");
  const seller = savedData ? JSON.parse(savedData) : null;
  const sellerId = seller?.id;

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    price: "",
    quantity: "",
    discount: 0,
    description: "",
    deliveryDays: "", 
    subcategoryId: "" 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]); 
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(seller); // Initialize with local data

  // 2. Consistent API URL (Added /api)
  const BASE_URL = `http://localhost:8080/api/seller`;

  useEffect(() => {
    if (!sellerId) {
      navigate("/seller/login");
      return;
    }
    loadSubCategories(); 
    loadProducts();
    // Only fetch profile if name is missing
    if (!seller?.name) loadSellerProfile();
  }, [sellerId]);

  const loadSubCategories = () => {
    fetch("http://localhost:8080/api/subcategories")
      .then((res) => res.json())
      .then((data) => setSubcategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  };

  const loadSellerProfile = () => {
    fetch(`${BASE_URL}/${sellerId}`)
      .then((res) => res.json())
      .then((data) => setSellerProfile(data))
      .catch((err) => console.error("Error fetching seller:", err));
  };

  const loadProducts = () => {
    fetch(`${BASE_URL}/products/${sellerId}`)
      .then((res) => res.json())
      .then((data) => setProducts(data || []))
      .catch((err) => console.error("Product Load Error:", err));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setImageFile(files[0]);
    } else if (name === "name") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setProduct({ ...product, name: value, slug });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleEdit = (p) => {
    setEditId(p.productId || p.id);
    setProduct({
      name: p.name || "",
      slug: p.slug || "",
      price: p.price || "",
      quantity: p.quantity || "",
      discount: p.discount || 0,
      description: p.description || "",
      deliveryDays: p.deliveryDays || "", 
      subcategoryId: p.subcategory?.id || p.subCategory?.id || "" 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        const res = await fetch(`${BASE_URL}/delete-product/${id}`, { method: "DELETE" });
        if (res.ok) loadProducts();
      } catch (err) {
        console.error("Delete failed.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!product.subcategoryId) return alert("Please select a category");

    setLoading(true);
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("slug", product.slug);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("discount", product.discount);
    formData.append("description", product.description);
    formData.append("deliveryDays", product.deliveryDays); 
    formData.append("subcategoryId", product.subcategoryId);

    if (imageFile) formData.append("image", imageFile);

    const url = editId 
      ? `${BASE_URL}/update-product/${editId}` 
      : `${BASE_URL}/add-product/${sellerId}`;
    
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, { method, body: formData });
      if (response.ok) {
        resetForm();
        loadProducts();
        alert(editId ? "Product updated!" : "Product published to shop!");
      } else {
        const errorMsg = await response.text();
        alert("Error: " + errorMsg);
      }
    } catch (err) {
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProduct({
      name: "", slug: "", price: "", quantity: "", discount: 0, description: "", deliveryDays: "", subcategoryId: ""
    });
    setImageFile(null);
    setEditId(null);
    if (document.getElementById("fileInput")) document.getElementById("fileInput").value = "";
  };

  const theme = {
    primary: "#ff3f6c",
    secondary: "#10B981", 
    danger: "#EF4444",
    dark: "#2D3748", 
    lightText: "#64748B", 
    bg: "#F1F5F9",
    white: "#FFFFFF", 
    border: "#E2E8F0"
  };

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "380px", background: theme.white, padding: "30px", borderRight: `1px solid ${theme.border}`, height: "100vh", position: "sticky", top: 0, overflowY: "auto" },
    content: { flex: 1, padding: "40px 50px" },
    sectionTitle: { fontSize: "18px", fontWeight: "700", color: theme.dark, marginBottom: "20px" },
    label: { display: "block", fontSize: "12px", fontWeight: "600", color: theme.lightText, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${theme.border}`, fontSize: "14px", marginBottom: "20px", boxSizing: "border-box", outline: "none" },
    btnPrimary: { width: "100%", padding: "14px", borderRadius: "8px", background: theme.primary, color: "#fff", border: "none", fontWeight: "600", cursor: "pointer" },
    btnSecondary: { width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "#F8FAFC", color: theme.lightText, border: `1px solid ${theme.border}`, cursor: "pointer" },
    tableWrapper: { background: theme.white, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 20px", background: "#F8FAFC", color: theme.lightText, fontSize: "12px", fontWeight: "700", borderBottom: `1px solid ${theme.border}` },
    td: { padding: "16px 20px", borderBottom: `1px solid ${theme.border}` },
    prodImg: { width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" },
    badge: (bg, color) => ({ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: bg, color: color }),
    iconBtn: { padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", marginLeft: "6px" }
  };

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
          <button 
          onClick={() => navigate("/seller/dashboard")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ background: "#F8FAFC", padding: "15px", borderRadius: "12px", marginBottom: "25px", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{width: '40px', height: '40px', background: theme.primary, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                {sellerProfile?.name?.charAt(0) || "S"}
            </div>
            <div>
                <div style={{fontSize: '14px', fontWeight: '700', color: theme.dark}}>{sellerProfile?.shopName || "My Shop"}</div>
                <div style={{fontSize: '11px', color: theme.lightText}}>Seller ID: #{sellerId}</div>
            </div>
        </div>

        <div style={s.sectionTitle}>{editId ? "Edit Listing" : "Add New Listing"}</div>
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Product Title</label>
          <input name="name" style={s.input} value={product.name} onChange={handleChange} required />

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Category</label>
              <select name="subcategoryId" style={s.input} value={product.subcategoryId} onChange={handleChange} required>
                <option value="">Select...</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Discount %</label>
              <input name="discount" type="number" style={s.input} value={product.discount} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Price (₹)</label>
              <input name="price" type="number" style={s.input} value={product.price} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Stock Qty</label>
              <input name="quantity" type="number" style={s.input} value={product.quantity} onChange={handleChange} required />
            </div>
          </div>

          <label style={s.label}>Delivery Estimation</label>
          <input name="deliveryDays" style={s.input} value={product.deliveryDays} onChange={handleChange} placeholder="e.g. 3-5 Days" />

          <label style={s.label}>Description</label>
          <textarea name="description" style={{ ...s.input, height: "60px", resize: "none" }} value={product.description} onChange={handleChange} />

          <label style={s.label}>Product Image</label>
          <input type="file" id="fileInput" name="imageFile" onChange={handleChange} style={{ marginBottom: "25px", fontSize: "13px" }} />

          <button type="submit" style={s.btnPrimary} disabled={loading}>
            {loading ? "Syncing..." : (editId ? "Update Listing" : "Publish to Shop")}
          </button>
          {editId && <button type="button" onClick={resetForm} style={s.btnSecondary}>Discard Edit</button>}
        </form>
      </aside>

      <main style={s.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: theme.dark }}>Shop Inventory</h1>
          <div style={s.badge("#EEF2FF", theme.primary)}>{products.length} Items Listed</div>
        </div>

        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Product Details</th>
                <th style={s.th}>Pricing</th>
                <th style={s.th}>Stock</th>
                <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="4" style={{...s.td, textAlign: 'center'}}>No products found.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.productId || p.id}>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <img src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : "https://via.placeholder.com/50"} style={s.prodImg} alt="" />
                        <div>
                          <div style={{fontWeight: "600", fontSize: "14px"}}>{p.name}</div>
                          <div style={{fontSize: '11px', color: theme.secondary}}>
                              {p.deliveryDays ? ` ${p.deliveryDays}` : "Standard Shipping"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: "700" }}>₹{p.price}</div>
                      {p.discount > 0 && <div style={{ fontSize: "11px", color: theme.secondary }}>-{p.discount}% OFF</div>}
                    </td>
                    <td style={s.td}>
                      {p.quantity > 0 ? <span style={s.badge("#ECFDF5", theme.secondary)}>{p.quantity} Units</span> : <span style={s.badge("#FEF2F2", theme.danger)}>Out of Stock</span>}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button onClick={() => handleEdit(p)} style={{ ...s.iconBtn, background: "#EEF2FF", color: theme.primary }}>Edit</button>
                      <button onClick={() => handleDelete(p.productId || p.id)} style={{ ...s.iconBtn, background: "#FEF2F2", color: theme.danger }}>Del</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default SellerProduct;