import React from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react";

const ARTICLES = [
  { id: 1, category: "guides", title: "Comment bien choisir son driver d'occasion : le guide complet 2026", author: "Thomas Lefebvre", date: "2 avril 2026", read_time: "8 min", cover: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&h=600&fit=crop", body: "Le driver est souvent le premier club que l'on cherche à améliorer. C'est aussi le plus coûteux neuf — entre 300€ et 700€ pour un modèle récent de marque. L'occasion permet de diviser ce budget par deux ou trois, à condition de savoir ce que l'on achète.\n\n## Le loft : la variable la plus importante\n\nLe loft du driver (exprimé en degrés) détermine la trajectoire de la balle. Un loft de 9° convient aux joueurs avec une vitesse de swing élevée (plus de 100 mph), tandis qu'un loft de 10.5° ou 12° sera plus adapté aux joueurs intermédiaires. La plupart des drivers modernes sont réglables, ce qui est un atout considérable en occasion.\n\n## Le shaft : flex et poids\n\nLe flex du shaft (L, A, R, S, X) doit correspondre à votre vitesse de swing. Un shaft trop rigide pour votre swing donnera des coups trop bas et peu de distance. Un shaft trop souple produira des balles trop hautes et difficiles à contrôler. Pour la plupart des amateurs, un flex Regular (R) ou Stiff (S) sera adapté.\n\n## Les grandes marques d'occasion\n\n**TaylorMade** : Les séries M (M1, M2, M4, M6) et SIM offrent un excellent rapport qualité/prix en occasion. Les têtes sont larges et pardonnantes.\n\n**Callaway** : Les séries Epic et Rogue sont excellentes. Le jailbreak technology améliore significativement la vitesse de balle.\n\n**Titleist** : Plus orientées joueurs confirmés, les séries TS2 et TS3 sont précises mais moins pardonnantes.\n\n**Ping** : La série G (G400, G410, G425) est réputée pour sa facilité d'utilisation et sa longévité.\n\n## Ce qu'il faut vérifier avant d'acheter\n\n1. **L'état de la face** : des égratignures légères sont normales, mais une face bosselée ou marquée profondément peut affecter les performances\n2. **Le grip** : un grip usé coûte 8-10€ à remplacer, ce n'est pas rédhibitoire\n3. **Le shaft** : vérifiez l'absence de micro-fissures, surtout près du hosel\n4. **La visserie** : sur les drivers réglables, vérifiez que la vis de réglage fonctionne\n\n## Notre recommandation\n\nPour un budget de 80-150€, visez un TaylorMade M4 ou un Callaway Rogue de 2018-2020. Pour 150-250€, un TaylorMade SIM ou un Callaway Epic Speed récent vous donnera des performances proches du neuf." },
  { id: 2, category: "conseils", title: "Balles de golf d'occasion : vaut-il vraiment la peine d'en acheter ?", author: "Marie Dupont", date: "28 mars 2026", read_time: "5 min", cover: "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=1200&h=600&fit=crop", body: "La question revient régulièrement chez les golfeurs : les balles d'occasion valent-elles vraiment le coup ? La réponse est oui — mais avec des nuances importantes.\n\n## Le marché des balles récupérées\n\nEn France, plusieurs millions de balles sont récupérées chaque année dans les lacs, ruisseaux et zones de rough des parcours de golf. Ces balles sont nettoyées, triées par marque et condition, puis revendues à des prix très attractifs.\n\n## Les grades de qualité\n\nLes balles d'occasion sont généralement classées en trois catégories :\n\n**Grade A (Mint)** : Balles quasi neuves, sans marques visibles. Elles ont souvent été perdues après un ou deux coups. Performance identique au neuf.\n\n**Grade B (Good)** : Légères marques d'utilisation, quelques égratignures superficielles. Performance très proche du neuf pour la grande majorité des coups.\n\n**Grade C (Practice)** : Marques plus visibles, décolorations possibles. Idéales pour l'entraînement, moins adaptées pour la compétition.\n\n## Ce qu'il faut savoir sur les performances\n\nUne balle de golf Titleist Pro V1 grade A récupérée offre des performances quasi identiques à une neuve pour les amateurs. Les tests montrent une différence de distance de 1 à 3 yards maximum — imperceptible dans la pratique.\n\nEn revanche, une balle qui a séjourné longtemps dans l'eau peut voir sa couverture se délaminer, ce qui affecte le spin et donc le contrôle autour du green.\n\n## Notre verdict\n\nPour l'entraînement et les parties récréatives, les balles grade A ou B représentent une économie de 50 à 70% sans compromis sur les performances. Achetez des Titleist Pro V1, Callaway Chrome Soft ou TaylorMade TP5 en grade A pour le meilleur rapport qualité/prix." },
  { id: 3, category: "comparatifs", title: "Top 10 des putters d\'occasion à moins de 100€ en 2026", author: "Lucas Martin", date: "22 mars 2026", read_time: "10 min", cover: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Top 10 des putters d\'occasion à moins de 100€ en 2026. Article complet bientôt disponible." },
  { id: 4, category: "conseils", title: "5 conseils pour vendre vos clubs de golf au meilleur prix", author: "Thomas Lefebvre", date: "15 mars 2026", read_time: "6 min", cover: "https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&h=600&fit=crop", body: "Contenu de l\'article : 5 conseils pour vendre vos clubs de golf au meilleur prix. Article complet bientôt disponible." },
  { id: 5, category: "guides", title: "Fers forgés vs fers coulés : quelle différence pour quel niveau ?", author: "Marie Dupont", date: "8 mars 2026", read_time: "7 min", cover: "https://images.unsplash.com/photo-1530028828-25e6698533b9?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Fers forgés vs fers coulés : quelle différence pour quel niveau ?. Article complet bientôt disponible." },
  { id: 6, category: "actualites", title: "Le marché du golf d\'occasion en France : état des lieux 2026", author: "SwingMarket", date: "1 mars 2026", read_time: "4 min", cover: "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Le marché du golf d\'occasion en France : état des lieux 2026. Article complet bientôt disponible." },
  { id: 7, category: "guides", title: "Bien choisir son chariot de golf électrique d\'occasion", author: "Lucas Martin", date: "22 février 2026", read_time: "6 min", cover: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Bien choisir son chariot de golf électrique d\'occasion. Article complet bientôt disponible." },
  { id: 8, category: "conseils", title: "Entretien de vos clubs : les bons gestes pour préserver leur valeur", author: "Marie Dupont", date: "14 février 2026", read_time: "5 min", cover: "https://images.unsplash.com/photo-1571553207709-5fe35a2a3aea?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Entretien de vos clubs : les bons gestes pour préserver leur valeur. Article complet bientôt disponible." },
  { id: 9, category: "comparatifs", title: "Comparatif : les meilleurs sacs de golf voyage d\'occasion", author: "Thomas Lefebvre", date: "5 février 2026", read_time: "8 min", cover: "https://images.unsplash.com/photo-1610727948975-6a4f9fb5f17f?w=1200&h=600&fit=crop", body: "Contenu de l\'article : Comparatif : les meilleurs sacs de golf voyage d\'occasion. Article complet bientôt disponible." },
];

const categoryColors = {
  conseils: "bg-green-100 text-green-800",
  guides: "bg-blue-100 text-blue-800",
  actualites: "bg-purple-100 text-purple-800",
  comparatifs: "bg-amber-100 text-amber-800",
};
const categoryLabels = { conseils: "Conseils", guides: "Guides", actualites: "Actualités", comparatifs: "Comparatifs" };

export default function BlogPost() {
  const [params] = useSearchParams();
  const id = parseInt(params.get("id"));
  const post = ARTICLES.find(a => a.id === id);

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Article introuvable.</p>
      <Link to="/Blog" className="text-[#1B5E20] font-semibold hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Retour au blog</Link>
    </div>
  );

  const paragraphs = post.body.split("\\n\\n");

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={post.cover} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <Link to="/Blog" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour au blog
            </Link>
            <span className={"inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 " + categoryColors[post.category]}>
              {categoryLabels[post.category]}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time} de lecture</span>
        </div>
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((p, i) => {
            if (p.startsWith("## ")) return <h2 key={i} className="text-2xl font-black text-gray-900 mt-8 mb-4">{p.replace("## ", "")}</h2>;
            if (p.startsWith("**")) return <p key={i} className="text-gray-700 leading-relaxed mb-4 font-semibold">{p.replace(/\*\*/g, "")}</p>;
            return <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>;
          })}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link to="/Blog" className="inline-flex items-center gap-2 text-[#1B5E20] font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </Link>
        </div>
      </div>
    </div>
  );
}