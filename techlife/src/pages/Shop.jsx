import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ui/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATS = ["Tout", "Électronique", "Sport & Fitness", "Maison & Déco", "Accessoires"];
const SORTS = [["recent","Plus récents"],["price_asc","Prix croissant"],["price_desc","Prix décroissant"]];

const DEMO = [
  { id:"1", title:"Écouteurs Sans Fil Pro", price:59.99, cost:18, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", category:"Électronique", stock:45, status:"active" },
  { id:"2", title:"Montre Connectée Sport", price:89.99, cost:28, image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", category:"Électronique", stock:23, status:"active" },
  { id:"3", title:"Lampe LED Bureau RGB", price:34.99, cost:10, image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80", category:"Maison & Déco", stock:67, status:"active" },
  { id:"4", title:"Bandes de Résistance Set 5", price:29.99, cost:8, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80", category:"Sport & Fitness", stock:89, status:"active" },
  { id:"5", title:"Chargeur Rapide 65W USB-C", price:24.99, cost:8, image:"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80", category:"Électronique", stock:120, status:"active" },
  { id:"6", title:"Gourde Thermos 500ml", price:22.99, cost:7, image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", category:"Sport & Fitness", stock:54, status:"active" },
  { id:"7", title:"Support Téléphone Voiture", price:14.99, cost:4, image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", category:"Accessoires", stock:200, status:"active" },
  { id:"8", title:"Guirlande LED 10m", price:19.99, cost:6, image:"https://images.unsplash.com/photo-1549122728-f519709caa9c?w=400&q=80", category:"Maison & Déco", stock:78, status:"active" },
  { id:"9", title:"Clavier Mécanique RGB", price:79.99, cost:25, image:"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80", category:"Électronique", stock:34, status:"active" },
  { id:"10", title:"Enceinte Bluetooth Waterproof", price:44.99, cost:14, image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", category:"Électronique", stock:56, status:"active" },
  { id:"11", title:"Tapis de Yoga Premium", price:39.99, cost:12, image:"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", category:"Sport & Fitness", stock:41, status:"active" },
  { id:"12", title:"Diffuseur Huiles Essentielles", price:27.99, cost:9, image:"https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80", category:"Maison & Déco", stock:63, status:"active" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("cat") || "Tout");
  const [sort, setSort] = useState("recent");
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), where("status", "==", "active"));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(data.length > 0 ? data : DEMO);
      } catch { setProducts(DEMO); }
      finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("cat") || "Tout";
    setSearch(q); setCat(c);
  }, [searchParams]);

  let filtered = products.filter(p => {
    const matchCat = cat === "Tout" || p.category === cat;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchPrice = p.price <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  if (sort === "price_asc") filtered = [...filtered].sort((a,b) => a.price - b.price);
  else if (sort === "price_desc") filtered = [...filtered].sort((a,b) => b.price - a.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Boutique</h1>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} produit(s) trouvé(s)</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setSearchParams(p => { p.set("q", e.target.value); return p; }); }}
            placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
          {search && <button onClick={() => { setSearch(""); setSearchParams(p => { p.delete("q"); return p; }); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-gray-700">
          {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors ${showFilters ? "border-purple-500 text-purple-600 bg-purple-50" : "border-gray-200 text-gray-700 hover:border-purple-300"}`}>
          <SlidersHorizontal className="w-4 h-4" />Filtres
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Prix maximum : <span className="text-purple-600">${maxPrice}</span></p>
              <input type="range" min={5} max={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$5</span><span>$500</span></div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Disponibilité</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold border-2 border-purple-500 text-purple-600 bg-purple-50 rounded-xl">En stock</button>
                <button className="px-3 py-1.5 text-xs font-semibold border-2 border-gray-200 text-gray-600 rounded-xl hover:border-gray-300">Tous</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATS.map(c => (
          <button key={c} onClick={() => { setCat(c); setSearchParams(p => { if(c==="Tout") p.delete("cat"); else p.set("cat",c); return p; }); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${cat===c ? "bg-purple-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 text-sm">Essaie une autre recherche ou catégorie.</p>
          <button onClick={() => { setSearch(""); setCat("Tout"); }} className="mt-4 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700">Réinitialiser les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
