import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", postId],
    queryFn: () => base44.entities.BlogPost.filter({ id: postId }),
    select: d => d[0],
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-8 w-3/4 shimmer rounded mb-4" />
        <div className="h-4 w-1/3 shimmer rounded mb-8" />
        <div className="aspect-[16/9] shimmer rounded-2xl mb-8" />
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-4 shimmer rounded" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Article introuvable</h2>
        <Link to={createPageUrl("Blog")} className="text-[#1B5E20] mt-2 inline-block">Retour au blog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B5E20] mb-8">
        <ArrowLeft className="w-4 h-4" /> Retour au blog
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 mb-8 text-sm text-gray-500">
        {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>}
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(post.created_date), "d MMMM yyyy", { locale: fr })}</span>
      </div>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-2xl mb-8" />
      )}

      <div className="prose prose-green max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}