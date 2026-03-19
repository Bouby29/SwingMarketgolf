import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const products = await base44.asServiceRole.entities.Product.filter({ status: "active" }, "-created_date", 500);

        const categories = [
            "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf",
            "Accessoires", "Entraînement", "Vêtements"
        ];

        const staticPages = [
            { url: "https://swingmarketgolf.com/", priority: "1.0", changefreq: "daily" },
            { url: "https://swingmarketgolf.com/Marketplace", priority: "0.9", changefreq: "daily" },
            { url: "https://swingmarketgolf.com/Blog", priority: "0.7", changefreq: "weekly" },
            { url: "https://swingmarketgolf.com/Guides", priority: "0.7", changefreq: "weekly" },
            { url: "https://swingmarketgolf.com/QuiSommesNous", priority: "0.5", changefreq: "monthly" },
            { url: "https://swingmarketgolf.com/FAQ", priority: "0.6", changefreq: "monthly" },
            { url: "https://swingmarketgolf.com/ProfessionnelsSellers", priority: "0.6", changefreq: "monthly" },
            { url: "https://swingmarketgolf.com/CGV", priority: "0.4", changefreq: "yearly" },
            { url: "https://swingmarketgolf.com/CGU", priority: "0.4", changefreq: "yearly" },
            { url: "https://swingmarketgolf.com/Confidentialite", priority: "0.4", changefreq: "yearly" },
        ];

        const categoryPages = categories.map(cat => ({
            url: `https://swingmarketgolf.com/Marketplace?category=${encodeURIComponent(cat)}`,
            priority: "0.8",
            changefreq: "daily"
        }));

        const productPages = products.map(p => ({
            url: `https://swingmarketgolf.com/ProductDetail?id=${p.id}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: p.updated_date ? new Date(p.updated_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
        }));

        const allPages = [...staticPages, ...categoryPages, ...productPages];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

        return new Response(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600"
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});