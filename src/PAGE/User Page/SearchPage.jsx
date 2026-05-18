import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import Swal from "sweetalert2";
const API_BASE_URL = "http://localhost:8080";

function SearchPage() {
  const { keyword } = useParams();
  const navigate = useNavigate();

  const decodedKeyword = useMemo(
    () => (keyword ? decodeURIComponent(keyword) : ""),
    [keyword]
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: State for full-screen image view
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!decodedKeyword) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(decodedKeyword)}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setProducts([]);
        setLoading(false);
      });
  }, [decodedKeyword]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    path = path.replace(/\\/g, "/");
    if (!path.startsWith("/")) path = "/" + path;
    return `${API_BASE_URL}${path}`;
  };

  // ✅ NEW: Handle clicking the image specifically
  const handleImageClick = (e, url) => {
    e.stopPropagation(); // Prevents navigating to product detail
    setSelectedImage(url);
  };

  if (loading) return <div style={styles.container}><p>Searching products...</p></div>;

  return (
    <div style={styles.container}>
      {/* ✅ FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div style={styles.modalContent}>
            <img src={selectedImage} alt="Full view" style={styles.fullImage} />
            <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}>✕</button>
          </div>
        </div>
      )}

      <h2>Results for: <span style={{ color: "#2563eb" }}>"{decodedKeyword}"</span></h2>
      <p style={styles.count}>{products.length} products found in the catalog</p>
      <hr style={styles.divider} />

      {products.length === 0 ? (
        <p style={styles.noResults}>No products found for "{decodedKeyword}"</p>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => {
            const imageUrl = getImageUrl(product.image || product.imageUrl || product.img || product.photo);

            return (
              <div
                key={product.id}
                style={styles.card}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* IMAGE SECTION */}
                <div style={styles.imageContainer}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name || "Product"}
                      style={styles.image}
                      onClick={(e) => handleImageClick(e, imageUrl)} // 🔥 Trigger Full View
                      onError={(e) => { e.target.src = "/no-image.png"; }}
                    />
                  ) : (
                    <div style={styles.placeholderImage}>No Image</div>
                  )}
                  <div style={styles.imageHint}>Click for Full View</div>
                </div>

                {/* CONTENT SECTION */}
                <div style={styles.cardContent}>
                  <p style={styles.category}>
                    {product.category?.name || product.category || "General"}
                  </p>
                  <h3 style={styles.productName}>{product.name || "Unnamed Item"}</h3>

                  <p style={styles.price}>
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </p>

                  <p style={styles.description}>
                    {(product.description || "No description provided.").substring(0, 75)}...
                  </p>

                  <div style={styles.footer}>
                    <span style={styles.delivery}>🚚 Standard Delivery: 3-5 Days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 🎨 ENHANCED STYLES FOR "REAL LIFE" FEEL
const styles = {
  container: { padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", backgroundColor: "#fcfcfc" },
  count: { color: "#888", fontSize: "14px" },
  divider: { margin: "20px 0", border: "0.5px solid #eee" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  
  // Card Enhancement
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    border: "1px solid #f0f0f0",
  },
  imageContainer: { height: "220px", background: "#f9f9f9", position: "relative", overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" },
  imageHint: { 
    position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", 
    color: "#fff", padding: "4px 8px", fontSize: "10px", borderRadius: "4px", opacity: 0.8 
  },
  
  // Content Styles
  cardContent: { padding: "18px" },
  category: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: "5px" },
  productName: { fontSize: "17px", fontWeight: "600", marginBottom: "8px", color: "#1a1a1a" },
  price: { fontSize: "20px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px" },
  description: { fontSize: "13px", color: "#666", lineHeight: "1.5", marginBottom: "15px" },
  
  footer: { borderTop: "1px solid #f5f5f5", paddingTop: "12px" },
  delivery: { fontSize: "12px", color: "#16a34a", fontWeight: "500" },

  // ✅ MODAL STYLES
  modalOverlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
  },
  modalContent: { position: "relative", maxWidth: "90%", maxHeight: "90%" },
  fullImage: { maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", boxShadow: "0 0 20px rgba(255,255,255,0.2)" },
  closeBtn: { 
    position: "absolute", top: "-40px", right: "0", background: "none", border: "none", 
    color: "#fff", fontSize: "24px", cursor: "pointer" 
  }
};

export default SearchPage;