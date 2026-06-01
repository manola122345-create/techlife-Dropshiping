import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { ShoppingCart, Star, Zap } from "lucide-react";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const profit = ((product.price - product.cost) / product.price * 100).toFixed(0);
  const isNew = product.createdAt?.seconds > Date.now() / 1000 - 604800;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-50 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
              <Zap className="w-16 h-16 text-purple-200" />
            </div>
          )}
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">Nouveau</span>}
          {product.stock < 10 && product.stock > 0 && <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">Presque épuisé</span>}
          {product.stock === 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">Épuisé</span>}
        </div>
        {/* Quick add hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={e => { e.preventDefault(); addItem(product); }}
              className="w-full py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 shadow-lg">
              <ShoppingCart className="w-4 h-4" />Ajouter au panier
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-purple-500 font-semibold mb-1 uppercase tracking-wide">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors leading-snug mb-2">{product.title}</h3>
        </Link>
        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
          <span className="text-xs text-gray-400 ml-1">(4.{Math.floor(Math.random()*9)+1})</span>
        </div>
        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-gray-900">${product.price?.toFixed(2)}</span>
            {product.cost && <span className="text-xs text-gray-400 line-through ml-2">${(product.price * 1.3).toFixed(2)}</span>}
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">-{profit}%</span>
        </div>
      </div>
    </div>
  );
}
