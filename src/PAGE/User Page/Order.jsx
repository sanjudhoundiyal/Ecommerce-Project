import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
function OrderSuccess() {

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lastOrder")) || [];
    setOrderItems(data);
  }, []);

  const total = orderItems.reduce((sum, item) => {
    const finalPrice = item.price - (item.price * (item.discount || 0) / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  return (
    <div className="container mt-5 text-center">

      <h2 style={{ color: "green" }}>🎉 Order Placed Successfully!</h2>
      <p>Thank you for shopping ❤️</p>

      <hr />

      <h4>Order Summary</h4>

      {orderItems.map((item, index) => (
        <div key={index} className="card p-3 mb-2">

          <h5>{item.name}</h5>
          <p>Qty: {item.quantity}</p>

          <p>
            ₹{item.price} - {item.discount || 0}% OFF
          </p>

        </div>
      ))}

      <h3>Total Paid: ₹{total}</h3>

    </div>
  );
}

export default OrderSuccess;