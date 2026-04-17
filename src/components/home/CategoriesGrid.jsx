import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslate } from "../providers/TranslationProvider";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoriesGrid() {
  const { t } = useTranslate();
  const scrollRef = useRef(null);

  const CATEGORIES = [
    { name: t("nav.golfClubs"),  icon: "🏌️", image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=300&h=200&fit=crop", count: "250+",  page: t("common.marketplace") },
    { name: t("nav.golfBalls"), icon: "⛳",  image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=300&h=200&fit=crop", count: "180+",  page: t("common.marketplace") },
    { name: t("nav.carts"),       icon: "🛒",  image: "https://www.routedugolf.com/blog/wp-content/uploads/2024/10/chariot-de-golf.webp", count: "85+",   page: t("common.marketplace") },
    { name: t("nav.bags"),   icon: "🎒",  image: "https://img-4.linternaute.com/DiXViOrXa2dyTrLk6iE6j6iliLk=/1500x/smart/926bb9ebf34744978cb60453dbbbb006/ccmcms-linternaute/10773860.jpg", count: "120+",  page: t("common.marketplace") },
    { name: t("nav.accessories"),    icon: "🧤",  image: "https://img.freepik.com/photos-gratuite/vue-balles-golf-autres-accessoires_23-2150424605.jpg?semt=ais_wordcount_boost&w=740&q=80", count: "200+",  page: t("common.marketplace") },
    { name: t("nav.training"),   icon: "🎯",  image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&h=200&fit=crop", count: "95+",   page: t("common.marketplace") },
    { name: t("nav.clothing"),      icon: "👕",  image: "https://www.ker-sun.com/cdn/shop/files/vetement-anti-uv-golf-homme-upf-50-ker-sun-desktop_c3712276-0731-4af4-9d2b-51cb9f901726.jpg?v=1734345495&width=2048", count: "300+",  page: t("common.marketplace") },
    { name: "Blog",           icon: "📝",  image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop", count: "Articles", page: "Blog" },
  ];

  const scroll = (dir) => {
    scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section className="w-full py-6 md:py-12 bg-gray-50">
      <div className="px-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('home.categories_title')}</h2>
          <p className="text-gray-500 mt-1 text-sm">{t('home.categories_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-6 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            to={cat.page === "Blog" ? createPageUrl("Blog") : createPageUrl(t("common.marketplace")) + `?category=${encodeURIComponent(cat.name)}`}
            className="group relative overflow-hidden rounded-2xl card-hover shrink-0"
            style={{ width: "300px", height: "240px" }}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <h3 className="text-white font-semibold text-base">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}