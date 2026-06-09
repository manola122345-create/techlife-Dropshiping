import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { ShoppingBag, Search, Menu, X, User, Package, LogOut, ChevronDown, Settings } from "lucide-react";
import toast from "react-hot-toast";

const CATS = [
  { label: "Électronique", slug: "Electronique", desc: "Gadgets, audio, tech" },
  { label: "Sport & Fitness", slug: "Sport", desc: "Équipements, vêtements" },
  { label: "Lifestyle", slug: "Lifestyle", desc: "Accessoires, bien-être" },
];

export default function Navbar() {
  const { count } = useCart();
  const { user, profile, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const navigate = useNavigate();
  const userRef = useRef(); const catRef = useRef();

  useEffect(() => {
    const h = e => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function handleLogout() { await logout(); toast.success("À bientôt !"); navigate("/"); }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) { navigate(`/shop?q=${encodeURIComponent(query)}`); setSearchOpen(false); setQuery(""); }
  }

  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gray-900 text-white text-center py-2.5 text-xs font-medium tracking-wider">
        🚀 Livraison offerte en France · 10 à 30 jours ouvrés · Retours sous 30 jours
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-black tracking-tight text-gray-900">TECH<span className="text-orange-500">LIFE</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6 flex-1">
              <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">Accueil</Link>

              {/* Categories dropdown */}
              <div className="relative" ref={catRef}>
                <button onClick={() => setCatOpen(!catOpen)} className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">
                  Catégories <ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>
                {catOpen && (
                  <div className="absolute top-8 left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {CATS.map(c => (
                      <Link key={c.slug} to={`/shop?cat=${c.slug}`} onClick={() => setCatOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group">
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600">{c.label}</p>
                          <p className="text-xs text-gray-400">{c.desc}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link to="/shop" onClick={() => setCatOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors">
                        Voir tout →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/shop" className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">Boutique</Link>
              {isAdmin && <Link to="/admin" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"><Settings className="w-3.5 h-3.5" />Admin</Link>}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative" ref={userRef}>
                  <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"><User className="w-4 h-4 text-gray-400" />Mon compte</Link>
                      <Link to="/account/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"><Package className="w-4 h-4 text-gray-400" />Mes commandes</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 font-bold"><Settings className="w-4 h-4" />Administration</Link>}
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"><LogOut className="w-4 h-4" />Déconnexion</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                  <User className="w-4 h-4" />Connexion
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center">{count}</span>
                )}
              </Link>

              <button className="lg:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" />
              {query && <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-3.5 text-gray-400"><X className="w-4 h-4" /></button>}
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            {[["Accueil","/"],["Boutique","/shop"],["Électronique","/shop?cat=Electronique"],["Sport & Fitness","/shop?cat=Sport"],["Lifestyle","/shop?cat=Lifestyle"]].map(([l,h]) => (
              <Link key={h} to={h} onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500 border-b border-gray-50 last:border-0">{l}</Link>
            ))}
            {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-sm font-bold text-orange-500 bg-orange-50">Se connecter</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-sm font-bold text-orange-600 bg-orange-50">⚙️ Administration</Link>}
          </div>
        )}
      </header>
    </>
  );
}
