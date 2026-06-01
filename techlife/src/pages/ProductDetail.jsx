import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ui/ProductCard";
import { ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronRight, Plus, Minus, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

const DEMO = {
  id:"1", title:"Écouteurs Sans Fil Pro", price:59.99, cost:18,
  image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  category:"Électronique", stock:45, status:"active",
  description:"Des écouteurs sans fil de haute qualité avec réduction de bruit active. Profitez d'un son cristallin pendant 30 heures d'autonomie. Design ergonomique pour un confort optimal. Compatible avec tous vos appareils Bluetooth.",
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() };
          setProduct(p);
          // Related
          const q = query(collection(db, "products"), where("category", "==", p.category), where("status", "==", "active"), limit(4));
          const relSnap = await getDocs(q);
          setRelated(relSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.id !== id));
        } else setProduct(DEMO);
      } catch { setProduct(DEMO); }
      finally { setLoading(false); }
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
        <div className="space-y-4">{Array(6).fill(0).map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" style={{width:`${70+Math.random()*30}%`}} />)}</div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-400">Produit introuvable.</div>;

  const discount = Math.round(((product.price * 1.3 - product.price) / (product.price * 1.3)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-purple-600">Accueil</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/shop" className="hover:text-purple-600">Boutique</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/shop?cat=${encodeURIComponent(product.category)}`} className="hover:text-purple-600">{product.category}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
            {product.image
              ? <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Zap className="w-24 h-24 text-purple-200" /></div>
            }
          </div>
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {[["✅ Qualité garantie","green"],["🚚 Livraison 2-7j","blue"],["↩️ Retours 30j","amber"]].map(([l,c]) => (
              <span key={l} className={`px-3 py-1.5 bg-${c}-50 text-${c}-700 text-xs font-semibold rounded-xl border border-${c}-100`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full mb-3">{product.category}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-tight">{product.title}</h1>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}</div>
            <span className="text-sm text-gray-500 font-medium">4.8 (127 avis)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-gray-900">${product.price?.toFixed(2)}</span>
            <span className="text-xl text-gray-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-black rounded-xl">-{discount}%</span>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "Produit de haute qualité sélectionné pour sa durabilité et ses performances. Livraison rapide et service client disponible 7j/7 pour toute question."}
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 10
              ? <><div className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-sm text-green-600 font-semibold">En stock ({product.stock} disponibles)</span></>
              : product.stock > 0
              ? <><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /><span className="text-sm text-amber-600 font-semibold">Plus que {product.stock} en stock !</span></>
              : <><div className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-sm text-red-600 font-semibold">Rupture de stock</span></>
            }
          </div>

          {/* Qty + Add */}
          {product.stock > 0 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-700">Quantité :</p>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="p-2.5 hover:bg-gray-100 transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 py-2.5 text-sm font-bold min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="p-2.5 hover:bg-gray-100 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <button onClick={handleAddToCart}
                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg ${added ? "bg-green-600 text-white shadow-green-200" : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200"}`}>
                {added ? <><Check className="w-5 h-5" />Ajouté au panier !</> : <><ShoppingCart className="w-5 h-5" />Ajouter au panier — ${(product.price * qty).toFixed(2)}</>}
              </button>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3">
            {[[Truck,"Livraison 2-7j"],[Shield,"Paiement sécurisé"],[RefreshCw,"Retours 30j"]].map(([Icon,l]) => (
              <div key={l} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                <Icon className="w-5 h-5 text-purple-500" />
                <p className="text-xs font-semibold text-gray-600">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-6">Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
