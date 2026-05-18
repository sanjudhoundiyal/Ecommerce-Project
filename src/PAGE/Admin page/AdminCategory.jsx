import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function AdminCategory() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
 const navigate = useNavigate();
  const loadCategories = () => {
    fetch("http://localhost:8080/api/categories/list")
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `http://localhost:8080/api/categories/${editId}`
      : "http://localhost:8080/api/admin/addcategory";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description })
    });

    if (res.ok) {
      alert(editId ? "Updated ✅" : "Added ✅");
      setName(""); setSlug(""); setDescription(""); setEditId(null);
      loadCategories();
    } else {
      alert("Error ❌");
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setEditId(cat.id);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this category?")) return;
    await fetch(`http://localhost:8080/api/categories/delete/${id}`, { method: "DELETE" });
    loadCategories();
  };

  // --- UI STYLES ---
  const styles = {
    container: {
      backgroundColor: "#F2F4F7",
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#1A1C21"
    },
    contentWrapper: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "30px",
      textAlign: "left"
    },
    title: { fontSize: "28px", fontWeight: "700", color: "#111" },
    subtitle: { color: "#667085", fontSize: "14px" },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "20px",
      padding: "32px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      border: "1px solid #EAECF0",
      marginBottom: "30px"
    },
    inputGroup: { marginBottom: "20px" },
    label: { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#344054" },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #D0D5DD",
      fontSize: "15px",
      outline: "none",
      transition: "border 0.2s",
      backgroundColor: "#FFF"
    },
    readOnlyInput: { backgroundColor: "#F9FAFB", color: "#667085", border: "1px dashed #D0D5DD" },
    primaryBtn: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg, #ff3f6c 0%, #ff3f6c 100%)",
      color: "#FFF",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(255, 63, 108, 0.2)",
      marginTop: "10px"
    },
    table: {
      width: "100%",
      backgroundColor: "#FFF",
      borderRadius: "20px",
      overflow: "hidden",
      borderCollapse: "separate",
      borderSpacing: "0",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      border: "1px solid #EAECF0"
    },
    th: {
      backgroundColor: "#F9FAFB",
      padding: "16px",
      fontSize: "12px",
      fontWeight: "600",
      color: "#667085",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #EAECF0"
    },
    td: {
      padding: "16px",
      fontSize: "14px",
      color: "#1D2939",
      borderBottom: "1px solid #F2F4F7"
    },
    badge: {
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      backgroundColor: "#F2F4F7",
      color: "#344054"
    },
    editBtn: { background: "#FEF0C7", color: "#B54708", border: "none", padding: "6px 12px", borderRadius: "8px", marginRight: "8px", cursor: "pointer", fontWeight: "500" },
    deleteBtn: { background: "#FEE4E2", color: "#B42318", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
         <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
        <div style={styles.header}>
          <h1 style={styles.title}>Category Management</h1>
          <p style={styles.subtitle}>Organize your store products with high-level categories</p>
        </div>

        <div className="grid-container" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          
          {/* --- ADD/EDIT FORM --- */}
          <div>
            <div style={styles.card}>
              <h3 style={{ fontSize: "18px", marginBottom: "20px", fontWeight: "700" }}>
                {editId ? "Edit Category" : "New Category"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category Name</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Electronics"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setName(value);
                      setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                    }}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>URL Slug</label>
                  <input
                    style={{ ...styles.input, ...styles.readOnlyInput }}
                    value={slug}
                    readOnly
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{ ...styles.input, minHeight: "100px", resize: "none" }}
                    placeholder="Short summary of this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button style={styles.primaryBtn}>
                  {editId ? "Update Category" : "Add Category"}
                </button>
                {editId && (
                    <button 
                        type="button" 
                        onClick={() => {setEditId(null); setName(""); setSlug(""); setDescription("");}}
                        style={{...styles.primaryBtn, background: "#F2F4F7", color: "#475467", boxShadow: "none", marginTop: "10px"}}
                    >Cancel</button>
                )}
              </form>
            </div>
          </div>

          {/* --- CATEGORY LIST --- */}
          <div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Slug</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={styles.td}><strong>{cat.name}</strong></td>
                    <td style={styles.td}><span style={styles.badge}>{cat.slug}</span></td>
                    <td style={styles.td}>{cat.description ? cat.description.substring(0, 30) + "..." : "-"}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(cat)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(cat.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminCategory;