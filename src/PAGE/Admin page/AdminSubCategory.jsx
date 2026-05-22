    import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
    function AdminSubCategory() {
      const [subcategories, setSubcategories] = useState([]);
      const [categories, setCategories] = useState([]); 
      const [name, setName] = useState("");
      const [slug, setSlug] = useState("");
      const [categoryId, setCategoryId] = useState("");
      const [editId, setEditId] = useState(null);

      const navigate = useNavigate();
      const BASE_URL = "http://localhost:8080";

      // --- Data Loading ---
      const loadSub = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/subcategories`);
          const data = await res.json();
          setSubcategories(Array.isArray(data) ? data : (data.content || []));
        } catch (err) {
          console.error("Error loading subs:", err);
        }
      };

     const loadCategories = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/categories/list`);

    console.log("STATUS 👉", res.status); // 👈 ADD
    const data = await res.json();

    console.log("DATA 👉", data); // 👈 ADD

    setCategories(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error loading categories:", err);
  }
};
      

      useEffect(() => {
        loadSub();
        loadCategories();
      }, []);

      const getCategoryName = (sub) => {
        if (sub.category && sub.category.name) return sub.category.name;
        // Fallback search in state
        const parent = categories.find(c => String(c.id) === String(sub.categoryId || sub.category?.id));
        return parent ? parent.name : "Unassigned";
      };

      // --- Handlers ---
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId) return alert("Please select a category");

        try {
          const res = await fetch(`${BASE_URL}/api/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              name, 
              slug, 
              category: { id: Number(categoryId) } 
            }),
          });

          if (res.ok) {

            Swal.fire({title:" 🚀SubCategory Created!"})
           
            resetForm();
            loadSub();
          }
        } catch (err) {

          
            Swal.fire({title:" 🚀 Error Creating SubCategory Created!"})
        
        }
      };

      const handleUpdate = async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`${BASE_URL}/api/subcategories/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              name, 
              slug, 
              category: { id: Number(categoryId) } 
            }),
          });
          if (res.ok) {
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
            resetForm();
            loadSub();
          }
        } catch (err) {
          
            Swal.fire({title:" Server Error during update"})
      
        }
      };

      const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
          const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, { method: "DELETE" });
          if (res.ok) {
           Swal.fire({
  icon: "success",
  title: "Deleted!",
  text: "Item has been deleted successfully.",
  showConfirmButton: false,
  timer: 2000,
});
            if (editId === id) resetForm();
            loadSub();
          }
        } catch (err) {
          Swal.fire({
  icon: "Warning",
  title: "Deleted!",
  text: "Item Delete Fails",
  showConfirmButton: false,
  timer: 2000,
});
        }
      };

      const resetForm = () => {
        setEditId(null);
        setName("");
        setSlug("");
        setCategoryId("");
      };

      // --- STYLES ---
      const s = {
        wrapper: { display: 'flex', minHeight: '100vh', background: '#FBFBFD', color: '#1D1D1F', fontFamily: '-apple-system, sans-serif' },
        sidebar: { width: '280px', background: 'rgba(255, 255, 255, 0.8)', padding: '40px 24px', borderRight: '1px solid rgba(0,0,0,0.05)' },
        main: { flex: 1, padding: '60px 80px' },
        card: { background: '#FFFFFF', padding: '35px', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' },
        input: { width: '100%', padding: '16px', marginBottom: '24px', borderRadius: '14px', border: '1px solid #D2D2D7', boxSizing: 'border-box' },
        btnPrimary: { width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: '#ff3f6c', color: '#fff', fontWeight: '600', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '18px', borderBottom: '1px solid #D2D2D7', color: '#86868B', fontSize: '12px' },
        td: { padding: '20px 18px', borderBottom: '1px solid #F5F5F7' },
        badge: { background: '#E8F2FF', color: '"#ff3f6c', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
        actionBtn: { padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', cursor: 'pointer', marginRight: '8px' }
      };

      return (
        <div style={s.wrapper}>
          <div style={s.sidebar}>
            <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
            <div style={{padding: '12px', cursor: 'pointer'}} onClick={() => navigate("/admin")}>Dashboard</div>
            <div style={{padding: '12px', cursor: 'pointer'}} onClick={() => navigate("/admin/category")}>Category</div>
            <div style={{padding: '12px', color: '#ff3f6c', fontWeight: '600'}}>Sub Category</div>
          </div>

          <div style={s.main}>
            <h1 style={{ fontSize: '40px', fontWeight: '700' }}>SubCategory</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '50px', marginTop: '40px' }}>
              
              <div style={s.card}>
                <h3>{editId ? "Update SubCategory" : "Add New"}</h3>
                <form onSubmit={editId ? handleUpdate : handleSubmit}>
                  <label style={{fontSize: '12px', color: '#86868B'}}>Subcategory Name</label>
                  <input
                    style={s.input}
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    required
                  />

                  <label style={{fontSize: '12px', color: '#86868B'}}>Select Parent Category</label>
                  <select 
                    style={s.input} 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading categories...</option>
                    )}
                  </select>

                  <button style={s.btnPrimary}>{editId ? "Update" : "Create"}</button>
                  {editId && <button type="button" onClick={resetForm} style={{width:'100%', background:'none', border:'none', marginTop:'10px', cursor: 'pointer'}}>Cancel</button>}
                </form>
              </div>

              <div style={s.card}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Identity</th>
                      <th style={s.th}>Parent Category</th>
                      <th style={{...s.th, textAlign: 'right'}}>Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategories.map(sub => (
                      <tr key={sub.id}>
                        <td style={s.td}><strong>{sub.name}</strong></td>
                        <td style={s.td}>
                          <span style={s.badge}>{getCategoryName(sub)}</span>
                        </td>
                        <td style={{...s.td, textAlign: 'right'}}>
                          <button style={{...s.actionBtn, background: '#F5F5F7'}} onClick={() => {
                            setEditId(sub.id);
                            setName(sub.name);
                            setSlug(sub.slug);
                            setCategoryId(sub.category?.id || "");
                          }}>Edit</button>
                          <button style={{...s.actionBtn, background: '#FFF1F0', color: '#FF3B30'}} onClick={() => handleDelete(sub.id)}>Delete</button>
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

    export default AdminSubCategory;