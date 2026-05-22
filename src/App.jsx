import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Context Provider
import { CartProvider } from "./PAGE/User Page/CartContext";

// Components
import Navbar from "./Components/Navbar";

// User Pages
import Home from "./PAGE/User Page/Home.jsx";
import SearchPage from "./PAGE/User Page/SearchPage.jsx";
import Login from "./PAGE/User Page/Login.jsx";
import Register from "./PAGE/User Page/Registration.jsx";
import Profile from "./PAGE/User Page/Profile.jsx";
import CategoryProducts from "./PAGE/User Page/CategoryProducts.jsx";
import Product from "./PAGE/User Page/Product.jsx";
import ProductDetail from "./PAGE/User Page/ProductDetails.jsx";

import Cart from "./PAGE/User Page/Cart.jsx";
import Checkout from "./PAGE/User Page/Checkout.jsx";

import Wishlist from "./PAGE/User Page/Wishlist.jsx";

import Orderhistory from "./PAGE/User Page/Orderhistory.jsx";
import OrderDetails from "./PAGE/User Page/OrderDetails.jsx";
import OrderSuccess from "./PAGE/User Page/OrderSucess.jsx";

import UserAddress from "./PAGE/User Page/UserAddress.jsx";
import AddressPage from "./PAGE/User Page/Addresspage.jsx";

// Seller Pages
import SellerAddProduct from "./PAGE/Seller Page/SalerAddProduct.jsx";
import RegisterSeller from "./PAGE/Seller Page/RegisterSeller.jsx";
import SellerLogin from "./PAGE/Seller Page/SellerLogin.jsx";
import SellerDashboard from "./PAGE/Seller Page/SellerDashboard.jsx";
import SellerProfile from "./PAGE/Seller Page/Sellerprofile.jsx";
import SellerOrders from "./PAGE/Seller Page/SellerOrders.jsx";

// Admin Pages
import AdminCategory from "./PAGE/Admin page/AdminCategory.jsx";
import AdminSubCategory from "./PAGE/Admin page/AdminSubCategory.jsx";
import AdminProduct from "./PAGE/Admin page/AdminProduct.jsx";
import AdminOrders from "./PAGE/Admin page/AdminOrders.jsx";
import AdminUsers from "./PAGE/Admin page/AdminUsers.jsx";
import AdminLogin from "./PAGE/Admin page/AdminLogin.jsx";
import Adminregister from "./PAGE/Admin page/Adminregister.jsx";
import AdminSellers from "./PAGE/Admin page/AdminSaller.jsx";
import AdminProfile from "./PAGE/Admin page/AdminProfile.jsx";
import AdminDashbord from "./PAGE/Admin page/AdminDashborad.jsx";
import AdminBanner from "./PAGE/Admin page/AdminBanner";
function Layout() {
  const location = useLocation();

  // Hide Navbar on Admin Routes
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        
        <Route path="/products" element={<Product />} />
        <Route path="/products/:slug" element={<Product />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search/:keyword" element={<SearchPage />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/orders" element={<Orderhistory />} />

        <Route path="/wishlist" element={<Wishlist />} />
<Route path="/category/:slug" element={<CategoryProducts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/address" element={<UserAddress />} />
        <Route path="/addresspage" element={<AddressPage />} />
        <Route path="/UserAddress" element={<UserAddress />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashbord />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Adminregister />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        <Route path="/admin/category" element={<AdminCategory />} />
        <Route path="/admin/subcategory" element={<AdminSubCategory />} />
        <Route path="/admin/product" element={<AdminProduct />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/sellers" element={<AdminSellers />} />

        <Route path="/admin/banner" element={<AdminBanner />} />
        {/* Seller Routes */}
        <Route path="/seller/register" element={<RegisterSeller />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<SellerAddProduct />} />
     <Route path="/seller/profile" element={<SellerProfile />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;