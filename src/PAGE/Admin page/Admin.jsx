import React, { useState } from "react";

function AdminAddProduct() {

  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
    discount: "",
    imageUrl: "",
    category: ""
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      name: product.name,
      price: Number(product.price),
      description: product.description,
      quantity: Number(product.quantity),
      discount: Number(product.discount),
      imageUrl: product.imageUrl,

      // 🔥 MAIN FIX (Category object)
      category: {
        id: Number(product.category)
      }
    };

    try {
      const res = await fetch("http://localhost:8080/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
      });

      const data = await res.json();
      console.log("Saved:", data);

      if (res.ok) {
        alert("Product Added Successfully ✅");

        setProduct({
          name: "",
          price: "",
          description: "",
          quantity: "",
          discount: "",
          imageUrl: "",
          category: ""
        });

      } else {
        alert("Error ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Server Error ❌");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit}>

        <input name="name" value={product.name} onChange={handleChange}
          className="form-control mb-2" placeholder="Product Name" />

        <input name="price" value={product.price} onChange={handleChange}
          className="form-control mb-2" placeholder="Price" />

        <input name="description" value={product.description} onChange={handleChange}
          className="form-control mb-2" placeholder="Description" />

        <input name="quantity" value={product.quantity} onChange={handleChange}
          className="form-control mb-2" placeholder="Quantity" />

        <input name="discount" value={product.discount} onChange={handleChange}
          className="form-control mb-2" placeholder="Discount %" />

        <input name="imageUrl" value={product.imageUrl} onChange={handleChange}
          className="form-control mb-2" placeholder="Image URL" />

        {/* 🔥 Dropdown (BEST) */}
        <select name="category" value={product.category} onChange={handleChange}
          className="form-control mb-3">
          <option value="">Select Category</option>
          <option value="1">Jeans</option>
          <option value="2">Shirt</option>
        </select>

        <button className="btn btn-success w-100">
          Add Product
        </button>
A
      </form>
    </div>
  );
}

export default AdminAddProduct;