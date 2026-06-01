import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black">TechLife Store</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Les meilleurs produits Tech & Lifestyle, livrés directement chez vous.</p>
            <div className="flex gap-3">
              {[[Instagram,"#"],[Twitter,"#"],[Facebook,"#"]].map(([Icon,href],i) => (
                <a key={i} href={href} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-white mb-4">Boutique</h3>
            <ul className="space-y-2">
              {[["Tous les produits","/shop"],["Électronique","/shop?cat=Électronique"],["Sport & Fitness","/shop?cat=Sport+%26+Fitness"],["Maison & Déco","/shop?cat=Maison+%26+Déco"],["Accessoires","/shop?cat=Accessoires"]].map(([l,h]) => (
                <li key={l}><Link to={h} className="text-gray-400 text-sm hover:text-purple-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-white mb-4">Mon compte</h3>
            <ul className="space-y-2">
              {[["Se connecter","/login"],["Créer un compte","/register"],["Mes commandes","/account/orders"],["Suivi de commande","/track"],["Retours","/returns"]].map(([l,h]) => (
                <li key={l}><Link to={h} className="text-gray-400 text-sm hover:text-purple-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400"><Mail className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />support@techlife.store</li>
              <li className="flex items-start gap-2 text-sm text-gray-400"><Phone className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />+33 1 23 45 67 89</li>
              <li className="flex items-start gap-2 text-sm text-gray-400"><MapPin className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />Paris, France</li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input placeholder="ton@email.com" className="flex-1 bg-gray-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500" />
                <button className="px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700">OK</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 TechLife Store. Tous droits réservés.</p>
          <div className="flex gap-4">
            {["CGV","Confidentialité","Mentions légales"].map(l => (
              <Link key={l} to="#" className="text-gray-500 text-xs hover:text-gray-300">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
