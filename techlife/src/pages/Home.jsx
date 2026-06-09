import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ui/ProductCard";
import { ArrowRight, ChevronRight, Shield, Truck, RefreshCw, Headphones, Zap } from "lucide-react";

const CATS = [
  { name:"Électronique", slug:"Electronique", img:"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80", desc:"Gadgets & Tech" },
  { name:"Sport & Fitness", slug:"Sport", img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", desc:"Équipements Pro" },
  { name:"Lifestyle", slug:"Lifestyle", img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", desc:"Accessoires & Style" },
];

const TRUST = [
  { icon: Truck, title:"Livraison en France", desc:"10 à 30 jours ouvrés" },
  { icon: Shield, title:"Paiement sécurisé", desc:"SSL & 3D Secure" },
  { icon: RefreshCw, title:"Retours 30 jours", desc:"Remboursement garanti" },
  { icon: Headphones, title:"Support 7j/7", desc:"Réponse sous 24h" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "products"), where("status","==","active"), limit(8));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=70" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5" />Nouveautés disponibles
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] mb-6">
              Tech. Sport.<br />
              <span className="text-orange-500">Lifestyle.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              Les meilleurs produits sélectionnés pour vous. Qualité premium, prix imbattables, livraison express.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/shop" className="inline-flex items-center gap-2 px-7 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 text-sm">
                Découvrir la boutique <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?cat=Electronique" className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm text-sm">
                ⚡ Électronique
              </Link>
              <Link to="/shop?cat=Sport" className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm text-sm">
                💪 Sport & Fitness
              </Link>
              <Link to="/shop?cat=Lifestyle" className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm text-sm">
                ✨ Lifestyle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map(t => (
              <div key={t.title} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <t.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Collections</p>
            <h2 className="text-3xl font-black text-gray-900">Nos catégories</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATS.map((cat, i) => (
            <Link key={cat.slug} to={`/shop?cat=${cat.slug}`}
              className={`group relative overflow-hidden rounded-3xl ${i === 0 ? "md:row-span-1" : ""}`}
              style={{ minHeight: i === 0 ? "420px" : "280px" }}>
              <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">{cat.desc}</p>
                <h3 className="text-2xl font-black text-white mb-3">{cat.name}</h3>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl group-hover:bg-orange-500 transition-colors">
                  Explorer <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Sélection</p>
              <h2 className="text-3xl font-black text-gray-900">Produits populaires</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_,i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-5xl mb-4">📦</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Boutique en préparation</h3>
              <p className="text-gray-400 text-sm">Les produits seront disponibles très bientôt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all text-sm">
              Voir tous les produits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-gray-900 rounded-3xl px-8 py-14 text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=50')] bg-cover bg-center opacity-10" />
          <div className="relative">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Offre limitée</p>
            <h2 className="text-4xl font-black text-white mb-3">Livraison offerte</h2>
            <p className="text-gray-300 text-lg mb-8">Sur tous vos articles — Livraison en France en <span className="font-black text-white">10 à 30 jours</span></p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30">
              Profiter de l'offre <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
