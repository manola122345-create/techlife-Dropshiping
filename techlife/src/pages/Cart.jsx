import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  function applyCoupon() {
    if (coupon.toUpperCase() === "TECHLIFE20") {
      setDiscount(0.2); setCouponMsg("✅ -20% appliqué !");
    } else { setDiscount(0); setCouponMsg("❌ Code invalide"); }
  }

  const discountAmount = subtotal * discount;
  const finalTotal = total - discountAmount;

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
      <h2 className="text-2xl font-black text-gray-900 mb-3">Votre panier est vide</h2>
      <p className="text-gray-400 mb-8">Ajoutez des produits pour commencer vos achats.</p>
      <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700">
        Découvrir la boutique <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-gray-900">Mon panier <span className="text-gray-400 font-normal text-lg">({items.length} article{items.length > 1 ? "s" : ""})</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-semibold">Vider le panier</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm">
              <Link to={`/product/${item.id}`} className="shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                  : <div className="w-20 h-20 bg-purple-50 rounded-xl flex items-center justify-center"><Package className="w-8 h-8 text-purple-300" /></div>
                }
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.id}`} className="text-sm font-bold text-gray-900 hover:text-purple-600 line-clamp-2">{item.title}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2 hover:bg-gray-50"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="px-3 text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2 hover:bg-gray-50"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Free shipping banner */}
          {subtotal < 50 && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-purple-500 shrink-0" />
              <p className="text-sm text-purple-700 font-semibold">Plus que <span className="font-black">${(50 - subtotal).toFixed(2)}</span> pour la livraison gratuite !</p>
              <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden ml-2">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(subtotal / 50) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-purple-500" />Code promo</p>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="TECHLIFE20"
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              <button onClick={applyCoupon} className="px-3 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700">OK</button>
            </div>
            {couponMsg && <p className="text-xs mt-2 font-medium text-gray-600">{couponMsg}</p>}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600"><span>Sous-total</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Réduction (-{discount*100}%)</span><span className="font-semibold">-${discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm text-gray-600"><span>Livraison</span><span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>{shipping === 0 ? "Gratuite 🎉" : `$${shipping.toFixed(2)}`}</span></div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-xl text-gray-900">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="mt-5 w-full py-3.5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200 text-sm">
              Passer la commande <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop" className="mt-3 w-full py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center text-sm">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
