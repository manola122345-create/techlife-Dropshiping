// =================== CHECKOUT ===================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Shield, CreditCard, Truck, Check, Loader2, Lock } from "lucide-react";

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName || "", lastName: profile?.lastName || "",
    email: user?.email || "", phone: "", address: "", city: "", zip: "", country: "France",
    cardName: "", cardNumber: "", cardExpiry: "", cardCvv: ""
  });

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleOrder() {
    if (!form.firstName || !form.email || !form.address) return toast.error("Remplis tous les champs");
    setLoading(true);
    try {
      const orderNum = `#ORD-${Date.now().toString().slice(-6)}`;
      await addDoc(collection(db, "store_orders"), {
        orderNumber: orderNum,
        customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, zip: form.zip, country: form.country },
        items: items.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty, image: i.image || "" })),
        total, subtotal, shippingCost: shipping,
        status: "pending", userId: user?.uid || "guest",
        createdAt: serverTimestamp()
      });
      clearCart();
      toast.success("Commande confirmée ! 🎉");
      navigate("/order-success");
    } catch (e) { toast.error("Erreur lors de la commande : " + e.message); }
    finally { setLoading(false); }
  }

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
      <Link to="/shop" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700">Voir la boutique</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Finaliser la commande</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {[["1","Livraison"],["2","Paiement"],["3","Confirmation"]].map(([s,l]) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${parseInt(s) <= step ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
            <span className={`text-sm font-semibold hidden sm:block ${parseInt(s) <= step ? "text-purple-600" : "text-gray-400"}`}>{l}</span>
            {s !== "3" && <div className="w-8 h-px bg-gray-200 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Truck className="w-5 h-5 text-purple-500" />Adresse de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                {[["Prénom *","firstName"],["Nom *","lastName"]].map(([l,n]) => (
                  <div key={n}><label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label><input name={n} value={form[n]} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
                ))}
              </div>
              {[["Email *","email","email"],["Téléphone","phone","tel"],["Adresse *","address","text"],["Ville *","city","text"]].map(([l,n,t]) => (
                <div key={n}><label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label><input name={n} type={t} value={form[n]} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[["Code postal","zip"],["Pays","country"]].map(([l,n]) => (
                  <div key={n}><label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label><input name={n} value={form[n]} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3.5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 mt-2">Continuer →</button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-500" />Informations de paiement</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-700">
                <Lock className="w-4 h-4 shrink-0" />Paiement 100% sécurisé — SSL + 3D Secure
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom sur la carte *</label>
                <input name="cardName" value={form.cardName} onChange={handleChange} placeholder="Jean Dupont" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Numéro de carte *</label>
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Date d'expiration</label><input name="cardExpiry" value={form.cardExpiry} onChange={handleChange} placeholder="MM/AA" maxLength={5} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-mono" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label><input name="cardCvv" value={form.cardCvv} onChange={handleChange} placeholder="123" maxLength={4} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-mono" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 border-2 border-gray-200 font-semibold rounded-2xl hover:bg-gray-50 text-sm">← Retour</button>
                <button onClick={handleOrder} disabled={loading}
                  className="flex-1 py-3.5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-purple-200 text-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Traitement...</> : <><Shield className="w-4 h-4" />Payer ${total.toFixed(2)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Votre commande</h3>
          <div className="space-y-3 mb-4">
            {items.map(i => (
              <div key={i.id} className="flex gap-3 items-center">
                {i.image && <img src={i.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0" />}
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-800 truncate">{i.title}</p><p className="text-xs text-gray-400">x{i.qty}</p></div>
                <span className="text-sm font-bold text-gray-900 shrink-0">${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500"><span>Sous-total</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Livraison</span><span>{shipping === 0 ? <span className="text-green-600">Gratuite</span> : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-100"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== ORDER SUCCESS ===================
export function OrderSuccess() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">Commande confirmée ! 🎉</h1>
      <p className="text-gray-500 mb-2">Merci pour votre achat. Vous recevrez un email de confirmation sous peu.</p>
      <p className="text-sm text-gray-400 mb-8">Livraison estimée : 2-7 jours ouvrés</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/account/orders" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700">Mes commandes</Link>
        <Link to="/shop" className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50">Continuer les achats</Link>
      </div>
    </div>
  );
}

// =================== LOGIN ===================
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); toast.success("Bienvenue !"); navigate("/account"); }
    catch { toast.error("Email ou mot de passe incorrect"); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    try { await loginWithGoogle(); toast.success("Connecté avec Google !"); navigate("/account"); }
    catch { toast.error("Erreur Google"); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Connexion</h1>
          <p className="text-gray-400 mt-1">Accédez à votre compte TechLife</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">OU</span><div className="flex-1 h-px bg-gray-200"/></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
              <div className="relative"><input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-400">{showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button></div></div>
            <div className="flex justify-end"><Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-medium">Mot de passe oublié ?</Link></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Connexion...</> : "Se connecter"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Pas de compte ? <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700">Créer un compte</Link></p>
      </div>
    </div>
  );
}

// =================== REGISTER ===================
export function Register() {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Les mots de passe ne correspondent pas");
    if (form.password.length < 6) return toast.error("Mot de passe trop court (6 caractères min)");
    setLoading(true);
    try { await register(form.email, form.password, form.firstName, form.lastName); toast.success("Compte créé ! 🎉"); navigate("/account"); }
    catch (e) { toast.error(e.code === "auth/email-already-in-use" ? "Email déjà utilisé" : "Erreur : " + e.message); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    try { await loginWithGoogle(); navigate("/account"); }
    catch { toast.error("Erreur Google"); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-3xl font-black text-gray-900">Créer un compte</h1><p className="text-gray-400 mt-1">Rejoignez TechLife Store</p></div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">OU</span><div className="flex-1 h-px bg-gray-200"/></div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["Prénom","firstName"],["Nom","lastName"]].map(([l,k]) => (
                <div key={k}><label className="block text-xs font-semibold text-gray-700 mb-1">{l}</label><input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
              ))}
            </div>
            {[["Email","email","email"],["Mot de passe","password","password"],["Confirmer","confirm","password"]].map(([l,k,t]) => (
              <div key={k}><label className="block text-xs font-semibold text-gray-700 mb-1">{l}</label><input type={t} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" /></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Création...</> : "Créer mon compte"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Déjà un compte ? <Link to="/login" className="text-purple-600 font-bold">Se connecter</Link></p>
      </div>
    </div>
  );
}

// =================== ACCOUNT ===================
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { collection as col, query as q, where, getDocs, orderBy } from "firebase/firestore";
import { useEffect } from "react";
import { Package, User, LogOut, MapPin, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function Account() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate("/login"); return null; }

  async function handleLogout() { await logout(); navigate("/"); toast.success("Déconnecté"); }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Mon compte</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <h2 className="font-black text-gray-900">{profile?.firstName} {profile?.lastName}</h2>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          <div className="mt-4 space-y-2">
            <Link to="/account/orders" className="w-full flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 font-semibold text-sm rounded-xl hover:bg-purple-100">
              <Package className="w-4 h-4" />Mes commandes
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-100">
              <LogOut className="w-4 h-4" />Déconnexion
            </button>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-purple-500" />Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              {[["Prénom", profile?.firstName],["Nom", profile?.lastName],["Email", user?.email],["Téléphone", profile?.phone || "Non renseigné"]].map(([l,v]) => (
                <div key={l}><p className="text-xs text-gray-400 mb-1">{l}</p><p className="text-sm font-semibold text-gray-800">{v || "—"}</p></div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-1">🎁 Parrainez vos amis !</h3>
            <p className="text-purple-200 text-sm mb-3">Chaque ami parrainé vous offre $10 de crédit.</p>
            <button className="px-4 py-2 bg-white text-purple-600 font-bold text-sm rounded-xl hover:bg-purple-50">Partager mon code</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== MY ORDERS ===================
export function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    async function fetchOrders() {
      try {
        const snap = await getDocs(q(col(db, "store_orders"), where("userId", "==", user.uid)));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
        setOrders(data);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    }
    fetchOrders();
  }, [user]);

  const STATUS = { pending:"En attente", processing:"Traitement", shipped:"Expédié", delivered:"Livré", cancelled:"Annulé" };
  const STATUS_CLS = { pending:"bg-yellow-100 text-yellow-800", processing:"bg-blue-100 text-blue-700", shipped:"bg-indigo-100 text-indigo-700", delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700" };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Mes commandes</h1>
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">Aucune commande encore</h3>
          <p className="text-gray-400 text-sm mb-6">Vos futures commandes apparaîtront ici.</p>
          <Link to="/shop" className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 text-sm">Découvrir la boutique</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-gray-900">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{o.createdAt?.seconds ? format(new Date(o.createdAt.seconds*1000),"d MMM yyyy",{locale:fr}) : "—"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CLS[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS[o.status] || o.status}</span>
              </div>
              <div className="flex gap-2 mb-3">
                {o.items?.slice(0,3).map((item,i) => item.image && <img key={i} src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />)}
                {o.items?.length > 3 && <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+{o.items.length-3}</div>}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">{o.items?.length} article(s)</span>
                <span className="font-black text-gray-900">${o.total?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
