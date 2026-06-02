import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { ShoppingBag, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="group relative bg-white">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-3">
        {product.image ? (
          <img src={product.image} alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
            <ShoppingBag className="w-12 h-12 text-orange-200" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">{product.badge}</span>}
          {product.stock > 0 && product.stock <= 10 && <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">Presque épuisé</span>}
          {product.stock === 0 && <span className="px-2.5 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-sm">Épuisé</span>}
        </div>

        {/* Add to cart on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {product.stock > 0 ? (
            <button onClick={e => { e.preventDefault(); addItem(product); }}
              className="w-full py-3 bg-gray-900 text-white text-sm font-bold hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />Ajouter au panier
            </button>
          ) : (
            <div className="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold flex items-center justify-center">Indisponible</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors leading-snug mb-2">{product.title}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />)}
          <span className="text-xs text-gray-400 ml-1">({Math.floor(Math.random()*200+50)})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-gray-900">{product.price?.toFixed(2)}€</span>
          <span className="text-sm text-gray-400 line-through">{(product.price * 1.4).toFixed(2)}€</span>
          <span className="text-xs font-bold text-green-600 ml-auto">-{Math.round(((product.price * 1.4 - product.price) / (product.price * 1.4)) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
