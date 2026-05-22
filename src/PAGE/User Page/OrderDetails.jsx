import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

function OrderDetails() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Feedback State
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  // ✅ Fetch Order Details
  const fetchOrderDetails = useCallback(() => {

    if (!id) return;

    fetch(`http://localhost:8080/api/orders/${id}`)
      .then((res) => {

        if (!res.ok) {
          throw new Error("Order not found");
        }

        return res.json();
      })
      .then((data) => {
        setOrderData(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Order load failed ❌");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [id]);

  // ✅ Auto Refresh
  useEffect(() => {

    fetchOrderDetails();

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 5000);

    return () => clearInterval(interval);

  }, [fetchOrderDetails]);

  // ✅ Cancel Order
  const handleCancelOrder = async (orderId) => {

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:8080/api/orders/cancel/${orderId}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {

        Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          text: "Order Cancelled Successfully ✅",
          confirmButtonColor: "#ff3e6c",
        });

        fetchOrderDetails();

      } else {

        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to cancel order",
        });

      }

    } catch (err) {

      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again",
      });

    }
  };

  // ✅ Submit Feedback
  const submitFeedback = async (productId) => {

    try {

      const userId = localStorage.getItem("userId");

      const payload = {
        userId,
        productId,
        rating: ratings[productId] || 5,
        comment: comments[productId] || "",
      };

      const response = await fetch(
        "http://localhost:8080/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {

        Swal.fire({
          icon: "success",
          title: "Feedback Submitted",
          text: "Thank you for your feedback ❤️",
          confirmButtonColor: "#ff3e6c",
        });

      } else {

        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Feedback submission failed",
        });

      }

    } catch (err) {

      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });

    }
  };

  // ✅ Loading
  if (loading) {

    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading order...
      </div>
    );
  }

  // ✅ No Order
  if (!orderData) {

    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        No order found ❌
      </div>
    );
  }

  // ✅ Tracking Steps
  const steps = [
    "PLACED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentStep = steps.indexOf(
    orderData.status?.toUpperCase()
  );

  return (

    <div style={styles.wrapper}>

      <div style={styles.container}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={styles.back}
        >
          ← Back
        </button>

        {/* Header */}
        <h2>Order #{orderData.id}</h2>

        <p>
          Status:
          <b
            style={{
              color:
                orderData.status === "CANCELLED"
                  ? "#ef4444"
                  : "#22c55e",
              marginLeft: "8px",
            }}
          >
            {orderData.status}
          </b>
        </p>

        {/* Tracking */}
        {orderData.status !== "CANCELLED" && (

          <div style={styles.trackingWrapper}>

            <div style={styles.line}></div>

            <div
              style={{
                ...styles.progress,
                width:
                  currentStep >= 0
                    ? `${(currentStep / (steps.length - 1)) * 100}%`
                    : "0%",
              }}
            ></div>

            {steps.map((step, i) => (

              <div key={i} style={styles.step}>

                <div
                  style={{
                    ...styles.circle,
                    background:
                      i <= currentStep
                        ? "#22c55e"
                        : "#e5e7eb",

                    color:
                      i <= currentStep
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>

                <p style={styles.label}>
                  {step.replaceAll("_", " ")}
                </p>

              </div>

            ))}

          </div>

        )}

        {/* Items */}
        <div>

          <h3>Items</h3>

          {orderData.orderItems?.map((item, index) => (

            <div key={index} style={styles.itemCard}>

              <div style={styles.item}>

                <img
                  src={`http://localhost:8080${item.product?.imageUrl}`}
                  style={styles.img}
                  alt={item.product?.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/60";
                  }}
                />

                <div style={{ flex: 1 }}>
                  <h4>{item.product?.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>

              </div>

              {/* ✅ Feedback Form only if DELIVERED */}
              {orderData.status === "Delivered" && (

                <div style={styles.feedbackBox}>

                  <h4>Give Feedback</h4>

                  {/* Rating */}
                  <select
                    value={ratings[item.product?.id] || 5}
                    onChange={(e) =>
                      setRatings({
                        ...ratings,
                        [item.product?.id]: e.target.value,
                      })
                    }
                    style={styles.select}
                  >
                    <option value="5">⭐⭐⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="1">⭐</option>
                  </select>

                  {/* Comment */}
                  <textarea
                    placeholder="Write your feedback..."
                    value={comments[item.product?.id] || ""}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [item.product?.id]: e.target.value,
                      })
                    }
                    style={styles.textarea}
                  />

                  {/* Submit */}
                  <button
                    style={styles.feedbackBtn}
                    onClick={() =>
                      submitFeedback(item.product?.id)
                    }
                  >
                    Submit Feedback
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

        {/* Summary */}
        <div style={styles.summary}>

          <h3>Summary</h3>

          <p>
            <b>Total:</b> ₹{orderData.totalAmount}
          </p>

          {/* Cancel Button */}
          {orderData.status !== "CANCELLED" &&
          orderData.status !== "Delivered" ? (

            <button
              onClick={() =>
                handleCancelOrder(orderData.id)
              }
              style={styles.cancelBtn}
            >
              Cancel Order
            </button>

          ) : (
            orderData.status === "CANCELLED" && (
              <p
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                This order has been cancelled.
              </p>
            )
          )}

        </div>

      </div>

    </div>
  );
}

// ✅ Styles
const styles = {

  wrapper: {
    padding: "30px",
    background: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },

  container: {
    maxWidth: "800px",
    margin: "auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  back: {
    marginBottom: "10px",
    cursor: "pointer",
    border: "none",
    background: "none",
    color: "#ff3f6c",
    fontWeight: "600",
  },

  trackingWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    margin: "40px 0",
  },

  line: {
    position: "absolute",
    top: "18px",
    left: 0,
    right: 0,
    height: "4px",
    background: "#e5e7eb",
  },

  progress: {
    position: "absolute",
    top: "18px",
    left: 0,
    height: "4px",
    background: "#22c55e",
    transition: "width 0.3s ease",
  },

  step: {
    textAlign: "center",
    flex: 1,
    zIndex: 2,
  },

  circle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    lineHeight: "36px",
    margin: "auto",
    fontWeight: "bold",
  },

  label: {
    fontSize: "12px",
    marginTop: "6px",
  },

  itemCard: {
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  img: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
  },

  summary: {
    marginTop: "20px",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },

  cancelBtn: {
    marginTop: "15px",
    padding: "10px 24px",
    backgroundColor: "#fff",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
  },

  feedbackBox: {
    marginTop: "15px",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "8px",
  },

  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },

  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    marginBottom: "10px",
  },

  feedbackBtn: {
    background: "#ff3f6c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },

};

export default OrderDetails;