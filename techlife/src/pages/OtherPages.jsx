import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Shield, Loader2, Check, Eye, EyeOff, Package, User, LogOut, ShoppingBag, Lock, ArrowRight, Truck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ── CHECKOUT ──────────────────────────────────────────────
export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName || "", lastName: profile?.lastName || "",
    email: user?.email || "", phone: "", address: "", city: "", zip: "", country: "France",
    cardName: "", cardNumber: "", expiry: "", cvv: ""
  });
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function placeOrder() {
    setLoading(true);
    try {
      const num = `#${Date.now().toString().slice(-6)}`;
      await addDoc(collection(db, "store_orders"), {
        orderNumber: num,
        customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, zip: form.zip, country: form.country },
        items: items.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty, image: i.image || "" })),
        subtotal, shippingCost: shipping, total, status: "pending",
        userId: user?.uid || "guest", createdAt: serverTimestamp()
      });
      clearCart();
      toast.success("Commande confirmée ! 🎉");
      navigate("/order-success");
    } catch (e) { toast.error("Erreur : " + e.message); }
    finally { setLoading(false); }
  }

  if (!items.length) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <ShoppingBag className="w-16 h-16 text-gray-200 mb-4"/>
      <h2 className="text-xl font-black text-gray-900 mb-4">Panier vide</h2>
      <Link to="/shop" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors">Voir la boutique</Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black mb-6">Finaliser la commande</h1>
          <div className="flex items-center gap-4">
            {[["1","Livraison"],["2","Paiement"],["3","Confirmation"]].map(([s,l]) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${parseInt(s)<=step?"bg-orange-500 text-white":"bg-gray-700 text-gray-400"}`}>{s}</div>
                <span className={`text-sm font-semibold hidden sm:block ${parseInt(s)<=step?"text-white":"text-gray-500"}`}>{l}</span>
                {s!=="3" && <div className="w-10 h-px bg-gray-700 hidden sm:block"/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 space-y-5">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500"/>Adresse de livraison</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[["Prénom *","firstName"],["Nom *","lastName"]].map(([l,k]) => (
                    <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input value={form[k]} onChange={e => set(k,e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                  ))}
                </div>
                {[["Email *","email","email"],["Téléphone","phone","tel"],["Adresse *","address","text"],["Ville *","city","text"]].map(([l,k,t]) => (
                  <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input type={t} value={form[k]} onChange={e => set(k,e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {[["Code postal","zip"],["Pays","country"]].map(([l,k]) => (
                    <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input value={form[k]} onChange={e => set(k,e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                  ))}
                </div>
                <button onClick={() => { if (!form.firstName||!form.email||!form.address) return toast.error("Remplis les champs requis"); setStep(2); }}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                  Continuer vers le paiement <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 space-y-5">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500"/>Informations de paiement</h2>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-semibold">
                  <Lock className="w-4 h-4 shrink-0"/>Paiement 100% sécurisé — Vos données sont protégées
                </div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Nom sur la carte *</label><input value={form.cardName} onChange={e => set("cardName",e.target.value)} placeholder="Jean Dupont" className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro de carte *</label><input value={form.cardNumber} onChange={e => set("cardNumber",e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-mono font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Expiration</label><input value={form.expiry} onChange={e => set("expiry",e.target.value)} placeholder="MM/AA" maxLength={5} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-mono font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">CVV</label><input value={form.cvv} onChange={e => set("cvv",e.target.value)} placeholder="123" maxLength={4} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-mono font-medium focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-gray-200 font-bold rounded-2xl hover:bg-gray-50 text-sm text-gray-700">← Retour</button>
                  <button onClick={placeOrder} disabled={loading} className="flex-1 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-orange-200 text-sm transition-all">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Traitement...</> : <><Shield className="w-4 h-4"/>Payer {total.toFixed(2)}€</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-3xl border border-gray-100 p-6 h-fit">
            <h3 className="font-black text-gray-900 mb-5">Votre commande</h3>
            <div className="space-y-3 mb-5">
              {items.map(i => (
                <div key={i.id} className="flex gap-3 items-center">
                  {i.image && <img src={i.image} alt="" className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"/>}
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{i.title}</p><p className="text-xs text-gray-400 mt-0.5">x{i.qty}</p></div>
                  <span className="text-sm font-black text-gray-900 shrink-0">{(i.price*i.qty).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Sous-total</span><span>{subtotal.toFixed(2)}€</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Livraison</span><span className={shipping===0?"text-green-600 font-bold":""}>{shipping===0?"Gratuite":shipping.toFixed(2)+"€"}</span></div>
              <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t-2 border-gray-200"><span>Total</span><span>{total.toFixed(2)}€</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ORDER SUCCESS ─────────────────────────────────────────
export function OrderSuccess() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
        <Check className="w-14 h-14 text-green-600"/>
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-3">Commande confirmée !</h1>
      <p className="text-gray-500 text-lg mb-2">Merci pour votre achat 🎉</p>
      <p className="text-gray-400 text-sm mb-10">Vous recevrez un email de confirmation. Livraison estimée : 2-7 jours.</p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link to="/account/orders" className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all">Suivre ma commande</Link>
        <Link to="/shop" className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all">Continuer mes achats</Link>
      </div>
    </div>
  );
}

// ── LOGIN ────────────────────────────────────────────────
export function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [show, setShow] = useState(false); const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth(); const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try { await login(email, password); toast.success("Bienvenue !"); navigate("/account"); }
    catch { toast.error("Email ou mot de passe incorrect"); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    try { await loginWithGoogle(); toast.success("Connecté !"); navigate("/account"); }
    catch { toast.error("Erreur Google"); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-3xl font-black tracking-tight text-gray-900">TECH<span className="text-orange-500">LIFE</span></span></Link>
          <h2 className="text-xl font-black text-gray-900 mt-4">Connexion</h2>
          <p className="text-gray-400 text-sm mt-1">Accédez à votre espace client</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs font-bold text-gray-400">OU</span><div className="flex-1 h-px bg-gray-200"/></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Mot de passe</label>
              <div className="relative"><input type={show?"text":"password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/>
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-gray-400">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
            <div className="flex justify-end"><Link to="/forgot-password" className="text-xs font-bold text-orange-500 hover:text-orange-600">Mot de passe oublié ?</Link></div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
              {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Connexion...</>:"Se connecter"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">Pas encore de compte ? <Link to="/register" className="text-orange-500 font-black hover:text-orange-600">Créer un compte</Link></p>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────
export function Register() {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth(); const navigate = useNavigate();
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Mots de passe différents");
    if (form.password.length < 6) return toast.error("Minimum 6 caractères");
    setLoading(true);
    try { await register(form.email, form.password, form.firstName, form.lastName); toast.success("Compte créé ! 🎉"); navigate("/account"); }
    catch (e) { toast.error(e.code==="auth/email-already-in-use"?"Email déjà utilisé":"Erreur : "+e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-3xl font-black tracking-tight text-gray-900">TECH<span className="text-orange-500">LIFE</span></span></Link>
          <h2 className="text-xl font-black text-gray-900 mt-4">Créer un compte</h2>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <button onClick={async () => { try { await loginWithGoogle(); navigate("/account"); } catch { toast.error("Erreur Google"); }}}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all mb-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs font-bold text-gray-400">OU</span><div className="flex-1 h-px bg-gray-200"/></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[["Prénom","firstName"],["Nom","lastName"]].map(([l,k]) => (
                <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input value={form[k]} onChange={e => set(k,e.target.value)} required className="w-full border-2 border-gray-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
              ))}
            </div>
            {[["Email","email","email"],["Mot de passe","password","password"],["Confirmer","confirm","password"]].map(([l,k,t]) => (
              <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input type={t} value={form[k]} onChange={e => set(k,e.target.value)} required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 disabled:opacity-60 flex items-center justify-center gap-2 transition-all mt-2">
              {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Création...</>:"Créer mon compte"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">Déjà un compte ? <Link to="/login" className="text-orange-500 font-black hover:text-orange-600">Se connecter</Link></p>
      </div>
    </div>
  );
}

// ── ACCOUNT ───────────────────────────────────────────────
export function Account() {
  const { user, profile, logout } = useAuth(); const navigate = useNavigate();
  if (!user) { navigate("/login"); return null; }
  const initials = `${profile?.firstName?.[0]||""}${profile?.lastName?.[0]||""}`.toUpperCase();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black">Mon compte</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">{initials||"?"}</div>
            <h2 className="font-black text-gray-900 text-lg">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">{user.email}</p>
            <div className="space-y-2">
              <Link to="/account/orders" className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:border-orange-400 hover:text-orange-500 transition-all"><Package className="w-4 h-4"/>Mes commandes</Link>
              <button onClick={async () => { await logout(); navigate("/"); toast.success("À bientôt !"); }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-100 text-red-500 font-bold text-sm rounded-2xl hover:border-red-300 hover:bg-red-50 transition-all"><LogOut className="w-4 h-4"/>Déconnexion</button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-orange-500"/>Informations</h3>
              <div className="grid grid-cols-2 gap-4">
                {[["Prénom",profile?.firstName],["Nom",profile?.lastName],["Email",user?.email],["Membre depuis","2024"]].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">{l}</p><p className="text-sm font-bold text-gray-800">{v||"—"}</p></div>
                ))}
              </div>
            </div>
            <div className="bg-orange-500 rounded-3xl p-6 text-white">
              <h3 className="font-black text-lg mb-1">✨ Parrainez et gagnez !</h3>
              <p className="text-orange-100 text-sm mb-4">Invitez un ami et recevez 10€ de crédit à chaque achat de sa part.</p>
              <button className="px-5 py-2.5 bg-white text-orange-500 font-black text-sm rounded-xl hover:bg-orange-50 transition-colors">Copier mon lien</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MY ORDERS ─────────────────────────────────────────────
export function MyOrders() {
  const { user } = useAuth(); const navigate = useNavigate();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    async function load() {
      try {
        const snap = await getDocs(query(collection(db,"store_orders"), where("userId","==",user.uid)));
        const data = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setOrders(data);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [user]);

  const S = { pending:"En attente", processing:"Traitement", shipped:"Expédié", delivered:"Livré", cancelled:"Annulé" };
  const SC = { pending:"bg-yellow-100 text-yellow-800", processing:"bg-blue-100 text-blue-700", shipped:"bg-indigo-100 text-indigo-800", delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700" };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black">Mes commandes</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? <div className="space-y-4">{Array(3).fill(0).map((_,i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4"/>
            <h3 className="font-black text-gray-900 text-xl mb-2">Aucune commande</h3>
            <p className="text-gray-400 text-sm mb-6">Vos commandes apparaîtront ici.</p>
            <Link to="/shop" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors text-sm">Découvrir la boutique</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-orange-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div><p className="font-black text-gray-900">{o.orderNumber}</p><p className="text-xs text-gray-400 mt-0.5">{o.createdAt?.seconds ? format(new Date(o.createdAt.seconds*1000),"d MMM yyyy",{locale:fr}) : "—"}</p></div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${SC[o.status]||"bg-gray-100 text-gray-600"}`}>{S[o.status]||o.status}</span>
                </div>
                <div className="flex gap-2 mb-4">
                  {o.items?.slice(0,4).map((item,i) => item.image && <img key={i} src={item.image} alt="" className="w-14 h-14 object-cover rounded-xl border border-gray-100"/>)}
                  {o.items?.length > 4 && <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">+{o.items.length-4}</div>}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-400">{o.items?.length} article(s)</span>
                  <span className="font-black text-gray-900 text-lg">{o.total?.toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
