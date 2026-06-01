import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ui/ProductCard";
import { Zap, Shield, Truck, RefreshCw, Star, ArrowRight, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { name: "Électronique", emoji: "⚡", color: "from-blue-500 to-indigo-600", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80" },
  { name: "Sport & Fitness", emoji: "💪", color: "from-green-500 to-emerald-600", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80" },
  { name: "Maison & Déco", emoji: "🏠", color: "from-amber-500 to-orange-600", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80" },
  { name: "Accessoires", emoji: "✨", color: "from-purple-500 to-pink-600", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80" },
];

const FEATURES = [
  { icon: Truck, title: "Livraison rapide", desc: "2-7 jours partout en France" },
  { icon: Shield, title: "Paiement sécurisé", desc: "SSL & 3D Secure" },
  { icon: RefreshCw, title: "Retours 30 jours", desc: "Remboursement garanti" },
  { icon: Zap, title: "Support 24/7", desc: "On est toujours là" },
];

const TESTIMONIALS = [
  { name: "Marie D.", note: 5, text: "Qualité incroyable, livraison ultra rapide ! Je recommande à 100%.", avatar: "MD" },
  { name: "Jean-Pierre M.", note: 5, text: "Produits conformes aux photos, service client très réactif.", avatar: "JM" },
  { name: "Sarah K.", note: 4, text: "Très bon rapport qualité/prix. Je reviendrai commander sans hésiter.", avatar: "SK" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), where("status", "==", "active"), limit(8));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(data);
      } catch (e) {
        // Fallback demo products
        setProducts([
          { id: "1", title: "Écouteurs Sans Fil Pro", price: 59.99, cost: 18, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", category: "Électronique", stock: 45, status: "active" },
          { id: "2", title: "Montre Connectée Sport", price: 89.99, cost: 28, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", category: "Électronique", stock: 23, status: "active" },
          { id: "3", title: "Lampe LED Bureau RGB", price: 34.99, cost: 10, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80", category: "Maison & Déco", stock: 67, status: "active" },
          { id: "4", title: "Bandes de Résistance Set 5", price: 29.99, cost: 8, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80", category: "Sport & Fitness", stock: 89, status: "active" },
          { id: "5", title: "Chargeur Rapide 65W USB-C", price: 24.99, cost: 8, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80", category: "Électronique", stock: 120, status: "active" },
          { id: "6", title: "Gourde Thermos 500ml", price: 22.99, cost: 7, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", category: "Sport & Fitness", stock: 54, status: "active" },
          { id: "7", title: "Support Téléphone Voiture", price: 14.99, cost: 4, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", category: "Accessoires", stock: 200, status: "active" },
          { id: "8", title: "Guirlande LED 10m", price: 19.99, cost: 6, image: "https://images.unsplash.com/photo-1549122728-f519709caa9c?w=400&q=80", category: "Maison & Déco", stock: 78, status: "active" },
        ]);
      } finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />Nouveautés de la semaine
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Tech & Lifestyle<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">à prix imbattables</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">Découvrez notre sélection de produits Tech, Sport et Lifestyle. Livraison rapide, qualité garantie.</p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/50">
                Découvrir la boutique <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?cat=Électronique" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                ⚡ Électronique
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[["5,000+","Clients"],["4.9/5","Note"],["100%","Satisfaction"]].map(([v,l]) => (
                <div key={l}><p className="text-2xl font-black text-white">{v}</p><p className="text-sm text-gray-400">{l}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-sm font-bold text-gray-900">{f.title}</p><p className="text-xs text-gray-400">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl font-black text-gray-900">Catégories</h2><p className="text-gray-400 text-sm mt-1">Trouvez ce qu'il vous faut</p></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/shop?cat=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-sm hover:shadow-lg transition-all duration-300">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-3xl mb-1">{cat.emoji}</span>
                <p className="font-black text-sm sm:text-base text-center px-2">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl font-black text-gray-900">Produits phares</h2><p className="text-gray-400 text-sm mt-1">Nos meilleures ventes</p></div>
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_,i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-purple-200 text-sm font-semibold mb-2">Offre limitée</p>
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">-20% sur toute la boutique</h3>
            <p className="text-purple-200">Avec le code <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-lg">TECHLIFE20</span></p>
          </div>
          <Link to="/shop" className="px-8 py-4 bg-white text-purple-700 font-black rounded-2xl hover:bg-purple-50 transition-colors shrink-0 shadow-lg">
            J'en profite →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Ce que disent nos clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array(t.note).fill(0).map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
