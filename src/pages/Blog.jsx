import React, { useState } from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

function BlogCard({ post, featured = false }) {
  return (
    <Link to={createPageUrl("BlogPost") + `?id=${post.id}`} className="group block card-hover">
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex ${featured ? "flex-col md:flex-row" : "flex-col"}`}>
        <div className={`overflow-hidden shrink-0 ${featured ? "md:w-1/2 aspect-[4/3] md:aspect-auto" : "aspect-[16/10]"}`}>
          <img
            src={post.cover_image || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=500&fit=crop"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className={`p-5 flex flex-col justify-center ${featured ? "md:p-8" : ""}`}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.category && (
              <Badge className={`${categoryColors[post.category]} border-0 text-xs px-3 py-0.5`}>
                {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
              </Badge>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.created_date), "d MMM yyyy", { locale: fr })}
            </span>
            {post.author && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <User className="w-3 h-3" /> {post.author}
              </span>
            )}
          </div>
          <h2 className={`font-bold text-gray-900 group-hover:text-[#1B5E20] transition-colors mb-2 ${featured ? "text-xl md:text-2xl" : "text-lg"}`}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
          )}
          <span className="text-[#1B5E20] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Lire l'article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, "-created_date", 50),
  });

  const filtered = activeCategory ? posts.filter(p => p.category === activeCategory) : posts;
  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SEOHead
        title="Blog Golf - Conseils, guides et actualités"
        description="Découvrez nos articles de blog sur le golf : conseils techniques, guides d'achat, comparatifs de matériel et actualités du monde du golf."
        url="https://swingmarketgolf.com/Blog"
      />
      {/* Header */}
      <div className="golf-gradient py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Blog Golf SwingMarket</h1>
          <h2 className="text-green-200 mt-3 text-lg">Conseils, guides, comparatifs et actualités du monde du golf</h2>
        </div>
      </div>

      {/* Category filters */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? "bg-[#1B5E20] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-[16/10] shimmer" />
                <div className="p-5 space-y-2">
                  <div className="h-3 w-20 shimmer rounded" />
                  <div className="h-5 w-3/4 shimmer rounded" />
                  <div className="h-3 w-full shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-900">Aucun article dans cette catégorie</h3>
            <button onClick={() => setActiveCategory("")} className="text-[#1B5E20] mt-2 text-sm hover:underline">
              Voir tous les articles
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured post */}
            {featured && (
              <div>
                <BlogCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {rest.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}