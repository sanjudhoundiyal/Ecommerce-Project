import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Payment() {

  const [method, setMethod] = useState("COD");
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const handlePayment = async () => {

    try {
      await Promise.all(
        cart.map(item =>
          fetch(`http://localhost:8080/api/order-items/create?orderId=1&productId=${item.id}&quantity=${item.quantity}`, {
            method: "POST"
          })
        )
      );

      // 🔥 Save for success page
      localStorage.setItem("lastOrder", JSON.stringify(cart));

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      alert("Payment Successful ✅");

      navigate("/order-success");

    } catch (err) {
      alert("Payment Failed ❌");
    }
  };

  return (
    <div className="container mt-5">

      <h2>💳 Payment</h2>

      <div className="card p-3">

        <h5>Select Payment Method</h5>

        <div>
          <input 
            type="radio" 
            checked={method === "COD"}
            onChange={() => setMethod("COD")}
          /> Cash on Delivery
        </div>

        <div>
          <input 
            type="radio" 
            checked={method === "UPI"}
            onChange={() => setMethod("UPI")}
          /> UPI
        </div>

        <div>
          <input 
            type="radio" 
            checked={method === "CARD"}
            onChange={() => setMethod("CARD")}
          /> Debit / Credit Card
        </div>

        <hr />

        <h4>Total Payable: ₹{total}</h4>

        <button 
          className="btn btn-success w-100 mt-3"
          onClick={handlePayment}
        >
          Pay Now
        </button>

      </div>
    </div>
  );
}

export default Payment;