import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { ShoppingCart, Search, Menu, X, User, Package, LogOut, ChevronDown, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { count } = useCart();
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const categories = ["Électronique", "Sport & Fitness", "Maison & Déco", "Accessoires"];

  async function handleLogout() {
    await logout();
    toast.success("Déconnecté");
    navigate("/");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) { navigate(`/shop?q=${encodeURIComponent(query)}`); setSearchOpen(false); setQuery(""); }
  }

  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      {/* Top bar */}
      <div className="bg-purple-700 text-white text-center py-2 text-xs font-medium tracking-wide">
        🚀 Livraison gratuite dès $50 · Retours sous 30 jours · Support 24/7
      </div>

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900">TechLife</span>
              <span className="hidden sm:block text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">Store</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">Accueil</Link>
              <Link to="/shop" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">Boutique</Link>
              {categories.map(c => (
                <Link key={c} to={`/shop?cat=${encodeURIComponent(c)}`} className="text-sm text-gray-500 hover:text-purple-600 transition-colors">{c}</Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* User */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4 text-gray-400" />Mon compte</Link>
                      <Link to="/account/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Package className="w-4 h-4 text-gray-400" />Mes commandes</Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Déconnexion</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                  <User className="w-4 h-4" />Connexion
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{count}</span>
                )}
              </Link>

              {/* Mobile menu */}
              <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {[["Accueil","/"],["Boutique","/shop"],["Mon compte","/account"],["Mes commandes","/account/orders"]].map(([l,h]) => (
              <Link key={h} to={h} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl">{l}</Link>
            ))}
            {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 rounded-xl">Se connecter</Link>}
          </div>
        )}
      </nav>
    </>
  );
}
