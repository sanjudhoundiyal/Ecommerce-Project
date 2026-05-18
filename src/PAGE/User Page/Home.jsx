import React, { useEffect, useState } from "react";

function Home() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/banner")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBanners(data);
        } else if (data && Array.isArray(data.content)) {
          setBanners(data.content);
        } else {
          setBanners([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching banners:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <p style={{ ...styles.loadingText, color: "#ff3f6c" }}>
            Failed to load banners: {error}
          </p>
          <p style={{ fontSize: "13px", color: "#696b79", marginTop: "8px" }}>
            Make sure your backend is running on port 8080.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .myntra-btn:hover {
          background-color: #ff2c54 !important;
          box-shadow: 0 4px 12px rgba(255, 60, 108, 0.4);
        }
        .myntra-sec-btn:hover {
          background-color: #f4f5f7 !important;
          color: #ff3f6c !important;
          border-color: #ff3f6c !important;
        }
        .animate-slide-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out forwards;
        }
      `}</style>

      {/* Hero / Banner Section */}
      <section style={styles.heroSection}>
        {banners.length > 0 ? (
          banners.map((b) => {
            const fileName = b.imageUrl ? b.imageUrl.split("/").pop() : "";
            const imageUrl = b.imageUrl
              ? `http://localhost:8080/uploads/${encodeURIComponent(fileName)}`
              : "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a";

            return (
              <div 
                key={b.id || Math.random()} 
                style={styles.bannerContainer}
                className="animate-fade-in"
              >
                {/* Left Side: Text Content */}
                <div style={styles.textSide}>
                  <div style={styles.textContainer} className="animate-slide-up">
                    <div style={styles.badgeWrapper}>
                      <span style={styles.badge}>FLAT 70% OFF</span>
                    </div>

                    <h1 style={styles.title}>{b.title || "Default Title"}</h1>
                    
                    <p style={styles.subtitle}>
                      {b.subtitle || "Default Subtitle"}
                    </p>

                    <div style={styles.buttonGroup}></div>

                    <div style={styles.trustBadgeContainer}>
                      <span style={styles.trustBadge}>
                        <strong>100%</strong> ORIGINAL
                      </span>
                      <span style={styles.trustBadge}>
                        <strong>Easy</strong> RETURNS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Image Content */}
                <div style={styles.imageSide}>
                  <img
                    src={imageUrl}
                    alt={b.title || "Banner Image"}
                    style={styles.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                  <div style={styles.imageOverlay}></div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>No banners found in database.</p>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    margin: 0,
    boxSizing: "border-box",
  },
  heroSection: {
    width: "100%",
  },
  bannerContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "580px",
    backgroundColor: "#ffffff",
  },
  textSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "40px 6%",
    backgroundColor: "#ffffff",
  },
  textContainer: {
    maxWidth: "580px",
  },
  badgeWrapper: {
    marginBottom: "16px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#f4f5f7",
    color: "#ff3f6c",
    padding: "6px 14px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    border: "1px solid #d4d5d9",
  },
  title: {
    fontSize: "52px",
    fontWeight: "800",
    lineHeight: "1.05",
    color: "#282c3f",
    marginBottom: "20px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#7e818c",
    marginBottom: "24px",
    maxWidth: "480px",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
  },
  trustBadgeContainer: {
    display: "flex",
    gap: "24px",
    borderTop: "1px solid #f4f5f7",
    paddingTop: "24px",
  },
  trustBadge: {
    fontSize: "13px",
    color: "#3e4152",
    fontWeight: "400",
  },
  imageSide: {
    flex: 1,
    position: "relative",
    height: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(270deg, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.6) 100%)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "580px",
    backgroundColor: "#ffffff",
    color: "#696b79",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #d4d5d9",
    borderTop: "3px solid #ff3f6c",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "15px",
    fontWeight: "500",
    letterSpacing: "0.02em",
    color: "#696b79",
  },
};

export default Home;