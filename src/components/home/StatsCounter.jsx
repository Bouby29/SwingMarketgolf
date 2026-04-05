import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

function AnimatedNumber({ target, duration = 2500 }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    startTime.current = null;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.floor(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target]);

  return <>{display.toLocaleString("fr-FR")}</>;
}

export default function StatsCounter() {
  const [stats, setStats] = useState({ products: 0, sellers: 0, sales: 0 });
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: products }, { count: sellers }, { count: sales }] = await Promise.all([
        supabase.from("produits").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profils").select("*", { count: "exact", head: true }),
        supabase.from("ordres").select("*", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      setStats({ products: products || 0, sellers: sellers || 0, sales: sales || 0 });
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#0A1F0C] py-16">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { label: "Annonces actives", value: stats.products, suffix: "" },
          { label: "Vendeurs inscrits", value: stats.sellers, suffix: "" },
          { label: "Ventes réalisées", value: stats.sales, suffix: "" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              {visible ? <AnimatedNumber target={stat.value} /> : "0"}
              <span className="text-[#C5A028]">+</span>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
