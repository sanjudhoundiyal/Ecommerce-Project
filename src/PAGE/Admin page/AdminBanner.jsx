

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function AdminBanner() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = () => {
    fetch("http://localhost:8080/api/banner")
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error("Error fetching banners:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    
    // Agar image select ki hai tabhi append karein
    if (image) {
      formData.append("image", image);
    }

    const url = editId
      ? `http://localhost:8080/api/banner/update/${editId}`
      : "http://localhost:8080/api/banner/add";

    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        body: formData,
        // (Note: Content-Type header explicitly set karne ki zaroorat nahi hai 
        // jab hum FormData bhejte hain, browser apne aap boundary set kar deta hai)
      });

      if (response.ok) {
        alert(editId ? "Banner Updated ✅" : "Banner Added ✅");
        
        // Reset form states
        setTitle("");
        setSubtitle("");
        setImage(null);
        setEditId(null);
        
        fetchBanners();
      } else {
        const errorText = await response.text();
        alert("Failed to save banner: " + errorText);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network Error! Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/banner/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Deleted ✅");
        fetchBanners();
      } else {
        alert("Failed to delete banner");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleEdit = (b) => {
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setEditId(b.id);
  };

  return (
    <div style={styles.adminContainer}>
      <div style={styles.contentLayout}>

         <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
        {/* Form Panel */}
        <div style={styles.panel}>
          <div style={styles.header}>
            <h2 style={styles.title}>{editId ? "Edit Banner" : "Add New Banner"}</h2>
            <p style={styles.subtitleText}>
              {editId
                ? "Update information for this banner."
                : "Create a new hero banner for your store."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Banner Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Collection"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Subtitle Text</label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Up to 40% off on all items"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Banner Image</label>
              <div style={styles.fileUploadWrapper}>
                <input
                  type="file"
                  id="banner-image"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={styles.fileInput}
                />
                <label htmlFor="banner-image" style={styles.fileLabel}>
                  {image ? image.name : "Choose a file..."}
                </label>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Banner" : "Add Banner"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setSubtitle("");
                    setImage(null);
                    setEditId(null);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Banners List Panel */}
        <div style={styles.panel}>
          <div style={styles.header}>
            <h3 style={styles.listTitle}>All Banners</h3>
            <p style={styles.subtitleText}>Manage your uploaded hero banners.</p>
          </div>

          {banners.length > 0 ? (
            <div style={styles.grid}>
              {banners.map((b) => {
                const fileName = b.imageUrl ? b.imageUrl.split("/").pop() : "";
                const imageUrl = b.imageUrl
                  ? `http://localhost:8080/uploads/${encodeURIComponent(fileName)}`
                  : "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a";

                return (
                  <div key={b.id} style={styles.card}>
                    <div style={styles.imageWrapper}>
                      <img
                        src={imageUrl}
                        alt={b.title}
                        style={styles.cardImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>
                    <div style={styles.cardBody}>
                      <h4 style={styles.cardTitle}>{b.title}</h4>
                      <p style={styles.cardSubtitle}>{b.subtitle}</p>
                      <div style={styles.cardActions}>
                        <button
                          onClick={() => handleEdit(b)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>No banners available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  adminContainer: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  contentLayout: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "32px",
  },
  panel: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    margin: "0 0 6px 0",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
  },
  listTitle: {
    margin: "0 0 6px 0",
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "600",
  },
  subtitleText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  fileUploadWrapper: {
    display: "flex",
    alignItems: "center",
  },
  fileInput: {
    display: "none",
  },
  fileLabel: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    border: "1px dashed #94a3b8",
    borderRadius: "8px",
    textAlign: "center",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  submitButton: {
    flex: 1,
    padding: "14px 20px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
    transition: "background-color 0.2s",
  },
  cancelButton: {
    padding: "14px 20px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  imageWrapper: {
    width: "140px",
    height: "140px",
    flexShrink: 0,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flexGrow: 1,
  },
  cardTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    color: "#0f172a",
  },
  cardSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  cardActions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  editButton: {
    padding: "6px 16px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 16px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "#94a3b8",
  },
};

export default AdminBanner;