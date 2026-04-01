import { supabase } from "./supabase";

const TABLE_MAP = {
  Product: "products",
  Order: "orders",
  Favorite: "favorites",
  Review: "reviews",
  Bid: "bids",
  Message: "messages",
  FAQEntry: "faq_entries",
  BlogPost: "blog_posts",
  EmailHistory: "email_history",
  ShippingCarrier: "shipping_carriers",
  ShippingOffer: "shipping_offers",
  User: "profiles",
};

function makeEntity(entityName) {
  const table = TABLE_MAP[entityName] || entityName.toLowerCase() + "s";

  return {
    async list(orderBy = "-created_at", limit = 100) {
      const col = orderBy.startsWith("-") ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith("-");
      const { data, error } = await supabase
        .from(table).select("*")
        .order(col, { ascending: asc })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    async filter(filters = {}, orderBy = "-created_at", limit = 100) {
      const col = orderBy.startsWith("-") ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith("-");
      let query = supabase.from(table).select("*");
      Object.entries(filters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
      const { data, error } = await query
        .order(col, { ascending: asc })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table).select("*")
        .eq("id", id).single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table).insert(payload)
        .select().single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table).update(payload)
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  };
}

export const entities = {
  Product: makeEntity("Product"),
  Order: makeEntity("Order"),
  Favorite: makeEntity("Favorite"),
  Review: makeEntity("Review"),
  Bid: makeEntity("Bid"),
  Message: makeEntity("Message"),
  FAQEntry: makeEntity("FAQEntry"),
  BlogPost: makeEntity("BlogPost"),
  EmailHistory: makeEntity("EmailHistory"),
  ShippingCarrier: makeEntity("ShippingCarrier"),
  ShippingOffer: makeEntity("ShippingOffer"),
  User: makeEntity("User"),
};

export const auth = {
  async updateMe(payload) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non connecté");
    const { error } = await supabase
      .from("profiles").update(payload).eq("id", user.id);
    if (error) throw error;
  },

  async getMe() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();
    return data;
  },
};