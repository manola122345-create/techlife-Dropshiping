import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ui/ProductCard";
import { Search, SlidersHorizontal, X, ShoppingBag } from "lucide-react";

const CATS = ["Tout","Electronique","Sport","Lifestyle"];
const SORTS = [["newest","Plus récents"],["price_asc","Prix croissant"],["price_desc","Prix décroissant"]];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("cat") || "Tout");
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db,"products"), where("status","==","active"));
        const snap = await getDocs(q);
        setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCat(searchParams.get("cat") || "Tout");
  }, [searchParams]);

  // Mapping pour accepter les 2 langues
  const catMap = {
    "Electronique": ["Electronique", "Electronics", "Electronic"],
    "Sport": ["Sport", "Sports", "Fitness", "Sport & Fitness"],
    "Lifestyle": ["Lifestyle", "Life Style", "Fashion", "Mode", "Maison", "Home"]
  };

  let filtered = all.filter(p => {
    const matchCat = cat === "Tout" || 
      p.category === cat || 
      (catMap[cat] && catMap[cat].includes(p.category));
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchPrice = (p.price || 0) <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  if (sort === "price_asc") filtered = [...filtered].sort((a,b) => (a.price||0)-(b.price||0));
  else if (sort === "price_desc") filtered = [...filtered].sort((a,b) => (b.price||0)-(a.price||0));

  function setParam(key, val) {
    setSearchParams(p => { if (!val || val === "Tout") p.delete(key); else p.set(key, val); return p; });
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Collection</p>
          <h1 className="text-4xl font-black">Boutique</h1>
          <p className="text-gray-400 mt-2">{filtered.length} produit(s) disponible(s)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setParam("q", e.target.value); }}
              placeholder="Rechercher..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" />
            {search && <button onClick={() => { setSearch(""); setParam("q",""); }} className="absolute right-4 top-3.5 text-gray-400"><X className="w-4 h-4"/></button>}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-orange-400 bg-gray-50 text-gray-700">
            {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border-2 rounded-2xl text-sm font-semibold transition-all ${showFilters ? "border-orange-400 text-orange-500 bg-orange-50" : "border-gray-100 text-gray-700 bg-gray-50 hover:border-orange-300"}`}>
            <SlidersHorizontal className="w-4 h-4"/>Filtres
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Prix maximum : <span className="text-orange-500 font-black">{maxPrice}€</span></p>
                <input type="range" min={5} max={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-orange-500"/>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5€</span><span>500€</span></div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Disponibilité</p>
                <div className="flex gap-2">
                  {["En stock","Tout"].map(l => (
                    <button key={l} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${l==="En stock" ? "border-orange-400 text-orange-500 bg-orange-50" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {CATS.map(c => (
            <button key={c} onClick={() => { setCat(c); setParam("cat", c === "Tout" ? "" : c); }}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${cat===c ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c === "Electronique" ? "⚡ Électronique" : c === "Sport" ? "💪 Sport & Fitness" : c === "Lifestyle" ? "✨ Lifestyle" : "Tout"}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_,i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse"/>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"/>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4"/>
            <h3 className="text-xl font-black text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-400 text-sm mb-6">Essaie une autre catégorie ou recherche.</p>
            <button onClick={() => { setSearch(""); setCat("Tout"); setSearchParams({}); }}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-orange-500 transition-colors">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
