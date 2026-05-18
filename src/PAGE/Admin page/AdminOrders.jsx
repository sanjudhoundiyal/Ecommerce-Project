import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8080/api/orders";

  const fetchAllOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}`);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/update-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
        alert(`Order #${orderId} updated to ${newStatus}`);
      }
    } catch {
      alert("Status update failed");
    }
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  if (loading)
    return <div className="admin-loader">Loading Orders...</div>;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
            <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        <h4 className="sidebar-brand">MY SHOP</h4>
      </div>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2>Order Management</h2>
          </div>
        </header>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const totalQty =
                  order.orderItems?.reduce(
                    (sum, item) => sum + (item.quantity || 1),
                    0
                  ) || 0;

                return (
              
                  
                  
                  <tr key={order.id}>
                    
                    <td>
                      <strong>#{order.id}</strong>
                    </td>


                    {/* ✅ CUSTOMER */}
                    <td>
                      <div className="cust-info">
                        <span>
                          {order.username || order.user?.name || "Guest User"}
                        </span>
                      </div>
                    </td>

                    {/* ✅ ALL PRODUCT IMAGES */}
                    <td>
                      <div className="admin-product-stack">
                        {order.orderItems?.map((item, i) => (
                          <div key={i} className="stack-img-wrapper">
                            <img
                              src={
                                item.product?.imageUrl
                                  ? `http://localhost:8080${item.product.imageUrl}`
                                  : "https://via.placeholder.com/50"
                              }
                              alt="product"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* ✅ QUANTITY */}
                    <td>{totalQty} Pcs</td>

                    {/* ✅ TOTAL */}
                    <td>
                      <strong>₹{order.totalAmount}</strong>
                    </td>

                    {/* ✅ STATUS */}
                    <td>
                      <span
                        className={`badge-status ${
                          order.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* ✅ ACTION */}
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
          
        </div>
      </main>

      <style>{`
        .admin-container { display: flex; min-height: 100vh; background: #f4f7f6; }
        .admin-sidebar { width: 260px; background: #1a1c23; color: #fff; padding: 30px 20px; }
        .sidebar-brand { font-weight: 900; color: #ff3e6c; }

        .admin-main { flex: 1; padding: 40px; }
        .table-wrapper { overflow-x: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th, .admin-table td { padding: 15px; border-bottom: 1px solid #eee; }

        .admin-product-stack { display: flex; align-items: center; }
        .stack-img-wrapper {
          width: 45px;
          height: 55px;
          margin-left: -10px;
          border: 2px solid #fff;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stack-img-wrapper:first-child {
          margin-left: 0;
        }

        .stack-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-status.pending { color: orange; font-weight: 500; }
        .badge-status.shipped { color: blue; font-weight: 500; }
        .badge-status.delivered { color: green; font-weight: 500; }
        .badge-status.cancelled { color: red; font-weight: 500; }
        
        .status-select { padding: 6px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default AdminOrders;