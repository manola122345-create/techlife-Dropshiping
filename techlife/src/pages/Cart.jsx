import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react";

const COUPONS = { "TECH20": 0.20, "SPORT10": 0.10, "LIFE15": 0.15 };

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) { setDiscount(COUPONS[code]); setCouponMsg(`✅ Code "${code}" appliqué — -${COUPONS[code]*100}% !`); }
    else { setDiscount(0); setCouponMsg("❌ Code invalide"); }
  }

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const discountAmt = subtotal * discount;
  const total = subtotal + shipping - discountAmt;

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <ShoppingBag className="w-20 h-20 text-gray-200 mb-6"/>
      <h2 className="text-2xl font-black text-gray-900 mb-3">Votre panier est vide</h2>
      <p className="text-gray-400 mb-8">Découvrez nos produits et ajoutez-les ici.</p>
      <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all">
        Continuer mes achats <ArrowRight className="w-4 h-4"/>
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black">Mon panier <span className="text-gray-400 font-normal text-xl">({items.length} article{items.length>1?"s":""})</span></h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <Link to={`/product/${item.id}`} className="shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl border border-gray-200"/>
                    : <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-200"><ShoppingBag className="w-8 h-8 text-gray-300"/></div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">{item.category}</p>
                  <Link to={`/product/${item.id}`}><h3 className="text-sm font-bold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2 mb-3">{item.title}</h3></Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button onClick={() => updateQty(item.id, item.qty-1)} className="px-3 py-2 hover:bg-gray-50 transition-colors"><Minus className="w-3.5 h-3.5"/></button>
                      <span className="px-4 py-2 text-sm font-black border-x-2 border-gray-200">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty+1)} className="px-3 py-2 hover:bg-gray-50 transition-colors"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-gray-900">{(item.price*item.qty).toFixed(2)}€</span>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {subtotal < 50 && (
              <div className="p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🚚</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-700">Plus que <span className="font-black">{(50-subtotal).toFixed(2)}€</span> pour la livraison gratuite !</p>
                  <div className="h-2 bg-orange-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{width:`${Math.min((subtotal/50)*100,100)}%`}}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-orange-500"/>Code promo</p>
              <div className="flex gap-2">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} onKeyDown={e => e.key==="Enter" && applyCoupon()}
                  placeholder="TECH20" className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-400 bg-white"/>
                <button onClick={applyCoupon} className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-orange-500 transition-colors">OK</button>
              </div>
              {couponMsg && <p className="text-xs mt-2 font-semibold text-gray-600">{couponMsg}</p>}
              <p className="text-xs text-gray-400 mt-2">Codes : TECH20 · SPORT10 · LIFE15</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-5">Récapitulatif</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Sous-total</span><span className="font-bold">{subtotal.toFixed(2)}€</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Réduction (-{discount*100}%)</span><span className="font-bold">-{discountAmt.toFixed(2)}€</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Livraison</span><span className={`font-bold ${shipping===0?"text-green-600":""}`}>{shipping===0 ? "Gratuite 🎉" : `${shipping.toFixed(2)}€`}</span></div>
                <div className="border-t-2 border-gray-100 pt-3 flex justify-between">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-2xl text-gray-900">{total.toFixed(2)}€</span>
                </div>
              </div>
              <Link to="/checkout" className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-lg text-sm">
                Passer la commande <ArrowRight className="w-4 h-4"/>
              </Link>
              <Link to="/shop" className="mt-3 w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center text-sm">
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
