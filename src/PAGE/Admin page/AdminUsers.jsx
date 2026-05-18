import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


  const API = "http://localhost:8080/api/users"; // ✅ your required API

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await fetch(API);

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();
      console.log("API Response:", data); // 🔥 DEBUG

      // ✅ HANDLE ALL RESPONSE TYPES
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.data) {
        setUsers(data.data);
      } else if (data.users) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ DELETE USER
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      // ✅ UPDATE UI
      setUsers((prev) => prev.filter((u) => u.id !== id));

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading Users...</h3>;
  }

  return (
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh" }}>
      
      <h2 style={{ marginBottom: "20px" }}>👥 All Users</h2>
 <button 
          onClick={() => navigate("/admin")} // 3. Logic to go back
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "10px" }}>ID</th>
              <th style={{ padding: "10px" }}>Name</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Role</th>
              <th style={{ padding: "10px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  ❌ No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  
                  <td style={{ padding: "10px" }}>{u.id}</td>
                  <td style={{ padding: "10px" }}>{u.name}</td>
                  <td style={{ padding: "10px" }}>{u.email}</td>
                  <td style={{ padding: "10px" }}>
                    {u.role || "USER"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default AdminUsers;