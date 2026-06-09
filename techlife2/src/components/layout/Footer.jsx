import { Link } from "react-router-dom";
import { Mail, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <span className="text-2xl font-black text-white tracking-tight">TECH<span className="text-orange-500">LIFE</span></span>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">Votre destination pour les meilleurs produits Tech, Sport et Lifestyle. Qualité garantie, prix imbattables.</p>
            <div className="flex gap-3 mt-5">
              {[[Instagram,"#"],[Twitter,"#"],[Facebook,"#"],[Youtube,"#"]].map(([Icon,h],i) => (
                <a key={i} href={h} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title:"Boutique", links:[["Électronique","/shop?cat=Electronique"],["Sport & Fitness","/shop?cat=Sport"],["Lifestyle","/shop?cat=Lifestyle"],["Nouveautés","/shop"],["Promotions","/shop"]] },
            { title:"Aide", links:[["FAQ","#"],["Suivi commande","#"],["Retours & remboursements","#"],["Livraison","#"],["Contact","#"]] },
            { title:"Compte", links:[["Se connecter","/login"],["Créer un compte","/register"],["Mes commandes","/account/orders"],["Mes favoris","#"],["Mon profil","/account"]] },
          ].map(col => (
            <div key={col.title}>
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(([l,h]) => <li key={l}><Link to={h} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-y border-gray-800 py-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div><h3 className="text-white font-bold">Rejoignez notre newsletter</h3><p className="text-sm text-gray-400 mt-1">Offres exclusives, nouveautés, conseils tech.</p></div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input placeholder="votre@email.com" className="flex-1 sm:w-64 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 placeholder-gray-500" />
              <button className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors whitespace-nowrap">S'inscrire</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">© 2026 TechLife Store. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            {["Mentions légales","CGV","Confidentialité"].map(l => <Link key={l} to="#" className="text-xs text-gray-500 hover:text-gray-300">{l}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
