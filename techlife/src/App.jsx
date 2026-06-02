import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import { Checkout, OrderSuccess, Login, Register, Account, MyOrders } from "./pages/OtherPages";

function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Store pages */}
            <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
            <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
            <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
            <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
            <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
            <Route path="/order-success" element={<StoreLayout><OrderSuccess /></StoreLayout>} />
            <Route path="/account" element={<StoreLayout><Account /></StoreLayout>} />
            <Route path="/account/orders" element={<StoreLayout><MyOrders /></StoreLayout>} />
            {/* Auth pages — no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Admin — no store layout */}
            <Route path="/admin" element={<Admin />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "16px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              },
              success: { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" } },
              error: { style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
