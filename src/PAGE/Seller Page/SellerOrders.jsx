import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Retrieve the seller object from localStorage
  const savedSeller = localStorage.getItem("sellerData");
  const seller = savedSeller ? JSON.parse(savedSeller) : null;
  const sellerId = seller?.id;

  // BASE URL - Adjust if your backend doesn't use /api
  const BASE_URL = "http://localhost:8080/api/seller";

  useEffect(() => {
    if (!sellerId) {
      console.error("No seller session found.");
      navigate("/seller/login");
      return;
    }

    fetchOrders();
  }, [sellerId]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${BASE_URL}/orders/${sellerId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  const updateStatus = async (orderId, status) => {
    try {
      // Note: Path usually matches your backend @PutMapping
      const res = await fetch(
        `http://localhost:8080/api/seller/update-status/${orderId}?status=${status}`,
        { method: "PUT" }
      );
      
      if (res.ok) {
        const updatedOrder = await res.json();
        // Update the local state so the UI reflects the change immediately
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          ← Back to Dashboard
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-dark m-0">Order Management</h2>
            <p className="text-muted small mb-0">Update shipment status and track customer purchases.</p>
          </div>
          <div className="text-end">
  <span
    className="badge rounded-pill px-3 py-2"
    style={{ backgroundColor: "#ff3f6c", color: "#fff" }}
  >
    Total Orders: {orders.length}
  </span>
</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: "15px" }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              <tr>
                <th className="ps-4 py-3">Product</th>
                <th className="py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3 text-center">Total</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody className="border-top-0">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="ps-4 py-3">
                      {/* Mapping through items within the order */}
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center mb-1">
                          <img
                            src={item.product?.imageUrl ? `http://localhost:8080${item.product.imageUrl}` : "https://via.placeholder.com/50"}
                            alt=""
                            width="40"
                            height="40"
                            className="rounded shadow-sm border me-2"
                            style={{ objectFit: "cover" }}
                          />
                          <span className="small fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
                            {item.product?.name} <span className="text-muted">x{item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">#{order.id}</span>
                    </td>
                    <td className="fw-bold text-dark">
                      {order.user?.name || order.username || "Guest"}
                    </td>
                   <td
  className="text-center fw-bold"
  style={{ color: "#0c0103" }}
>
  ₹{(order.totalAmount || 0).toLocaleString()}
</td>
                    <td>
                      <span className={`badge px-2 py-1 rounded-pill ${
                        order.paymentStatus === "PAID" ? "bg-success-subtle text-success border border-success" : "bg-warning-subtle text-warning border border-warning"
                      }`} style={{ fontSize: "0.7rem" }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="pe-4">
                      <select
  value={order.status}
  onChange={(e) => updateStatus(order.id, e.target.value)}
  className="form-select form-select-sm fw-bold"
  style={{
    borderRadius: "8px",
    width: "130px",
    color:
      order.status === "DELIVERED"
        ? "#198754"
        : order.status === "CANCELLED"
        ? "#dc3545"
        : "#ff3f6c"
  }}
>
  <option value="PENDING">PENDING</option>
  <option value="SHIPPED">SHIPPED</option>
  <option value="DELIVERED">DELIVERED</option>
  <option value="CANCELLED">CANCELLED</option>
</select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <h5>No orders found for your shop yet.</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SellerOrders;