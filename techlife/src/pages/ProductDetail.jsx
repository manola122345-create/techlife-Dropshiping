import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ui/ProductCard";
import { ShoppingBag, Star, Truck, Shield, RefreshCw, ChevronRight, Plus, Minus, Check, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db,"products",id));
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() };
          setProduct(p);
          const q = query(collection(db,"products"), where("category","==",p.category), where("status","==","active"), limit(4));
          const rSnap = await getDocs(q);
          setRelated(rSnap.docs.map(d => ({ id:d.id,...d.data() })).filter(r => r.id !== id));
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
    window.scrollTo(0,0);
  }, [id]);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse"/>
        <div className="space-y-5">{Array(5).fill(0).map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" style={{width:`${60+Math.random()*40}%`}}/>)}</div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-32">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Produit introuvable</h2>
      <Link to="/shop" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors">Retour à la boutique</Link>
    </div>
  );

  const oldPrice = (product.price * 1.4).toFixed(2);
  const discount = Math.round(((product.price * 1.4 - product.price) / (product.price * 1.4)) * 100);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-orange-500 font-medium">Accueil</Link>
            <ChevronRight className="w-3 h-3"/>
            <Link to="/shop" className="hover:text-orange-500 font-medium">Boutique</Link>
            <ChevronRight className="w-3 h-3"/>
            <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
              {product.image
                ? <img src={product.image} alt={product.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-24 h-24 text-gray-200"/></div>
              }
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">{product.category}</p>
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-5">{product.title}</h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s<=4?"fill-amber-400 text-amber-400":"fill-gray-200 text-gray-200"}`}/>)}</div>
              <span className="text-sm text-gray-500 font-medium">4.8 — 127 avis</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-5xl font-black text-gray-900">{product.price?.toFixed(2)}€</span>
              <span className="text-2xl text-gray-300 line-through">{oldPrice}€</span>
              <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-black rounded-xl">-{discount}%</span>
            </div>

            {/* Description */}
            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
              {product.description || "Produit de haute qualité, sélectionné avec soin pour sa durabilité et ses performances. Satisfait ou remboursé sous 30 jours."}
            </p>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-8">
              {product.stock > 10 ? (
                <><div className="w-2 h-2 bg-green-500 rounded-full"/><span className="text-sm font-semibold text-green-600">En stock ({product.stock} dispo.)</span></>
              ) : product.stock > 0 ? (
                <><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"/><span className="text-sm font-bold text-amber-600">⚡ Plus que {product.stock} en stock !</span></>
              ) : (
                <><div className="w-2 h-2 bg-red-500 rounded-full"/><span className="text-sm font-bold text-red-600">Rupture de stock</span></>
              )}
            </div>

            {/* Qty + CTA */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-gray-700">Quantité</p>
                  <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1,q-1))} className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600"><Minus className="w-4 h-4"/></button>
                    <span className="px-5 py-3 text-sm font-black border-x-2 border-gray-200 min-w-[50px] text-center">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock,q+1))} className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600"><Plus className="w-4 h-4"/></button>
                  </div>
                </div>
                <button onClick={handleAdd}
                  className={`w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all ${added ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-gray-900 text-white hover:bg-orange-500 shadow-lg shadow-gray-200"}`}>
                  {added ? <><Check className="w-5 h-5"/>Ajouté au panier !</> : <><ShoppingBag className="w-5 h-5"/>Ajouter au panier — {(product.price*qty).toFixed(2)}€</>}
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {[[Truck,"Livraison 2-7j"],[Shield,"Sécurisé SSL"],[RefreshCw,"Retours 30j"]].map(([Icon,l]) => (
                <div key={l} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl text-center">
                  <Icon className="w-5 h-5 text-orange-500"/>
                  <p className="text-xs font-bold text-gray-600">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-8">Vous pourriez aimer</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
