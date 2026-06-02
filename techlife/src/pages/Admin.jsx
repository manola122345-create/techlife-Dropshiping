import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, X, Save, Loader2, Package, ShoppingCart, BarChart3, Store, Search, Check, RefreshCw, Eye, EyeOff } from "lucide-react";

const CATS = ["Electronique","Sport","Lifestyle"];
const STATUSES_ORDER = { pending:"En attente", processing:"Traitement", shipped:"Expédié", delivered:"Livré", cancelled:"Annulé" };
const STATUS_CLS = { pending:"bg-yellow-100 text-yellow-800", processing:"bg-blue-100 text-blue-700", shipped:"bg-indigo-100 text-indigo-800", delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700" };

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?.id;
  const [f, setF] = useState({ title:"", category:"Electronique", price:"", cost:"", stock:"", image:"", description:"", status:"active", badge:"", ...product });
  const [saving, setSaving] = useState(false);
  const profit = f.price && f.cost ? (parseFloat(f.price) - parseFloat(f.cost)).toFixed(2) : null;
  const set = (k,v) => setF(p => ({...p,[k]:v}));

  async function handleSave() {
    if (!f.title || !f.price || !f.cost) return toast.error("Titre, prix et coût requis");
    setSaving(true);
    try {
      await onSave({ ...f, price: parseFloat(f.price), cost: parseFloat(f.cost), stock: parseInt(f.stock)||0 });
      toast.success(isEdit ? "Produit modifié !" : "Produit ajouté !"); onClose();
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{isEdit ? "Modifier le produit" : "Ajouter un produit"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Nom du produit *</label><input value={f.title} onChange={e => set("title",e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" placeholder="Ex: Écouteurs Pro Max"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Catégorie</label><select value={f.category} onChange={e => set("category",e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Statut</label><select value={f.status} onChange={e => set("status",e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"><option value="active">Actif</option><option value="draft">Brouillon</option></select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[["Prix (€) *","price"],["Coût (€) *","cost"],["Stock","stock"]].map(([l,k]) => (
              <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1.5">{l}</label><input type="number" step="0.01" value={f[k]} onChange={e => set(k,e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" placeholder="0"/></div>
            ))}
          </div>
          {profit && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs font-bold text-orange-500 mb-1">Profit/unité</p><p className="text-xl font-black text-orange-700">{profit}€</p></div>
              <div><p className="text-xs font-bold text-green-500 mb-1">Marge</p><p className="text-xl font-black text-green-700">{(((parseFloat(f.price)-parseFloat(f.cost))/parseFloat(f.price))*100).toFixed(0)}%</p></div>
              <div><p className="text-xs font-bold text-blue-500 mb-1">ROI</p><p className="text-xl font-black text-blue-700">{((parseFloat(profit)/parseFloat(f.cost))*100).toFixed(0)}%</p></div>
            </div>
          )}
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">URL Image</label><input value={f.image} onChange={e => set("image",e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" placeholder="https://..."/></div>
          {f.image && <img src={f.image} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-200"/>}
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Description</label><textarea value={f.description} onChange={e => set("description",e.target.value)} rows={3} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all resize-none" placeholder="Décrivez le produit..."/></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Badge (ex: Nouveau, -20%)</label><input value={f.badge} onChange={e => set("badge",e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" placeholder="Nouveau"/></div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 font-bold rounded-2xl hover:bg-gray-50 text-sm">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}{isEdit?"Enregistrer":"Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [catFilter, setCatFilter] = useState("Tout");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isAdmin) { toast.error("Accès refusé"); navigate("/"); return; }
    loadData();
  }, [user, isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      const [pSnap, oSnap] = await Promise.all([
        getDocs(collection(db,"products")),
        getDocs(query(collection(db,"store_orders"), orderBy("createdAt","desc")))
      ]);
      setProducts(pSnap.docs.map(d => ({id:d.id,...d.data()})));
      setOrders(oSnap.docs.map(d => ({id:d.id,...d.data()})));
    } catch {} finally { setLoading(false); }
  }

  async function saveProduct(data) {
    if (data.id) {
      const { id, ...rest } = data;
      await updateDoc(doc(db,"products",id), {...rest, updatedAt: serverTimestamp()});
      setProducts(prev => prev.map(p => p.id===id ? {...p,...rest} : p));
    } else {
      const ref = await addDoc(collection(db,"products"), {...data, createdAt: serverTimestamp()});
      setProducts(prev => [...prev, {id:ref.id,...data}]);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteDoc(doc(db,"products",id));
    setProducts(prev => prev.filter(p => p.id!==id));
    toast.success("Produit supprimé");
  }

  async function toggleStatus(p) {
    const ns = p.status==="active" ? "draft" : "active";
    await updateDoc(doc(db,"products",p.id), {status: ns});
    setProducts(prev => prev.map(x => x.id===p.id ? {...x,status:ns} : x));
  }

  async function updateOrderStatus(id, status) {
    await updateDoc(doc(db,"store_orders",id), {status});
    setOrders(prev => prev.map(o => o.id===id ? {...o,status} : o));
    toast.success("Statut mis à jour");
  }

  const filteredProducts = products.filter(p =>
    (catFilter==="Tout" || p.category===catFilter) &&
    (!search || p.title?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.total||0),0);
  const totalOrders = orders.length;
  const activeProducts = products.filter(p=>p.status==="active").length;
  const pendingOrders = orders.filter(o=>o.status==="pending").length;

  const tabs = [["products","Produits",Package],["orders","Commandes",ShoppingCart],["stats","Statistiques",BarChart3]];

  return (
    <div className="bg-gray-50 min-h-screen">
      {(showModal || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={saveProduct}
        />
      )}

      {/* Admin Header */}
      <div className="bg-gray-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black">TECH<span className="text-orange-500">LIFE</span></span>
              <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-black rounded-lg">ADMIN</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadData} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors"><RefreshCw className="w-4 h-4"/></button>
              <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-colors"><Store className="w-4 h-4"/>Voir la boutique</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[["Revenu total",`${totalRevenue.toFixed(2)}€`,"💰","bg-green-50 text-green-700"],["Commandes",totalOrders,"🛒","bg-blue-50 text-blue-700"],["Produits actifs",activeProducts,"📦","bg-orange-50 text-orange-700"],["En attente",pendingOrders,"⏳","bg-amber-50 text-amber-700"]].map(([l,v,e,cls]) => (
            <div key={l} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">{l}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-gray-900">{v}</p>
                <span className={`text-2xl p-2 rounded-xl ${cls}`}>{e}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(([id,l,Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab===id?"bg-gray-900 text-white shadow-sm":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <Icon className="w-4 h-4"/>{l}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-3 flex-wrap flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400"/>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50"/>
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-400 bg-gray-50">
                  <option>Tout</option>{CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={() => { setEditProduct(null); setShowModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 text-sm shrink-0">
                <Plus className="w-4 h-4"/>Ajouter un produit
              </button>
            </div>

            {loading ? (
              <div className="p-8 space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="w-14 h-14 text-gray-200 mx-auto mb-4"/>
                <h3 className="font-black text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-400 text-sm mb-5">Ajoutez votre premier produit pour commencer à vendre.</p>
                <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 text-sm">Ajouter un produit</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Produit","Catégorie","Prix","Coût","Profit","Stock","Statut",""].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {p.image ? <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"/> : <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-orange-300"/></div>}
                            <div><p className="text-sm font-bold text-gray-900 max-w-[200px] truncate">{p.title}</p>{p.badge && <span className="text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{p.badge}</span>}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">{p.category}</span></td>
                        <td className="px-5 py-4 text-sm font-black text-gray-900">{p.price?.toFixed(2)}€</td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-500">{p.cost?.toFixed(2)}€</td>
                        <td className="px-5 py-4 text-sm font-black text-green-600">+{((p.price||0)-(p.cost||0)).toFixed(2)}€</td>
                        <td className="px-5 py-4">
                          {p.stock > 10 ? <span className="text-sm font-bold text-gray-700">{p.stock}</span>
                          : p.stock > 0 ? <span className="text-sm font-bold text-amber-600">{p.stock} ⚠️</span>
                          : <span className="text-sm font-bold text-red-500">Épuisé</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${p.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                            {p.status==="active"?"Actif":"Brouillon"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleStatus(p)} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title={p.status==="active"?"Désactiver":"Activer"}>
                              {p.status==="active" ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                            <button onClick={() => setEditProduct(p)} className="p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors" title="Modifier">
                              <Edit2 className="w-4 h-4"/>
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-black text-gray-900">Commandes clients ({orders.length})</h2>
            </div>
            {loading ? (
              <div className="p-8 space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center"><ShoppingCart className="w-14 h-14 text-gray-200 mx-auto mb-4"/><h3 className="font-black text-gray-900">Aucune commande</h3></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Commande","Client","Articles","Total","Statut","Actions"].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-gray-900">{o.orderNumber}</p>
                          <p className="text-xs text-gray-400">{o.createdAt?.seconds ? new Date(o.createdAt.seconds*1000).toLocaleDateString("fr-FR") : "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-900">{o.customer?.firstName} {o.customer?.lastName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{o.customer?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-600">{o.items?.length||0} article(s)</td>
                        <td className="px-5 py-4 text-sm font-black text-gray-900">{o.total?.toFixed(2)}€</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-black ${STATUS_CLS[o.status]||"bg-gray-100 text-gray-600"}`}>{STATUSES_ORDER[o.status]||o.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className="border-2 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-orange-400 bg-gray-50 text-gray-700">
                            {Object.entries(STATUSES_ORDER).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-black text-gray-900 mb-5">Produits par catégorie</h3>
              {CATS.map(c => {
                const count = products.filter(p=>p.category===c).length;
                const pct = products.length ? Math.round((count/products.length)*100) : 0;
                return (
                  <div key={c} className="flex items-center gap-4 mb-4 last:mb-0">
                    <span className="text-sm font-bold text-gray-700 w-24">{c}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-sm font-black text-gray-700 w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-black text-gray-900 mb-5">Commandes par statut</h3>
              {Object.entries(STATUSES_ORDER).map(([s,l]) => {
                const count = orders.filter(o=>o.status===s).length;
                const pct = orders.length ? Math.round((count/orders.length)*100) : 0;
                return (
                  <div key={s} className="flex items-center gap-4 mb-4 last:mb-0">
                    <span className="text-xs font-bold text-gray-700 w-24 truncate">{l}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full transition-all" style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-sm font-black text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-orange-500 rounded-3xl p-6 text-white md:col-span-2">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div><p className="text-orange-200 text-sm font-semibold mb-1">Revenu moyen / commande</p><p className="text-3xl font-black">{orders.length ? (totalRevenue/orders.length).toFixed(2)+"€" : "—"}</p></div>
                <div><p className="text-orange-200 text-sm font-semibold mb-1">Taux de conversion</p><p className="text-3xl font-black">~3.2%</p></div>
                <div><p className="text-orange-200 text-sm font-semibold mb-1">Produits en rupture</p><p className="text-3xl font-black">{products.filter(p=>p.stock===0).length}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
