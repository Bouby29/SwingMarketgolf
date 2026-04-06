import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, User, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HERO = "https://media.istockphoto.com/id/626097022/fr/photo/parcours-de-golf-dans-la-campagne.jpg?s=612x612&w=0&k=20&c=mO31GZsrioxtg2E9MUOQL3I_K8_u3xFDB9xaonepO8U=";

const CATEGORIES = [
  { value: "", label: "Tous les articles" },
  { value: "conseils", label: "Conseils" },
  { value: "guides", label: "Guides" },
  { value: "actualites", label: "Actualités" },
  { value: "comparatifs", label: "Comparatifs" },
];

const categoryColors = {
  conseils: "bg-green-100 text-green-800",
  guides: "bg-blue-100 text-blue-800",
  actualites: "bg-purple-100 text-purple-800",
  comparatifs: "bg-amber-100 text-amber-800",
};

const ARTICLES = [
  { id: 1, category: "guides", title: "Comment bien choisir son driver d'occasion : le guide complet 2026", excerpt: "Le driver est le club le plus cher et le plus complexe. Entre loft, flex de shaft et profil de jeu, on vous explique tout ce qu'il faut savoir avant d'acheter.", cover: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=500&fit=crop", author: "Thomas Lefebvre", date: "2 avril 2026", read_time: "8 min", featured: true },
  { id: 2, category: "conseils", title: "Balles de golf d'occasion : vaut-il vraiment la peine d'en acheter ?", excerpt: "Les balles récupérées représentent jusqu'à 70% d'économie par rapport au neuf. Mais la performance est-elle au rendez-vous ? On a testé pour vous.", cover: "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=800&h=500&fit=crop", author: "Marie Dupont", date: "28 mars 2026", read_time: "5 min", featured: false },
  { id: 3, category: "comparatifs", title: "Top 10 des putters d'occasion à moins de 100€ en 2026", excerpt: "Ping, Odyssey, TaylorMade, Cleveland... On a sélectionné les 10 meilleurs putters disponibles sur le marché de l'occasion pour tous les profils.", cover: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=500&fit=crop", author: "Lucas Martin", date: "22 mars 2026", read_time: "10 min", featured: false },
  { id: 4, category: "conseils", title: "5 conseils pour vendre vos clubs de golf au meilleur prix", excerpt: "Nettoyage, photos, description, prix de départ... Les vendeurs qui appliquent ces 5 règles vendent en moyenne 40% plus cher sur SwingMarket.", cover: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=500&fit=crop", author: "Thomas Lefebvre", date: "15 mars 2026", read_time: "6 min", featured: false },
  { id: 5, category: "guides", title: "Fers forgés vs fers coulés : quelle différence pour quel niveau ?", excerpt: "La grande question que se posent tous les golfeurs en progression. On démystifie le débat forgé/coulé avec des arguments concrets selon votre niveau.", cover: "https://images.unsplash.com/photo-1530028828-25e6698533b9?w=800&h=500&fit=crop", author: "Marie Dupont", date: "8 mars 2026", read_time: "7 min", featured: false },
  { id: 6, category: "actualites", title: "Le marché du golf d'occasion en France : état des lieux 2026", excerpt: "Le golf d'occasion connaît une croissance de 34% en France depuis 2022. SwingMarket analyse les tendances : quels clubs se vendent le mieux et à quel prix.", cover: "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=800&h=500&fit=crop", author: "SwingMarket", date: "1 mars 2026", read_time: "4 min", featured: false },
  { id: 7, category: "guides", title: "Bien choisir son chariot de golf électrique d'occasion", excerpt: "Batterie, autonomie, poids, marque... L'achat d'un chariot électrique d'occasion nécessite des vérifications précises. Notre guide complet.", cover: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=500&fit=crop", author: "Lucas Martin", date: "22 février 2026", read_time: "6 min", featured: false },
  { id: 8, category: "conseils", title: "Entretien de vos clubs : les bons gestes pour préserver leur valeur", excerpt: "Un jeu de fers bien entretenu peut conserver jusqu'à 80% de sa valeur de revente. Nettoyage des rainures, soin des grips, protection des shafts.", cover: "https://images.unsplash.com/photo-1571553207709-5fe35a2a3aea?w=800&h=500&fit=crop", author: "Marie Dupont", date: "14 février 2026", read_time: "5 min", featured: false },
  { id: 9, category: "comparatifs", title: "Comparatif : les meilleurs sacs de golf voyage d'occasion", excerpt: "Partir jouer à l'étranger sans se ruiner sur un sac neuf à 400€. On compare les meilleures options disponibles sur le marché de l'occasion.", cover: "https://images.unsplash.com/photo-1610727948975-6a4f9fb5f17f?w=800&h=500&fit=crop", author: "Thomas Lefebvre", date: "5 février 2026", read_time: "8 min", featured: false },
];

function BlogCard({ post, featured = false }) {
  const cls = featured ? "flex-col md:flex-row" : "flex-col";
  const imgCls = featured ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video";
  return (
    <Link to={"/BlogPost?id=" + post.id} className={"group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full flex cursor-pointer " + cls}>
      <div className={"overflow-hidden shrink-0 " + imgCls}>
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className={"p-5 flex flex-col justify-center flex-1 " + (featured ? "md:p-8" : "")}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={categoryColors[post.category] + " border-0 text-xs px-3 py-0.5"}>
            {CATEGORIES.find(c => c.value === post.category)?.label}
          </Badge>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time} de lecture</span>
        </div>
        <h2 className={"font-black text-gray-900 mb-2 group-hover:text-[#1B5E20] transition-colors leading-tight " + (featured ? "text-2xl md:text-3xl mb-4" : "text-lg")}>
          {post.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-gray-400 flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
          <span className="text-xs font-semibold text-[#1B5E20] flex items-center gap-1">Lire <ArrowRight className="w-3 h-3" /></span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [cat, setCat] = useState("");
  const filtered = cat ? ARTICLES.filter(a => a.category === cat) : ARTICLES;
  const featured = filtered.find(a => a.featured) || filtered[0];
  const rest = filtered.filter(a => a.id !== featured?.id);
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-96 md:h-[520px] overflow-hidden">
        <img src={HERO} alt="Blog SwingMarket" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-5 backdrop-blur-sm">
            ✍️ Le blog SwingMarket Golf
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight max-w-3xl">Conseils, guides<br /><span className="text-amber-400">& actualités golf</span></h1>
          <p className="text-lg text-white/80 max-w-xl">Tout ce qu'il faut savoir pour acheter, vendre et entretenir votre matériel golf.</p>
        </div>
      </section>
      <section className="border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={"whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 " + (cat === c.value ? "bg-[#1B5E20] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              {c.label}
            </button>
          ))}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {featured && <div className="mb-12"><p className="text-xs font-bold text-[#1B5E20] uppercase tracking-widest mb-4">À la une</p><BlogCard post={featured} featured={true} /></div>}
        {rest.length > 0 && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Tous les articles</p><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{rest.map(p => <BlogCard key={p.id} post={p} />)}</div></div>}
      </div>
      <section className="bg-gradient-to-br from-[#0F3D2E] via-[#1B5E20] to-[#2E7D32] py-16 px-4 mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Restez informé</h2>
          <p className="text-green-100 mb-8">Recevez chaque semaine nos meilleurs conseils golf et les meilleures affaires.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="votre@email.com" className="flex-1 px-4 py-3 rounded-full text-gray-900 text-sm outline-none" />
            <button className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-full text-sm">S'abonner</button>
          </div>
        </div>
      </section>
    </div>
  );
}