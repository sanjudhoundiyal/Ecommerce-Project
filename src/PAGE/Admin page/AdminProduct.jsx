import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function AdminProduct() {
  const [product, setProduct] = useState({
    name: "",
    slug: "",
    price: "",
    quantity: "",
    discount: 0,
    description: "",
    subcategoryId: "",
    deliveryDays: "" 
  });
  const [imageFile, setImageFile] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080/api/products";

  useEffect(() => {
    loadSubCategories();
    loadProducts();
  }, []);

  const loadSubCategories = () => {
    fetch("http://localhost:8080/api/subcategories")
      .then((res) => res.json())
      .then((data) => setSubcategories(data))
      .catch((err) => console.error(err));
  };

  const loadProducts = () => {
    fetch(BASE_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setImageFile(files[0]);
    } else if (name === "name") {
      const slug = value.toLowerCase().replace(/\s+/g, "-");
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
      subcategoryId: p.subCategory?.id || p.subCategory?.subCategoryId || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
        if (res.ok) loadProducts();
      } catch (err) {
        console.error("Delete failed.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("slug", product.slug);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("discount", product.discount);
    formData.append("description", product.description);
    formData.append("subcategoryId", product.subcategoryId);

formData.append("deliveryDays", product.deliveryDays);

    if (imageFile) formData.append("image", imageFile);

    const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, { method, body: formData });
      if (response.ok) {
        resetForm();
        loadProducts();
        Swal.fire({
  icon: "success",
  title: editId ? "Updated Successfully" : "Added Successfully",
  text: editId
    ? "Your data has been updated successfully."
    : "Your data has been added successfully.",
  confirmButtonColor: "#ff3f6c",
  timer: 2000,
  showConfirmButton: false,
});
      } else {
        const errorMsg = await response.text();
        console.error("Server Error:", errorMsg);
       Swal.fire({
  icon: "error",
  title: "Server Error",
  text: errorMsg,
});
      }
    } catch (err) {

    Swal.fire({
  icon: "error",
  title: "Error",
  text: "Error saving product.",
});
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProduct({
      name: "", slug: "", price: "", quantity: "", discount: 0, description: "", subcategoryId: "", deliveryDays: ""
    });
    setImageFile(null);
    setEditId(null);
    if (document.getElementById("fileInput")) document.getElementById("fileInput").value = "";
  };

  const theme = {
    primary: "#ff3f6c", secondary: "#10B981", danger: "#EF4444",
    dark: "#1E293B", lightText: "#64748B", bg: "#F1F5F9",
    white: "#FFFFFF", border: "#E2E8F0"
  };

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "380px", background: theme.white, padding: "40px 30px", borderRight: `1px solid ${theme.border}`, height: "100vh", position: "sticky", top: 0, overflowY: "auto" },
    content: { flex: 1, padding: "40px 50px" },
    sectionTitle: { fontSize: "22px", fontWeight: "700", color: theme.dark, marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" },
    formCard: { background: theme.white, borderRadius: "12px" },
    label: { display: "block", fontSize: "12px", fontWeight: "600", color: theme.lightText, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${theme.border}`, fontSize: "14px", marginBottom: "20px", transition: "all 0.2s", outline: "none", boxSizing: "border-box" },
    btnPrimary: { width: "100%", padding: "14px", borderRadius: "8px", background: theme.primary, color: "#fff", border: "none", fontWeight: "600", cursor: "pointer", transition: "0.2s", boxShadow: "0 4px 10px rgba(79, 70, 229, 0.2)" },
    btnSecondary: { width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", background: "#F8FAFC", color: theme.lightText, border: `1px solid ${theme.border}`, cursor: "pointer" },
    tableWrapper: { background: theme.white, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px 20px", background: "#F8FAFC", color: theme.lightText, fontSize: "12px", fontWeight: "700", borderBottom: `1px solid ${theme.border}` },
    td: { padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, verticalAlign: "middle" },
    prodName: { fontWeight: "600", color: theme.dark, fontSize: "14px" },
    prodImg: { width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", background: "#f1f1f1" },
    badge: (bg, color) => ({ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: bg, color: color }),
    iconBtn: { padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", marginLeft: "6px", transition: "0.2s" }
  };

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
         <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
        <div style={s.sectionTitle}>{editId ? "⚡ Edit Product" : "✨ Add Product"}</div>
        <form onSubmit={handleSubmit} style={s.formCard}>
          <label style={s.label}>Product Name</label>
          <input name="name" style={s.input} value={product.name} onChange={handleChange} required />

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Price (₹)</label>
              <input name="price" type="number" style={s.input} value={product.price} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Disc %</label>
              <input name="discount" type="number" style={s.input} value={product.discount} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Stock Qty</label>
              <input name="quantity" type="number" style={s.input} value={product.quantity} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Category</label>
              <select name="subcategoryId" style={s.input} value={product.subcategoryId} onChange={handleChange} required>
                <option value="">Select...</option>
                {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          </div>

          <label style={s.label}>Expected Delivery (e.g. 2-3 Days)</label>
          <input 
            name="deliveryDays" 
            style={s.input} 
            value={product.deliveryDays} 
            onChange={handleChange} 
            placeholder="e.g. 15 Oct or 3 Days" 
          />

          <label style={s.label}>Description</label>
          <textarea name="description" style={{ ...s.input, height: "80px", resize: "none" }} value={product.description} onChange={handleChange} />

          <label style={s.label}>Image Asset</label>
          <input type="file" id="fileInput" name="imageFile" onChange={handleChange} style={{ marginBottom: "25px", fontSize: "13px" }} />

          <button type="submit" style={s.btnPrimary} disabled={loading}>
            {loading ? "Syncing..." : (editId ? "Update Item" : "Publish Item")}
          </button>
          {editId && <button type="button" onClick={resetForm} style={s.btnSecondary}>Discard Edit</button>}
        </form>
      </aside>

      <main style={s.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: theme.dark }}>Inventory Dashboard</h1>
          <div style={s.badge("#EEF2FF", theme.primary)}>{products.length} Products Found</div>
        </div>

        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Product Details</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Pricing</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Delivery</th>
                <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.productId || p.id}>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <img src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : 'https://via.placeholder.com/50'} style={s.prodImg} alt="" />
                      <span style={s.prodName}>{p.name}</span>
                    </div>
                  </td>
                  <td style={s.td}><span style={{ color: theme.lightText, fontSize: "13px" }}>{p.subCategory?.name || "General"}</span></td>
                  <td style={s.td}>
                    <div style={{ fontWeight: "700", color: theme.dark }}>₹{p.price}</div>
                    {p.discount > 0 && <div style={{ fontSize: "11px", color: theme.secondary }}>-{p.discount}% Off</div>}
                  </td>
                  <td style={s.td}>
                    {p.quantity > 0 ? <span style={s.badge("#ECFDF5", theme.secondary)}>{p.quantity} In Stock</span> : <span style={s.badge("#FEF2F2", theme.danger)}>Out of Stock</span>}
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize: "13px", color: theme.lightText }}>
                      {p.deliveryDays || "Not Set"}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <button onClick={() => handleEdit(p)} style={{ ...s.iconBtn, background: "#EEF2FF", color: theme.primary }}>Edit</button>
                    <button onClick={() => handleDelete(p.productId || p.id)} style={{ ...s.iconBtn, background: "#FEF2F2", color: theme.danger }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminProduct;